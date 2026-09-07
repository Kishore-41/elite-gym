package com.elitegym.service;

import com.elitegym.dto.complaint.ComplaintCreateRequest;
import com.elitegym.dto.complaint.ComplaintDto;
import com.elitegym.dto.complaint.ComplaintResponseRequest;
import com.elitegym.entity.Complaint;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.User;
import com.elitegym.enums.ComplaintCategory;
import com.elitegym.enums.ComplaintPriority;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

    // =========================================================================
    // 1. PUBLIC & MEMBER GRIEVANCE CREATION
    // =========================================================================

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    @Transactional
    public ComplaintDto createPublicOrMemberComplaint(UserPrincipal principal, ComplaintCreateRequest request) {
        Complaint.ComplaintBuilder builder = Complaint.builder()
                .subject(request.getSubject())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.SUBMITTED)
                .isAnonymous(request.isAnonymous())
                .attachmentUrls(request.getAttachmentUrls() != null ? request.getAttachmentUrls() : List.of());

        String targetAudience = request.getTargetAudience() != null && !request.getTargetAudience().isBlank()
                ? request.getTargetAudience().toUpperCase()
                : "OWNER_ONLY";
        builder.targetAudience(targetAudience);

        if (request.isAnonymous()) {
            // ZERO-LEAK: strip user and student reference completely
            String randomToken = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            builder.submitterName("ANON-MEMBER-" + randomToken);
            builder.submitterEmail(null);
            builder.user(null);
            builder.student(null);
        } else {
            if (principal != null) {
                User user = userRepository.findById(principal.getId()).orElse(null);
                StudentProfile student = studentProfileRepository.findByUserId(principal.getId()).orElse(null);
                builder.user(user);
                builder.student(student);
                if (user != null) {
                    builder.submitterName((user.getFirstName() + " " + user.getLastName()).trim());
                    builder.submitterEmail(user.getEmail());
                }
            } else {
                builder.submitterName(request.getSubmitterName() != null ? request.getSubmitterName().trim() : "Club Visitor");
                builder.submitterEmail(request.getSubmitterEmail() != null ? request.getSubmitterEmail().trim() : null);
            }
        }

        Complaint saved = complaintRepository.save(builder.build());
        log.info("Registered Grievance #{} [{}] -> Target: {}, Anonymous: {}", 
                saved.getId(), saved.getCategory(), saved.getTargetAudience(), saved.isAnonymous());
        return mapToDto(saved);
    }

    @Transactional
    public ComplaintDto createComplaint(UserPrincipal principal, ComplaintCreateRequest request) {
        StudentProfile student = getStudentProfile(principal.getId());

        Complaint complaint = Complaint.builder()
                .student(student)
                .user(student.getUser())
                .subject(request.getSubject())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.OPEN)
                .targetAudience(request.getTargetAudience() != null ? request.getTargetAudience() : "OWNER_ONLY")
                .isAnonymous(request.isAnonymous())
                .attachmentUrls(request.getAttachmentUrls() != null ? request.getAttachmentUrls() : List.of())
                .build();

        Complaint saved = complaintRepository.save(complaint);
        log.info("Student #{} submitted complaint #{} [{}]: {}",
                student.getId(), saved.getId(), saved.getCategory(), saved.getSubject());
        return mapToDto(saved);
    }

    // =========================================================================
    // 2. STUDENT / MEMBER RETRIEVAL
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

    // =========================================================================
    // 3. ADMIN & EXECUTIVE OPERATIONS (ZERO-LEAK ACCESS CONTROL)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ComplaintDto> getAllComplaints(UserPrincipal principal, ComplaintStatus status, ComplaintCategory category, String targetAudience) {
        List<Complaint> complaints = complaintRepository.findAllWithDetails();

        // Zero-Leak Security Enforcement:
        // Only non-admin roles are restricted
        boolean isSuperAdmin = principal == null || principal.getRole() == RoleName.ROLE_ADMIN;

        return complaints.stream()
                .filter(c -> {
                    if (!isSuperAdmin) {
                        // General staff or trainer cannot see sensitive tickets
                        if (c.isAnonymous()) return false;
                        if ("OWNER_ONLY".equalsIgnoreCase(c.getTargetAudience())) return false;
                        if (c.getCategory() == ComplaintCategory.STAFF_BEHAVIOR || c.getCategory() == ComplaintCategory.TRAINER_MISCONDUCT) {
                            return false;
                        }
                    }
                    if (status != null && c.getStatus() != status) {
                        return false;
                    }
                    if (category != null && c.getCategory() != category) {
                        return false;
                    }
                    if (targetAudience != null && !targetAudience.isBlank() && !targetAudience.equalsIgnoreCase(c.getTargetAudience())) {
                        return false;
                    }
                    return true;
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

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
            throw new BadRequestException("This grievance is already CLOSED and cannot be modified.");
        }

        String notes = response.getResolutionNotes() != null && !response.getResolutionNotes().isBlank()
                ? response.getResolutionNotes()
                : response.getAdminResponse();

        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            if (notes == null || notes.isBlank()) {
                throw new BadRequestException("Resolution notes are required when resolving or closing a complaint.");
            }
        }

        complaint.setResolutionNotes(notes);
        complaint.setAdminResponse(notes);
        complaint.setStatus(newStatus);

        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            complaint.setResolvedBy(admin);
            complaint.setResolvedByAdmin(admin);
            complaint.setResolvedAt(LocalDateTime.now());

            // Trigger official email notification if submitter email exists
            if (complaint.getSubmitterEmail() != null && !complaint.getSubmitterEmail().isBlank()) {
                emailNotificationService.sendGrievanceResolutionEmail(
                        complaint.getSubmitterEmail(),
                        complaint.getId(),
                        complaint.getSubject(),
                        notes
                );
            }
        } else {
            complaint.setResolvedBy(null);
            complaint.setResolvedByAdmin(null);
            complaint.setResolvedAt(null);
        }

        Complaint saved = complaintRepository.save(complaint);
        log.info("Executive/Admin #{} updated Grievance #{} to status {}", admin.getId(), complaintId, newStatus);
        return mapToDto(saved);
    }

    // =========================================================================
    // 4. HELPER METHODS & MAPPING
    // =========================================================================

    private void validateAdminRole(UserPrincipal principal) {
        if (principal.getRole() != RoleName.ROLE_ADMIN) {
            throw new UnauthorizedException("You are not authorized to perform this admin action.");
        }
    }

    private ComplaintDto mapToDto(Complaint c) {
        String studentName = null;
        String studentEmail = null;
        Long studentId = null;
        Long userId = null;

        if (c.getStudent() != null) {
            studentId = c.getStudent().getId();
            if (c.getStudent().getUser() != null) {
                studentName = (c.getStudent().getUser().getFirstName() + " " + c.getStudent().getUser().getLastName()).trim();
                studentEmail = c.getStudent().getUser().getEmail();
                userId = c.getStudent().getUser().getId();
            }
        } else if (c.getUser() != null) {
            userId = c.getUser().getId();
            studentName = (c.getUser().getFirstName() + " " + c.getUser().getLastName()).trim();
            studentEmail = c.getUser().getEmail();
        }

        Long adminId = (c.getResolvedByAdmin() != null) ? c.getResolvedByAdmin().getId()
                : (c.getResolvedBy() != null ? c.getResolvedBy().getId() : null);
        String adminName = null;
        if (c.getResolvedByAdmin() != null) {
            adminName = (c.getResolvedByAdmin().getFirstName() + " " + c.getResolvedByAdmin().getLastName()).trim();
        } else if (c.getResolvedBy() != null) {
            adminName = (c.getResolvedBy().getFirstName() + " " + c.getResolvedBy().getLastName()).trim();
        }

        return ComplaintDto.builder()
                .id(c.getId())
                .studentId(studentId)
                .userId(userId)
                .studentName(studentName)
                .studentEmail(studentEmail)
                .submitterName(c.getSubmitterName() != null ? c.getSubmitterName() : studentName)
                .submitterEmail(c.getSubmitterEmail() != null ? c.getSubmitterEmail() : studentEmail)
                .targetAudience(c.getTargetAudience())
                .isAnonymous(c.isAnonymous())
                .subject(c.getSubject())
                .description(c.getDescription())
                .category(c.getCategory())
                .priority(c.getPriority())
                .status(c.getStatus())
                .attachmentUrls(c.getAttachmentUrls())
                .resolutionNotes(c.getResolutionNotes() != null ? c.getResolutionNotes() : c.getAdminResponse())
                .adminResponse(c.getAdminResponse() != null ? c.getAdminResponse() : c.getResolutionNotes())
                .resolvedByAdminId(adminId)
                .resolvedByAdminName(adminName)
                .resolvedById(adminId)
                .resolvedByName(adminName)
                .resolvedAt(c.getResolvedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}

