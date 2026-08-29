package com.elitegym.service;

import com.elitegym.dto.progress.ProgressEntryCreateRequest;
import com.elitegym.dto.progress.ProgressEntryDto;
import com.elitegym.dto.progress.ProgressEntryUpdateRequest;
import com.elitegym.entity.ProgressEntry;
import com.elitegym.entity.ProgressPhoto;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.User;
import com.elitegym.enums.ProgressPhotoType;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.ProgressEntryRepository;
import com.elitegym.repository.ProgressPhotoRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProgressServiceTest {

    @Mock
    private ProgressEntryRepository progressEntryRepository;
    @Mock
    private ProgressPhotoRepository progressPhotoRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private ProgressService progressService;

    private User studentUser;
    private User otherStudentUser;
    private User trainerUser;
    private StudentProfile sampleStudent;
    private StudentProfile otherStudentProfile;
    private ProgressEntry entryJan;
    private ProgressEntry entryFeb;
    private ProgressEntry entryMar;
    private UserPrincipal studentPrincipal;
    private UserPrincipal otherStudentPrincipal;
    private UserPrincipal trainerPrincipal;

    @BeforeEach
    void setUp() {
        studentUser = User.builder()
                .id(1L)
                .email("student@elitegym.com")
                .username("john")
                .firstName("John")
                .lastName("Doe")
                .role(RoleName.ROLE_STUDENT)
                .isActive(true)
                .build();

        otherStudentUser = User.builder()
                .id(10L)
                .email("sara@elitegym.com")
                .username("sara")
                .firstName("Sara")
                .lastName("Lee")
                .role(RoleName.ROLE_STUDENT)
                .isActive(true)
                .build();

        trainerUser = User.builder()
                .id(2L)
                .email("mike@elitegym.com")
                .role(RoleName.ROLE_TRAINER)
                .isActive(true)
                .build();

        sampleStudent = StudentProfile.builder()
                .id(20L)
                .user(studentUser)
                .heightCm(new BigDecimal("180.00"))
                .weightKg(new BigDecimal("85.00"))
                .fitnessGoal("Lose weight")
                .build();

        otherStudentProfile = StudentProfile.builder()
                .id(30L)
                .user(otherStudentUser)
                .build();

        entryJan = ProgressEntry.builder()
                .id(1L)
                .student(sampleStudent)
                .recordDate(LocalDate.of(2026, 1, 5))
                .weightKg(new BigDecimal("90.00"))
                .heightCm(new BigDecimal("180.00"))
                .bodyFatPct(new BigDecimal("22.5"))
                .waistCm(new BigDecimal("95.00"))
                .chestCm(new BigDecimal("108.00"))
                .notes("Starting point.")
                .photos(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusMonths(3))
                .updatedAt(LocalDateTime.now().minusMonths(3))
                .build();
        ProgressPhoto p1 = ProgressPhoto.builder()
                .id(11L)
                .progressEntry(entryJan)
                .photoUrl("https://cdn.example.com/jan-before.jpg")
                .caption("Day 1 front")
                .photoType(ProgressPhotoType.BEFORE)
                .build();
        entryJan.getPhotos().add(p1);

        entryFeb = ProgressEntry.builder()
                .id(2L)
                .student(sampleStudent)
                .recordDate(LocalDate.of(2026, 2, 5))
                .weightKg(new BigDecimal("87.50"))
                .heightCm(new BigDecimal("180.00"))
                .bodyFatPct(new BigDecimal("20.8"))
                .waistCm(new BigDecimal("92.00"))
                .chestCm(new BigDecimal("107.00"))
                .notes("Down 2.5 kg.")
                .photos(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusMonths(2))
                .updatedAt(LocalDateTime.now().minusMonths(2))
                .build();

        entryMar = ProgressEntry.builder()
                .id(3L)
                .student(sampleStudent)
                .recordDate(LocalDate.of(2026, 3, 5))
                .weightKg(new BigDecimal("85.00"))
                .heightCm(new BigDecimal("180.00"))
                .bodyFatPct(new BigDecimal("19.0"))
                .waistCm(new BigDecimal("89.00"))
                .chestCm(new BigDecimal("106.00"))
                .notes("Goal weight reached!")
                .photos(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusMonths(1))
                .updatedAt(LocalDateTime.now().minusMonths(1))
                .build();

        studentPrincipal = UserPrincipal.create(studentUser);
        otherStudentPrincipal = UserPrincipal.create(otherStudentUser);
        trainerPrincipal = UserPrincipal.create(trainerUser);
    }

    // =========================================================================
    // CREATE
    // =========================================================================

    @Test
    void createEntry_Success() {
        ProgressEntryCreateRequest req = ProgressEntryCreateRequest.builder()
                .recordDate(LocalDate.of(2026, 4, 5))
                .weightKg(new BigDecimal("83.00"))
                .bodyFatPct(new BigDecimal("18.0"))
                .waistCm(new BigDecimal("87.00"))
                .photos(List.of(ProgressEntryCreateRequest.PhotoItem.builder()
                        .photoUrl("https://cdn.example.com/apr.jpg")
                        .caption("April shot")
                        .photoType(ProgressPhotoType.PROGRESS)
                        .build()))
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.existsDuplicateDate(20L, req.getRecordDate(), -1L)).thenReturn(false);
        when(progressEntryRepository.save(any(ProgressEntry.class))).thenAnswer(invocation -> {
            ProgressEntry e = invocation.getArgument(0);
            e.setId(10L);
            return e;
        });

        ProgressEntryDto dto = progressService.createEntry(studentPrincipal, req);

        assertEquals(10L, dto.getId());
        assertEquals(20L, dto.getStudentId());
        assertEquals(0, new BigDecimal("83.00").compareTo(dto.getWeightKg()));
        assertEquals("April shot", dto.getPhotos().get(0).getCaption());
        verify(progressEntryRepository, times(1)).save(any(ProgressEntry.class));
    }

    @Test
    void createEntry_EmptyEntry_ThrowsBadRequest() {
        ProgressEntryCreateRequest req = ProgressEntryCreateRequest.builder()
                .recordDate(LocalDate.of(2026, 4, 5))
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));

        assertThrows(BadRequestException.class, () ->
                progressService.createEntry(studentPrincipal, req));
        verify(progressEntryRepository, never()).save(any());
    }

    @Test
    void createEntry_NotesOnly_Success() {
        ProgressEntryCreateRequest req = ProgressEntryCreateRequest.builder()
                .recordDate(LocalDate.of(2026, 4, 5))
                .notes("Felt more energetic this week.")
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.existsDuplicateDate(20L, req.getRecordDate(), -1L)).thenReturn(false);
        when(progressEntryRepository.save(any(ProgressEntry.class))).thenAnswer(invocation -> {
            ProgressEntry e = invocation.getArgument(0);
            e.setId(42L);
            return e;
        });

        ProgressEntryDto dto = progressService.createEntry(studentPrincipal, req);
        assertEquals(42L, dto.getId());
        assertEquals("Felt more energetic this week.", dto.getNotes());
    }

    @Test
    void createEntry_DuplicateDate_ThrowsBadRequest() {
        ProgressEntryCreateRequest req = ProgressEntryCreateRequest.builder()
                .recordDate(LocalDate.of(2026, 1, 5))
                .weightKg(new BigDecimal("88.00"))
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.existsDuplicateDate(20L, req.getRecordDate(), -1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () ->
                progressService.createEntry(studentPrincipal, req));
        verify(progressEntryRepository, never()).save(any());
    }

    @Test
    void createEntry_StudentNotFound_ThrowsResourceNotFound() {
        ProgressEntryCreateRequest req = ProgressEntryCreateRequest.builder()
                .recordDate(LocalDate.of(2026, 4, 5))
                .weightKg(new BigDecimal("75"))
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                progressService.createEntry(studentPrincipal, req));
    }

    // =========================================================================
    // READ: getMyProgress / getDetail / getLatest
    // =========================================================================

    @Test
    void getMyProgress_ReturnsHistoryDesc() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findByStudentIdWithDetails(20L))
                .thenReturn(List.of(entryMar, entryFeb, entryJan));

        List<ProgressEntryDto> list = progressService.getMyProgress(studentPrincipal);

        assertEquals(3, list.size());
        assertEquals(3L, list.get(0).getId()); // Mar (newest) first
        assertEquals(1L, list.get(2).getId());
        assertTrue(list.get(2).getPhotos().stream()
                .anyMatch(p -> "Day 1 front".equals(p.getCaption())));
    }

    @Test
    void getDetail_Owner_Success() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findByIdWithDetails(2L)).thenReturn(Optional.of(entryFeb));

        ProgressEntryDto dto = progressService.getDetail(studentPrincipal, 2L);

        assertEquals(2L, dto.getId());
        assertEquals(0, new BigDecimal("87.50").compareTo(dto.getWeightKg()));
        assertEquals("Down 2.5 kg.", dto.getNotes());
    }

    @Test
    void getDetail_NonOwner_ThrowsUnauthorized() {
        ProgressEntry otherEntry = ProgressEntry.builder()
                .id(900L).student(otherStudentProfile).recordDate(LocalDate.now())
                .weightKg(new BigDecimal("70")).photos(new ArrayList<>()).build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findByIdWithDetails(900L)).thenReturn(Optional.of(otherEntry));

        assertThrows(UnauthorizedException.class, () ->
                progressService.getDetail(studentPrincipal, 900L));
    }

    @Test
    void getDetail_NotFound() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                progressService.getDetail(studentPrincipal, 999L));
    }

    @Test
    void getLatest_ReturnsNewest() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findTopByStudentIdOrderByRecordDateDesc(20L))
                .thenReturn(List.of(entryMar, entryFeb, entryJan));

        ProgressEntryDto dto = progressService.getLatest(studentPrincipal);

        assertEquals(3L, dto.getId()); // March is latest
        assertEquals(0, new BigDecimal("85.00").compareTo(dto.getWeightKg()));
    }

    @Test
    void getLatest_Empty_ThrowsNotFound() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findTopByStudentIdOrderByRecordDateDesc(20L))
                .thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class, () ->
                progressService.getLatest(studentPrincipal));
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    @Test
    void updateEntry_SuccessOwner() {
        ProgressEntryUpdateRequest req = ProgressEntryUpdateRequest.builder()
                .recordDate(entryFeb.getRecordDate())
                .weightKg(new BigDecimal("86.50"))
                .waistCm(new BigDecimal("91.00"))
                .notes("Updated readings.")
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findByIdWithDetails(2L)).thenReturn(Optional.of(entryFeb));
        when(progressEntryRepository.existsDuplicateDate(20L, req.getRecordDate(), 2L)).thenReturn(false);
        when(progressEntryRepository.save(any(ProgressEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProgressEntryDto dto = progressService.updateEntry(studentPrincipal, 2L, req);

        assertEquals(0, new BigDecimal("86.50").compareTo(dto.getWeightKg()));
        assertEquals(0, new BigDecimal("91.00").compareTo(dto.getWaistCm()));
    }

    @Test
    void updateEntry_NullPhotos_PreservesExistingPhotos() {
        ProgressPhoto existing = ProgressPhoto.builder()
                .id(21L)
                .progressEntry(entryFeb)
                .photoUrl("https://cdn.example.com/feb.jpg")
                .caption("Keep me")
                .photoType(ProgressPhotoType.PROGRESS)
                .build();
        entryFeb.getPhotos().add(existing);

        ProgressEntryUpdateRequest req = ProgressEntryUpdateRequest.builder()
                .recordDate(entryFeb.getRecordDate())
                .weightKg(new BigDecimal("86.00"))
                .notes("Measurements only")
                .photos(null)
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findByIdWithDetails(2L)).thenReturn(Optional.of(entryFeb));
        when(progressEntryRepository.existsDuplicateDate(20L, req.getRecordDate(), 2L)).thenReturn(false);
        when(progressEntryRepository.save(any(ProgressEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProgressEntryDto dto = progressService.updateEntry(studentPrincipal, 2L, req);

        assertEquals(1, dto.getPhotos().size());
        assertEquals("Keep me", dto.getPhotos().get(0).getCaption());
        assertEquals(0, new BigDecimal("86.00").compareTo(dto.getWeightKg()));
    }

    @Test
    void updateEntry_NonOwner_ThrowsUnauthorized() {
        ProgressEntryUpdateRequest req = ProgressEntryUpdateRequest.builder()
                .recordDate(LocalDate.now())
                .weightKg(new BigDecimal("70"))
                .build();

        ProgressEntry otherEntry = ProgressEntry.builder()
                .id(55L).student(otherStudentProfile).recordDate(LocalDate.now())
                .weightKg(new BigDecimal("55")).photos(new ArrayList<>()).build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findByIdWithDetails(55L)).thenReturn(Optional.of(otherEntry));

        assertThrows(UnauthorizedException.class, () ->
                progressService.updateEntry(studentPrincipal, 55L, req));
    }

    // =========================================================================
    // DELETE
    // =========================================================================

    @Test
    void deleteEntry_Owner_Success() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findById(1L)).thenReturn(Optional.of(entryJan));
        doNothing().when(progressEntryRepository).delete(entryJan);

        assertDoesNotThrow(() -> progressService.deleteEntry(studentPrincipal, 1L));
        verify(progressEntryRepository, times(1)).delete(entryJan);
    }

    @Test
    void deleteEntry_NonOwner_ThrowsUnauthorized() {
        ProgressEntry otherEntry = ProgressEntry.builder()
                .id(5L).student(otherStudentProfile).recordDate(LocalDate.now()).build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findById(5L)).thenReturn(Optional.of(otherEntry));

        assertThrows(UnauthorizedException.class, () ->
                progressService.deleteEntry(studentPrincipal, 5L));
        verify(progressEntryRepository, never()).delete(any());
    }

    @Test
    void deleteEntry_NotFound() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(progressEntryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                progressService.deleteEntry(studentPrincipal, 999L));
    }

    // =========================================================================
    // Security: Trainer has no student profile => not allowed to use student APIs
    // =========================================================================

    @Test
    void trainerPrincipal_getMyProgress_StudentProfileNotFound() {
        when(studentProfileRepository.findByUserId(2L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () ->
                progressService.getMyProgress(trainerPrincipal));
    }

    // =========================================================================
    // Enum parity
    // =========================================================================

    @Test
    void enumValues_ProgressPhotoType() {
        assertEquals(3, ProgressPhotoType.values().length);
        assertNotNull(ProgressPhotoType.valueOf("BEFORE"));
        assertNotNull(ProgressPhotoType.valueOf("AFTER"));
        assertNotNull(ProgressPhotoType.valueOf("PROGRESS"));
    }
}
