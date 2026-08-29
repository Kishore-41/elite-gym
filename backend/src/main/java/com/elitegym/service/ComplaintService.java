package com.elitegym.service;

import com.elitegym.dto.complaint.ComplaintCreateRequest;
import com.elitegym.dto.complaint.ComplaintDto;
import com.elitegym.dto.complaint.ComplaintResponseRequest;
import com.elitegym.entity.Complaint;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.User;
import com.elitegym.enums.ComplaintCategory;
import com.elitegym.enums.ComplaintStatus;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.enums.RoleName;
import com.elitegym.repository.ComplaintRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.UserRepository;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    // =========================================================================
    // 1. STUDENT OPERATIONS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ComplaintDto> getStudentComplaints(UserPrincipal principal, ComplaintStatus status) {
        StudentProfile student = getStudentProfile(principal.getId());
        List<Complaint> complaints;
        if (status != null) {
            complaints = complaintRepository.findByStudentIdAndStatus(student.getId(), status);
        } else {
            complaints = complaintRepository.findByStudentIdWithDetails(student.getId());
        }
        return complaints.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintDto getStudentComplaintDetail(UserPrincipal principal, Long complaintId) {
        StudentProfile student = getStudentProfile(principal.getId());
        Complaint complaint = complaintRepository.findByIdWithDetails(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", complaintId));
        if (!complaint.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("You are not authorized to view this complaint.");
        }
        return mapToDto(complaint);
    }

    @Transactional
    public ComplaintDto createComplaint(UserPrincipal principal, ComplaintCreateRequest request) {
        StudentProfile student = getStudentProfile(principal.getId());

        Complaint complaint = Complaint.builder()
                .student(student)
                .subject(request.getSubject())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(ComplaintStatus.OPEN)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        log.info("Student #{} submitted complaint #{} [{}]: {}",
                student.getId(), saved.getId(), saved.getCategory(), saved.getSubject());
        return mapToDto(saved);
    }

    // =========================================================================
    // 2. ADMIN OPERATIONS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ComplaintDto> getAllComplaints(ComplaintStatus status, ComplaintCategory category) {
        List<Complaint> complaints;
        if (status != null && category != null) {
            complaints = complaintRepository.findAllWithDetails().stream()
                    .filter(c -> c.getStatus() == status && c.getCategory() == category)
                    .collect(Collectors.toList());
        } else if (status != null) {
            complaints = complaintRepository.findByStatusWithDetails(status);
        } else if (category != null) {
            complaints = complaintRepository.findByCategoryWithDetails(category);
        } else {
            complaints = complaintRepository.findAllWithDetails();
        }
        return complaints.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComplaintDto getComplaintDetail(Long complaintId) {
        Complaint complaint = complaintRepository.findByIdWithDetails(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", complaintId));
        return mapToDto(complaint);
    }

    @Transactional(readOnly = true)
    public List<ComplaintDto> getStudentComplaintsByAdmin(Long studentId, ComplaintStatus status) {
        List<Complaint> complaints;
        if (status != null) {
            complaints = complaintRepository.findByStudentIdAndStatus(studentId, status);
        } else {
            complaints = complaintRepository.findByStudentIdWithDetails(studentId);
        }
        return complaints.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ComplaintDto respondToComplaint(UserPrincipal principal, Long complaintId, ComplaintResponseRequest response) {
        validateAdminRole(principal);
        User admin = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        Complaint complaint = complaintRepository.findByIdWithDetails(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", complaintId));

        ComplaintStatus newStatus = response.getStatus();
        if (newStatus == null) {
            throw new BadRequestException("Response status is required.");
        }

        if (complaint.getStatus() == ComplaintStatus.CLOSED) {
            throw new BadRequestException("This complaint is already CLOSED and cannot be modified.");
        }

        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            boolean hasAdminResponse = response.getAdminResponse() != null &&
                    !response.getAdminResponse().isBlank();
            if (!hasAdminResponse) {
                throw new BadRequestException(
                        "Admin response is required when resolving or closing a complaint.");
            }
        }

        if (response.getAdminResponse() != null) {
            complaint.setAdminResponse(response.getAdminResponse());
        }

        complaint.setStatus(newStatus);

        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            complaint.setResolvedByAdmin(admin);
            complaint.setResolvedAt(LocalDateTime.now());
        } else {
            complaint.setResolvedByAdmin(null);
            complaint.setResolvedAt(null);
        }

        Complaint saved = complaintRepository.save(complaint);
        log.info("Admin #{} updated complaint #{} to status {}", admin.getId(), complaintId, newStatus);
        return mapToDto(saved);
    }

    // =========================================================================
    // 3. HELPER METHODS
    // =========================================================================

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    private void validateAdminRole(UserPrincipal principal) {
        if (principal.getRole() != RoleName.ROLE_ADMIN) {
            throw new UnauthorizedException("You are not authorized to perform this admin action.");
        }
    }

    private ComplaintDto mapToDto(Complaint c) {
        String studentName = (c.getStudent().getUser().getFirstName() + " " +
                c.getStudent().getUser().getLastName()).trim();
        Long adminId = (c.getResolvedByAdmin() != null) ? c.getResolvedByAdmin().getId() : null;
        String adminName = null;
        if (c.getResolvedByAdmin() != null) {
            adminName = (c.getResolvedByAdmin().getFirstName() + " " +
                    c.getResolvedByAdmin().getLastName()).trim();
        }

        return ComplaintDto.builder()
                .id(c.getId())
                .studentId(c.getStudent().getId())
                .studentName(studentName)
                .studentEmail(c.getStudent().getUser().getEmail())
                .subject(c.getSubject())
                .description(c.getDescription())
                .category(c.getCategory())
                .priority(c.getPriority())
                .status(c.getStatus())
                .adminResponse(c.getAdminResponse())
                .resolvedByAdminId(adminId)
                .resolvedByAdminName(adminName)
                .resolvedAt(c.getResolvedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
