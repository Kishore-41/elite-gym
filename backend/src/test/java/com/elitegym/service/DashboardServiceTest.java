package com.elitegym.service;

import com.elitegym.dto.dashboard.AdminDashboardDto;
import com.elitegym.dto.dashboard.StudentDashboardDto;
import com.elitegym.dto.dashboard.TrainerDashboardDto;
import com.elitegym.entity.*;
import com.elitegym.enums.*;
import com.elitegym.repository.*;
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
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private TrainerProfileRepository trainerProfileRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentMembershipRepository studentMembershipRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private WorkoutPlanRepository workoutPlanRepository;
    @Mock
    private TrainerRequestRepository trainerRequestRepository;
    @Mock
    private ComplaintRepository complaintRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private ProgressEntryRepository progressEntryRepository;

    @InjectMocks
    private DashboardService dashboardService;

    private User studentUser;
    private User trainerUser;
    private StudentProfile studentProfile;
    private TrainerProfile trainerProfile;
    private UserPrincipal studentPrincipal;
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
                .isActive(true)
                .build();

        trainerUser = User.builder()
                .id(2L)
                .email("trainer@elitegym.com")
                .username("coach_bob")
                .firstName("Bob")
                .lastName("Coach")
                .role(RoleName.ROLE_TRAINER)
                .isActive(true)
                .build();

        trainerProfile = TrainerProfile.builder()
                .id(20L)
                .user(trainerUser)
                .specialization("Strength & Bodybuilding")
                .experienceYears(6)
                .maxStudentCapacity(15)
                .build();

        studentProfile = StudentProfile.builder()
                .id(10L)
                .user(studentUser)
                .fitnessGoal("Hypertrophy")
                .assignedTrainer(trainerProfile)
                .heightCm(new BigDecimal("180.0"))
                .weightKg(new BigDecimal("78.5"))
                .build();

        studentPrincipal = UserPrincipal.create(studentUser);
        trainerPrincipal = UserPrincipal.create(trainerUser);
    }

    @Test
    void getStudentDashboard_Success() {
        MembershipPlan plan = MembershipPlan.builder()
                .id(100L)
                .name("Pro Quarterly")
                .price(new BigDecimal("2999.00"))
                .durationMonths(3)
                .build();

        StudentMembership membership = StudentMembership.builder()
                .id(50L)
                .student(studentProfile)
                .plan(plan)
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().plusDays(80))
                .status(MembershipStatus.ACTIVE)
                .build();

        Attendance attendanceToday = Attendance.builder()
                .id(300L)
                .student(studentProfile)
                .date(LocalDate.now())
                .checkInTime(LocalTime.of(8, 30))
                .checkOutTime(LocalTime.of(9, 45))
                .status(AttendanceStatus.PRESENT)
                .build();

        WorkoutPlan activePlan = WorkoutPlan.builder()
                .id(400L)
                .title("Push Pull Legs Split")
                .isActive(true)
                .exercises(List.of(WorkoutExercise.builder().id(1L).build()))
                .build();

        ProgressEntry latestProgress = ProgressEntry.builder()
                .id(500L)
                .student(studentProfile)
                .recordDate(LocalDate.now().minusDays(2))
                .weightKg(new BigDecimal("77.8"))
                .heightCm(new BigDecimal("180.0"))
                .bodyFatPct(new BigDecimal("14.5"))
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(studentProfile));
        when(studentMembershipRepository.findActiveMembershipsByStudentId(eq(10L), eq(MembershipStatus.ACTIVE), any(LocalDate.class)))
                .thenReturn(List.of(membership));
        when(attendanceRepository.findByStudentIdAndDate(10L, LocalDate.now())).thenReturn(Optional.of(attendanceToday));
        when(attendanceRepository.countByStudentIdAndStatus(10L, AttendanceStatus.PRESENT)).thenReturn(10L);
        when(attendanceRepository.countByStudentIdAndStatus(10L, AttendanceStatus.LATE)).thenReturn(1L);
        when(attendanceRepository.countByStudentIdAndStatus(10L, AttendanceStatus.ABSENT)).thenReturn(1L);
        when(attendanceRepository.findByStudentIdAndDateRangeWithDetails(eq(10L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(attendanceToday));
        when(progressEntryRepository.findTopByStudentIdOrderByRecordDateDesc(10L)).thenReturn(List.of(latestProgress));
        when(workoutPlanRepository.findActiveByStudentIdWithDetails(10L)).thenReturn(List.of(activePlan));
        when(notificationRepository.countUnreadByUserId(1L)).thenReturn(3L);
        when(complaintRepository.findByStudentIdWithDetails(10L)).thenReturn(Collections.emptyList());

        StudentDashboardDto dto = dashboardService.getStudentDashboard(studentPrincipal);

        assertNotNull(dto);
        assertEquals(10L, dto.getStudentId());
        assertEquals("John Doe", dto.getStudentName());
        assertEquals("Pro Quarterly", dto.getActivePlanName());
        assertEquals("ACTIVE", dto.getMembershipStatus());
        assertTrue(dto.getTodayCheckedIn());
        assertEquals(75L, dto.getTodayDurationMinutes());
        assertEquals("Bob Coach", dto.getAssignedTrainerName());
        assertEquals("Push Pull Legs Split", dto.getActiveWorkoutPlanTitle());
        assertEquals(1, dto.getTodayExercisesCount());
        assertEquals(3L, dto.getUnreadNotificationsCount());
        assertEquals(new BigDecimal("77.8"), dto.getLatestWeightKg());
    }

    @Test
    void getTrainerDashboard_Success() {
        TrainerRequest pendingReq = TrainerRequest.builder()
                .id(80L)
                .student(studentProfile)
                .trainer(trainerProfile)
                .requestType(RequestType.TRAINER_ASSIGNMENT)
                .status(RequestStatus.PENDING)
                .requestNotes("Looking for nutrition advice")
                .createdAt(LocalDateTime.now().minusHours(4))
                .build();

        WorkoutPlan plan = WorkoutPlan.builder()
                .id(400L)
                .trainer(trainerProfile)
                .title("Bulking 101")
                .isActive(true)
                .build();

        when(trainerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(trainerProfile));
        when(studentProfileRepository.findByAssignedTrainerIdWithUser(20L)).thenReturn(List.of(studentProfile));
        when(trainerRequestRepository.findByTrainerIdAndStatus(20L, RequestStatus.PENDING)).thenReturn(List.of(pendingReq));
        when(workoutPlanRepository.findByTrainerIdWithDetails(20L)).thenReturn(List.of(plan));

        TrainerDashboardDto dto = dashboardService.getTrainerDashboard(trainerPrincipal);

        assertNotNull(dto);
        assertEquals(20L, dto.getTrainerId());
        assertEquals("Bob Coach", dto.getTrainerName());
        assertEquals(15, dto.getStudentCapacity());
        assertEquals(1, dto.getActiveStudentsCount());
        assertEquals(1, dto.getPendingRequestsCount());
        assertEquals(1, dto.getActiveWorkoutPlansCount());
        assertEquals(1, dto.getStudents().size());
        assertEquals("John Doe", dto.getStudents().get(0).getStudentName());
        assertEquals(1, dto.getPendingRequests().size());
        assertEquals("TRAINER_ASSIGNMENT", dto.getPendingRequests().get(0).getRequestType());
    }

    @Test
    void getAdminDashboard_Success() {
        MembershipPlan plan = MembershipPlan.builder()
                .id(100L)
                .name("Pro Quarterly")
                .build();

        StudentMembership membership = StudentMembership.builder()
                .id(50L)
                .student(studentProfile)
                .plan(plan)
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().plusDays(80))
                .status(MembershipStatus.ACTIVE)
                .build();

        Payment payment = Payment.builder()
                .id(900L)
                .student(studentProfile)
                .membership(membership)
                .amount(new BigDecimal("2999.00"))
                .invoiceNumber("INV-900")
                .paymentStatus(PaymentStatus.SUCCESS)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Complaint complaint = Complaint.builder()
                .id(700L)
                .student(studentProfile)
                .subject("Water cooler issue")
                .category(ComplaintCategory.FACILITY)
                .priority(ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.OPEN)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        when(studentProfileRepository.count()).thenReturn(45L);
        when(trainerProfileRepository.count()).thenReturn(6L);
        when(studentMembershipRepository.findByStatusWithDetails(MembershipStatus.ACTIVE)).thenReturn(List.of(membership));
        when(attendanceRepository.findByDateWithDetails(LocalDate.now())).thenReturn(Collections.emptyList());
        when(paymentRepository.findAllWithDetails()).thenReturn(List.of(payment));
        when(complaintRepository.findAllWithDetails()).thenReturn(List.of(complaint));

        AdminDashboardDto dto = dashboardService.getAdminDashboard();

        assertNotNull(dto);
        assertEquals(45L, dto.getTotalStudentsCount());
        assertEquals(6L, dto.getTotalTrainersCount());
        assertEquals(1L, dto.getActiveMembershipsCount());
        assertEquals(0L, dto.getTodayAttendanceCount());
        assertEquals(new BigDecimal("2999.00"), dto.getTotalRevenue());
        assertEquals(1L, dto.getOpenComplaintsCount());
        assertEquals(1, dto.getRecentPayments().size());
        assertEquals("INV-900", dto.getRecentPayments().get(0).getInvoiceNumber());
        assertEquals(1, dto.getRecentComplaints().size());
        assertEquals("Water cooler issue", dto.getRecentComplaints().get(0).getSubject());
    }
}
