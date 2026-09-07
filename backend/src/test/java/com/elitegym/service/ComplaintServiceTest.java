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
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.ComplaintRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.UserRepository;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ComplaintService complaintService;

    private User studentUser;
    private User adminUser;
    private User otherStudentUser;
    private StudentProfile sampleStudent;
    private StudentProfile otherStudent;
    private Complaint sampleComplaintOpen;
    private Complaint sampleComplaintInProgress;
    private Complaint sampleComplaintResolved;
    private Complaint sampleComplaintClosed;
    private UserPrincipal studentPrincipal;
    private UserPrincipal adminPrincipal;
    private UserPrincipal otherStudentPrincipal;
    private UserPrincipal trainerPrincipal;

    @BeforeEach
    void setUp() {
        studentUser = User.builder()
                .id(1L)
                .email("student@elitegym.com")
                .username("john_student")
                .firstName("John")
                .lastName("Doe")
                .role(RoleName.ROLE_STUDENT)
                .build();

        otherStudentUser = User.builder()
                .id(5L)
                .email("other@elitegym.com")
                .username("sara_student")
                .firstName("Sara")
                .lastName("Lee")
                .role(RoleName.ROLE_STUDENT)
                .build();

        adminUser = User.builder()
                .id(3L)
                .email("admin@elitegym.com")
                .username("system_admin")
                .firstName("System")
                .lastName("Admin")
                .role(RoleName.ROLE_ADMIN)
                .build();

        User trainerUser = User.builder()
                .id(2L)
                .role(RoleName.ROLE_TRAINER)
                .build();

        sampleStudent = StudentProfile.builder()
                .id(10L)
                .user(studentUser)
                .fitnessGoal("Muscle Gain")
                .build();

        otherStudent = StudentProfile.builder()
                .id(50L)
                .user(otherStudentUser)
                .build();

        sampleComplaintOpen = Complaint.builder()
                .id(200L)
                .student(sampleStudent)
                .subject("Broken treadmill in zone A")
                .description("Treadmill #3 stops abruptly.")
                .category(ComplaintCategory.EQUIPMENT)
                .priority(ComplaintPriority.HIGH)
                .status(ComplaintStatus.OPEN)
                .build();

        sampleComplaintInProgress = Complaint.builder()
                .id(201L)
                .student(sampleStudent)
                .subject("AC not cooling")
                .description("Zone B AC broken.")
                .category(ComplaintCategory.FACILITY)
                .priority(ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.IN_PROGRESS)
                .build();

        sampleComplaintResolved = Complaint.builder()
                .id(202L)
                .student(sampleStudent)
                .subject("Locker 45 stuck")
                .description("Fixed by maintenance.")
                .category(ComplaintCategory.OTHER)
                .priority(ComplaintPriority.LOW)
                .status(ComplaintStatus.RESOLVED)
                .adminResponse("Replaced lock mechanism.")
                .resolvedByAdmin(adminUser)
                .resolvedAt(LocalDateTime.now().minusHours(2))
                .build();

        sampleComplaintClosed = Complaint.builder()
                .id(203L)
                .student(sampleStudent)
                .subject("Billing discrepancy")
                .description("Charged incorrectly.")
                .category(ComplaintCategory.BILLING)
                .priority(ComplaintPriority.CRITICAL)
                .status(ComplaintStatus.CLOSED)
                .adminResponse("Refund issued, apology sent.")
                .resolvedByAdmin(adminUser)
                .resolvedAt(LocalDateTime.now().minusDays(1))
                .build();

        studentPrincipal = UserPrincipal.create(studentUser);
        adminPrincipal = UserPrincipal.create(adminUser);
        otherStudentPrincipal = UserPrincipal.create(otherStudentUser);
        trainerPrincipal = UserPrincipal.create(trainerUser);
    }

    // =========================================================================
    // STUDENT: createComplaint
    // =========================================================================

    @Test
    void createComplaint_Success() {
        ComplaintCreateRequest req = ComplaintCreateRequest.builder()
                .subject("Water cooler empty")
                .description("Ground floor water cooler has been empty.")
                .category(ComplaintCategory.FACILITY)
                .priority(ComplaintPriority.MEDIUM)
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> {
            Complaint c = invocation.getArgument(0);
            c.setId(999L);
            return c;
        });

        ComplaintDto created = complaintService.createComplaint(studentPrincipal, req);

        assertNotNull(created);
        assertEquals(999L, created.getId());
        assertEquals(ComplaintStatus.OPEN, created.getStatus());
        assertEquals(ComplaintCategory.FACILITY, created.getCategory());
        assertEquals(ComplaintPriority.MEDIUM, created.getPriority());
        assertEquals("John Doe", created.getStudentName());
        assertEquals("student@elitegym.com", created.getStudentEmail());
        assertNull(created.getAdminResponse());
        verify(complaintRepository, times(1)).save(any(Complaint.class));
    }

    @Test
    void createComplaint_DefaultPriority() {
        ComplaintCreateRequest req = ComplaintCreateRequest.builder()
                .subject("Subject")
                .description("Description")
                .category(ComplaintCategory.TRAINER)
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> {
            Complaint c = invocation.getArgument(0);
            c.setId(1L);
            return c;
        });

        ComplaintDto created = complaintService.createComplaint(studentPrincipal, req);

        assertEquals(ComplaintPriority.MEDIUM, created.getPriority());
    }

    @Test
    void createComplaint_StudentNotFound() {
        ComplaintCreateRequest req = ComplaintCreateRequest.builder()
                .subject("Subject")
                .description("Description")
                .category(ComplaintCategory.OTHER)
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                complaintService.createComplaint(studentPrincipal, req));
        verify(complaintRepository, never()).save(any());
    }

    // =========================================================================
    // STUDENT: getStudentComplaints
    // =========================================================================

    @Test
    void getStudentComplaints_AllNoFilter() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(complaintRepository.findByStudentIdWithDetails(10L)).thenReturn(
                List.of(sampleComplaintOpen, sampleComplaintResolved));

        List<ComplaintDto> list = complaintService.getStudentComplaints(studentPrincipal, null);

        assertEquals(2, list.size());
        assertEquals(200L, list.get(0).getId());
        verify(complaintRepository, never()).findByStudentIdAndStatus(anyLong(), any());
    }

    @Test
    void getStudentComplaints_FilteredByStatus() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(complaintRepository.findByStudentIdAndStatus(10L, ComplaintStatus.OPEN))
                .thenReturn(List.of(sampleComplaintOpen));

        List<ComplaintDto> list = complaintService.getStudentComplaints(studentPrincipal, ComplaintStatus.OPEN);

        assertEquals(1, list.size());
        assertEquals(ComplaintStatus.OPEN, list.get(0).getStatus());
    }

    @Test
    void getStudentComplaints_StudentNotFound() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () ->
                complaintService.getStudentComplaints(studentPrincipal, null));
    }

    // =========================================================================
    // STUDENT: getStudentComplaintDetail (with ownership check)
    // =========================================================================

    @Test
    void getStudentComplaintDetail_Owner_Success() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(complaintRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(sampleComplaintOpen));

        ComplaintDto dto = complaintService.getStudentComplaintDetail(studentPrincipal, 200L);

        assertEquals(200L, dto.getId());
        assertEquals("Broken treadmill in zone A", dto.getSubject());
    }

    @Test
    void getStudentComplaintDetail_NonOwner_ThrowsUnauthorized() {
        StudentProfile other = StudentProfile.builder().id(999L).user(otherStudentUser).build();
        Complaint otherComplaint = Complaint.builder().id(777L).student(other).category(ComplaintCategory.EQUIPMENT).subject("X").description("Y").status(ComplaintStatus.OPEN).priority(ComplaintPriority.MEDIUM).build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(complaintRepository.findByIdWithDetails(777L)).thenReturn(Optional.of(otherComplaint));

        assertThrows(UnauthorizedException.class, () ->
                complaintService.getStudentComplaintDetail(studentPrincipal, 777L));
    }

    @Test
    void getStudentComplaintDetail_ComplaintNotFound() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(complaintRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                complaintService.getStudentComplaintDetail(studentPrincipal, 999L));
    }

    // =========================================================================
    // ADMIN: getAllComplaints with filters
    // =========================================================================

    @Test
    void getAllComplaints_NoFilters() {
        when(complaintRepository.findAllWithDetails()).thenReturn(
                List.of(sampleComplaintOpen, sampleComplaintResolved, sampleComplaintClosed));

        List<ComplaintDto> list = complaintService.getAllComplaints(null, null);

        assertEquals(3, list.size());
        verify(complaintRepository, times(1)).findAllWithDetails();
    }

    @Test
    void getAllComplaints_StatusFilterOnly() {
        when(complaintRepository.findByStatusWithDetails(ComplaintStatus.OPEN))
                .thenReturn(List.of(sampleComplaintOpen));

        List<ComplaintDto> list = complaintService.getAllComplaints(ComplaintStatus.OPEN, null);

        assertEquals(1, list.size());
        assertEquals(ComplaintStatus.OPEN, list.get(0).getStatus());
    }

    @Test
    void getAllComplaints_CategoryFilterOnly() {
        when(complaintRepository.findByCategoryWithDetails(ComplaintCategory.EQUIPMENT))
                .thenReturn(List.of(sampleComplaintOpen));

        List<ComplaintDto> list = complaintService.getAllComplaints(null, ComplaintCategory.EQUIPMENT);

        assertEquals(1, list.size());
        assertEquals(ComplaintCategory.EQUIPMENT, list.get(0).getCategory());
    }

    @Test
    void getAllComplaints_BothFilters_Intersection() {
        when(complaintRepository.findAllWithDetails()).thenReturn(
                List.of(sampleComplaintOpen, sampleComplaintInProgress, sampleComplaintResolved));

        List<ComplaintDto> list = complaintService.getAllComplaints(
                ComplaintStatus.OPEN, ComplaintCategory.EQUIPMENT);

        assertEquals(1, list.size());
        assertEquals(200L, list.get(0).getId());
    }

    // =========================================================================
    // ADMIN: getComplaintDetail
    // =========================================================================

    @Test
    void adminGetComplaintDetail_Success() {
        when(complaintRepository.findByIdWithDetails(202L)).thenReturn(Optional.of(sampleComplaintResolved));

        ComplaintDto dto = complaintService.getComplaintDetail(202L);

        assertEquals(202L, dto.getId());
        assertEquals(ComplaintStatus.RESOLVED, dto.getStatus());
        assertEquals("Replaced lock mechanism.", dto.getAdminResponse());
        assertEquals(3L, dto.getResolvedByAdminId());
        assertEquals("System Admin", dto.getResolvedByAdminName());
        assertNotNull(dto.getResolvedAt());
    }

    @Test
    void adminGetComplaintDetail_NotFound() {
        when(complaintRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> complaintService.getComplaintDetail(999L));
    }

    // =========================================================================
    // ADMIN: getStudentComplaintsByAdmin
    // =========================================================================

    @Test
    void adminGetStudentComplaints_NoFilter() {
        when(complaintRepository.findByStudentIdWithDetails(10L))
                .thenReturn(List.of(sampleComplaintOpen, sampleComplaintInProgress));

        List<ComplaintDto> list = complaintService.getStudentComplaintsByAdmin(10L, null);

        assertEquals(2, list.size());
    }

    @Test
    void adminGetStudentComplaints_Filtered() {
        when(complaintRepository.findByStudentIdAndStatus(10L, ComplaintStatus.RESOLVED))
                .thenReturn(List.of(sampleComplaintResolved));

        List<ComplaintDto> list = complaintService.getStudentComplaintsByAdmin(10L, ComplaintStatus.RESOLVED);

        assertEquals(1, list.size());
        assertEquals(ComplaintStatus.RESOLVED, list.get(0).getStatus());
    }

    // =========================================================================
    // ADMIN: respondToComplaint (status transition + response + audit stamps)
    // =========================================================================

    @Test
    void respondToComplaint_AdminResolve_Success() {
        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.RESOLVED)
                .adminResponse("Technician dispatched & belt was realigned.")
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(adminUser));
        when(complaintRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(sampleComplaintOpen));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ComplaintDto updated = complaintService.respondToComplaint(adminPrincipal, 200L, resp);

        assertEquals(ComplaintStatus.RESOLVED, updated.getStatus());
        assertEquals("Technician dispatched & belt was realigned.", updated.getAdminResponse());
        assertEquals(3L, updated.getResolvedByAdminId());
        assertEquals("System Admin", updated.getResolvedByAdminName());
        assertNotNull(updated.getResolvedAt());
        verify(complaintRepository, times(1)).save(any(Complaint.class));
    }

    @Test
    void respondToComplaint_AdminMarkInProgress_ClearsResolutionStamps() {
        sampleComplaintResolved.setStatus(ComplaintStatus.RESOLVED);
        sampleComplaintResolved.setResolvedByAdmin(adminUser);
        sampleComplaintResolved.setResolvedAt(LocalDateTime.now());

        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.IN_PROGRESS)
                .adminResponse("Reopening — issue reappeared.")
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(adminUser));
        when(complaintRepository.findByIdWithDetails(202L)).thenReturn(Optional.of(sampleComplaintResolved));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ComplaintDto updated = complaintService.respondToComplaint(adminPrincipal, 202L, resp);

        assertEquals(ComplaintStatus.IN_PROGRESS, updated.getStatus());
        assertNull(updated.getResolvedByAdminId());
        assertNull(updated.getResolvedAt());
    }

    @Test
    void respondToComplaint_ClosedCannotModify() {
        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.IN_PROGRESS)
                .adminResponse("Try again")
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(adminUser));
        when(complaintRepository.findByIdWithDetails(203L)).thenReturn(Optional.of(sampleComplaintClosed));

        assertThrows(BadRequestException.class, () ->
                complaintService.respondToComplaint(adminPrincipal, 203L, resp));
        verify(complaintRepository, never()).save(any());
    }

    @Test
    void respondToComplaint_ResolveRequiresAdminResponse() {
        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.RESOLVED)
                .adminResponse("   ")
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(adminUser));
        when(complaintRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(sampleComplaintOpen));

        assertThrows(BadRequestException.class, () ->
                complaintService.respondToComplaint(adminPrincipal, 200L, resp));
    }

    @Test
    void respondToComplaint_CloseRequiresAdminResponse() {
        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.CLOSED)
                .adminResponse(null)
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(adminUser));
        when(complaintRepository.findByIdWithDetails(200L)).thenReturn(Optional.of(sampleComplaintOpen));

        assertThrows(BadRequestException.class, () ->
                complaintService.respondToComplaint(adminPrincipal, 200L, resp));
    }

    @Test
    void respondToComplaint_ComplaintNotFound() {
        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.IN_PROGRESS)
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(adminUser));
        when(complaintRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                complaintService.respondToComplaint(adminPrincipal, 999L, resp));
    }

    @Test
    void respondToComplaint_AdminUserNotFound() {
        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.RESOLVED)
                .adminResponse("Done")
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                complaintService.respondToComplaint(adminPrincipal, 200L, resp));
    }

    // =========================================================================
    // AUTHORIZATION: role checks
    // =========================================================================

    @Test
    void respondToComplaint_TrainerRole_ThrowsUnauthorized() {
        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.RESOLVED)
                .adminResponse("X")
                .build();

        assertThrows(UnauthorizedException.class, () ->
                complaintService.respondToComplaint(trainerPrincipal, 200L, resp));
        verify(complaintRepository, never()).findByIdWithDetails(anyLong());
        verify(complaintRepository, never()).save(any());
    }

    @Test
    void respondToComplaint_StudentRole_ThrowsUnauthorized() {
        ComplaintResponseRequest resp = ComplaintResponseRequest.builder()
                .status(ComplaintStatus.RESOLVED)
                .adminResponse("X")
                .build();

        assertThrows(UnauthorizedException.class, () ->
                complaintService.respondToComplaint(studentPrincipal, 200L, resp));
    }

    // =========================================================================
    // ENUM parity + scaffold correctness (kept from previous scaffold)
    // =========================================================================

    @Test
    void enumValues_ComplaintCategory_MatchSchemaEnum() {
        assertTrue(ComplaintCategory.values().length >= 5);
        assertNotNull(ComplaintCategory.valueOf("EQUIPMENT"));
        assertNotNull(ComplaintCategory.valueOf("FACILITY"));
        assertNotNull(ComplaintCategory.valueOf("TRAINER"));
        assertNotNull(ComplaintCategory.valueOf("BILLING"));
        assertNotNull(ComplaintCategory.valueOf("OTHER"));
        assertNotNull(ComplaintCategory.valueOf("FACILITY_MAINTENANCE"));
        assertNotNull(ComplaintCategory.valueOf("EQUIPMENT_ISSUE"));
        assertNotNull(ComplaintCategory.valueOf("STAFF_BEHAVIOR"));
        assertNotNull(ComplaintCategory.valueOf("TRAINER_MISCONDUCT"));
        assertNotNull(ComplaintCategory.valueOf("BILLING_ISSUE"));
    }

    @Test
    void enumValues_ComplaintStatus_MatchSchemaEnum() {
        assertTrue(ComplaintStatus.values().length >= 4);
        assertNotNull(ComplaintStatus.valueOf("OPEN"));
        assertNotNull(ComplaintStatus.valueOf("IN_PROGRESS"));
        assertNotNull(ComplaintStatus.valueOf("RESOLVED"));
        assertNotNull(ComplaintStatus.valueOf("CLOSED"));
        assertNotNull(ComplaintStatus.valueOf("SUBMITTED"));
        assertNotNull(ComplaintStatus.valueOf("IN_REVIEW"));
        assertNotNull(ComplaintStatus.valueOf("REJECTED"));
    }

    @Test
    void enumValues_ComplaintPriority_MatchSchemaEnum() {
        assertEquals(4, ComplaintPriority.values().length);
        assertNotNull(ComplaintPriority.valueOf("LOW"));
        assertNotNull(ComplaintPriority.valueOf("MEDIUM"));
        assertNotNull(ComplaintPriority.valueOf("HIGH"));
        assertNotNull(ComplaintPriority.valueOf("CRITICAL"));
    }

    @Test
    void scaffold_RolesCorrect() {
        assertEquals(RoleName.ROLE_STUDENT, studentPrincipal.getRole());
        assertEquals(RoleName.ROLE_ADMIN, adminPrincipal.getRole());
        assertEquals(RoleName.ROLE_TRAINER, trainerPrincipal.getRole());
    }
}
