package com.elitegym.service;

import com.elitegym.dto.progress.ProgressEntryCreateRequest;
import com.elitegym.dto.progress.ProgressEntryDto;
import com.elitegym.dto.progress.ProgressEntryUpdateRequest;
import com.elitegym.dto.progress.ProgressPhotoDto;
import com.elitegym.entity.ProgressEntry;
import com.elitegym.entity.ProgressPhoto;
import com.elitegym.entity.StudentProfile;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.ProgressEntryRepository;
import com.elitegym.repository.ProgressPhotoRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressEntryRepository progressEntryRepository;
    private final ProgressPhotoRepository progressPhotoRepository;
    private final StudentProfileRepository studentProfileRepository;

    // =========================================================================
    // Helpers
    // =========================================================================

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    private void assertOwner(ProgressEntry entry, Long studentId) {
        if (!entry.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You are not authorized to access this progress entry.");
        }
    }

    private void validateMeasurements(ProgressEntryCreateRequest req) {
        boolean hasAny = anyNonNull(req.getWeightKg(), req.getHeightCm(), req.getBodyFatPct(),
                req.getMuscleMassKg(), req.getChestCm(), req.getWaistCm(), req.getHipsCm(),
                req.getArmCm(), req.getThighCm());
        boolean hasNotesOrPhotos =
                (req.getNotes() != null && !req.getNotes().isBlank()) ||
                (req.getPhotos() != null && !req.getPhotos().isEmpty());
        if (!hasAny && !hasNotesOrPhotos) {
            throw new BadRequestException(
                    "Progress entry must contain at least one measurement, note, or photo.");
        }
    }

    private static boolean anyNonNull(Object... values) {
        for (Object v : values) {
            if (v != null) {
                if (v instanceof BigDecimal bd) {
                    if (bd.compareTo(BigDecimal.ZERO) > 0) return true;
                } else {
                    return true;
                }
            }
        }
        return false;
    }

    private void applyFields(ProgressEntry target, ProgressEntryCreateRequest src) {
        target.setRecordDate(src.getRecordDate());
        target.setWeightKg(src.getWeightKg());
        target.setHeightCm(src.getHeightCm());
        target.setBodyFatPct(src.getBodyFatPct());
        target.setMuscleMassKg(src.getMuscleMassKg());
        target.setChestCm(src.getChestCm());
        target.setWaistCm(src.getWaistCm());
        target.setHipsCm(src.getHipsCm());
        target.setArmCm(src.getArmCm());
        target.setThighCm(src.getThighCm());
        target.setNotes(src.getNotes());
    }

    private void applyPhotos(ProgressEntry entry, List<ProgressEntryCreateRequest.PhotoItem> photoItems) {
        entry.getPhotos().clear();
        if (photoItems == null || photoItems.isEmpty()) return;
        for (ProgressEntryCreateRequest.PhotoItem item : photoItems) {
            ProgressPhoto photo = ProgressPhoto.builder()
                    .photoUrl(item.getPhotoUrl())
                    .caption(item.getCaption())
                    .photoType(item.getPhotoType() != null ? item.getPhotoType()
                            : com.elitegym.enums.ProgressPhotoType.PROGRESS)
                    .build();
            entry.addPhoto(photo);
        }
    }

    // =========================================================================
    // 1. CREATE
    // =========================================================================

    @Transactional
    public ProgressEntryDto createEntry(UserPrincipal principal, ProgressEntryCreateRequest request) {
        StudentProfile student = getStudentProfile(principal.getId());

        if (progressEntryRepository.existsDuplicateDate(student.getId(), request.getRecordDate(), -1L)) {
            throw new BadRequestException("A progress entry for this date already exists.");
        }

        validateMeasurements(request);

        ProgressEntry entry = ProgressEntry.builder().student(student).build();
        applyFields(entry, request);
        applyPhotos(entry, request.getPhotos());

        ProgressEntry saved = progressEntryRepository.save(entry);
        log.info("Student #{} created progress entry #{} for {}",
                student.getId(), saved.getId(), saved.getRecordDate());
        return mapToDto(saved);
    }

    // =========================================================================
    // 2. READ (History, Detail, Latest)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ProgressEntryDto> getMyProgress(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        List<ProgressEntry> entries = progressEntryRepository.findByStudentIdWithDetails(student.getId());
        return entries.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProgressEntryDto getDetail(UserPrincipal principal, Long entryId) {
        StudentProfile student = getStudentProfile(principal.getId());
        ProgressEntry entry = progressEntryRepository.findByIdWithDetails(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("ProgressEntry", "id", entryId));
        assertOwner(entry, student.getId());
        return mapToDto(entry);
    }

    @Transactional(readOnly = true)
    public ProgressEntryDto getLatest(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        List<ProgressEntry> recent = progressEntryRepository
                .findTopByStudentIdOrderByRecordDateDesc(student.getId());
        if (recent == null || recent.isEmpty()) {
            throw new ResourceNotFoundException("No progress entries found.");
        }
        ProgressEntry latest = recent.stream()
                .max(Comparator.comparing(ProgressEntry::getRecordDate))
                .orElse(recent.get(0));
        return mapToDto(latest);
    }

    // =========================================================================
    // 3. UPDATE
    // =========================================================================

    @Transactional
    public ProgressEntryDto updateEntry(UserPrincipal principal, Long entryId, ProgressEntryUpdateRequest request) {
        StudentProfile student = getStudentProfile(principal.getId());

        ProgressEntry entry = progressEntryRepository.findByIdWithDetails(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("ProgressEntry", "id", entryId));
        assertOwner(entry, student.getId());

        if (progressEntryRepository.existsDuplicateDate(student.getId(), request.getRecordDate(), entryId)) {
            throw new BadRequestException("Another progress entry for this date already exists.");
        }

        ProgressEntryCreateRequest adapter = ProgressEntryCreateRequest.builder()
                .recordDate(request.getRecordDate())
                .weightKg(request.getWeightKg())
                .heightCm(request.getHeightCm())
                .bodyFatPct(request.getBodyFatPct())
                .muscleMassKg(request.getMuscleMassKg())
                .chestCm(request.getChestCm())
                .waistCm(request.getWaistCm())
                .hipsCm(request.getHipsCm())
                .armCm(request.getArmCm())
                .thighCm(request.getThighCm())
                .notes(request.getNotes())
                .photos(request.getPhotos())
                .build();
        validateMeasurements(adapter);

        applyFields(entry, adapter);
        if (request.getPhotos() != null) {
            applyPhotos(entry, request.getPhotos());
        }

        ProgressEntry saved = progressEntryRepository.save(entry);
        log.info("Student #{} updated progress entry #{}", student.getId(), entryId);
        return mapToDto(saved);
    }

    // =========================================================================
    // 4. DELETE
    // =========================================================================

    @Transactional
    public void deleteEntry(UserPrincipal principal, Long entryId) {
        StudentProfile student = getStudentProfile(principal.getId());
        ProgressEntry entry = progressEntryRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("ProgressEntry", "id", entryId));
        assertOwner(entry, student.getId());
        progressEntryRepository.delete(entry);
        log.info("Student #{} deleted progress entry #{}", student.getId(), entryId);
    }

    // =========================================================================
    // MAPPING
    // =========================================================================

    private ProgressEntryDto mapToDto(ProgressEntry e) {
        List<ProgressPhotoDto> photoDtos = (e.getPhotos() == null) ? Collections.emptyList()
                : e.getPhotos().stream()
                .sorted(Comparator.comparing(ProgressPhoto::getId))
                .map(p -> ProgressPhotoDto.builder()
                        .id(p.getId())
                        .photoUrl(p.getPhotoUrl())
                        .caption(p.getCaption())
                        .photoType(p.getPhotoType())
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ProgressEntryDto.builder()
                .id(e.getId())
                .studentId(e.getStudent().getId())
                .recordDate(e.getRecordDate())
                .weightKg(e.getWeightKg())
                .heightCm(e.getHeightCm())
                .bodyFatPct(e.getBodyFatPct())
                .muscleMassKg(e.getMuscleMassKg())
                .chestCm(e.getChestCm())
                .waistCm(e.getWaistCm())
                .hipsCm(e.getHipsCm())
                .armCm(e.getArmCm())
                .thighCm(e.getThighCm())
                .notes(e.getNotes())
                .photos(photoDtos)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
