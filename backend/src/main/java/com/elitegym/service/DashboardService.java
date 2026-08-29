package com.elitegym.service;

import com.elitegym.dto.dashboard.AdminDashboardDto;
import com.elitegym.dto.dashboard.StudentDashboardDto;
import com.elitegym.dto.dashboard.TrainerDashboardDto;
import com.elitegym.entity.*;
import com.elitegym.enums.AttendanceStatus;
import com.elitegym.enums.ComplaintStatus;
import com.elitegym.enums.MembershipStatus;
import com.elitegym.enums.PaymentStatus;
import com.elitegym.enums.RequestStatus;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.repository.*;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentProfileRepository studentProfileRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final UserRepository userRepository;
    private final StudentMembershipRepository studentMembershipRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRepository attendanceRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final TrainerRequestRepository trainerRequestRepository;
    private final ComplaintRepository complaintRepository;
    private final NotificationRepository notificationRepository;
    private final ProgressEntryRepository progressEntryRepository;

    @Transactional(readOnly = true)
    public StudentDashboardDto getStudentDashboard(UserPrincipal principal) {
        StudentProfile student = studentProfileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", principal.getId()));

        LocalDate today = LocalDate.now();

        // 1. Membership info
        List<StudentMembership> activeMemberships = studentMembershipRepository
                .findActiveMembershipsByStudentId(student.getId(), MembershipStatus.ACTIVE, today);
        StudentMembership activeMembership = activeMemberships.isEmpty() ? null : activeMemberships.get(0);
        String planName = activeMembership != null ? activeMembership.getPlan().getName() : null;
        String membershipStatus = activeMembership != null ? activeMembership.getStatus().name() : "INACTIVE";
        LocalDate endDate = activeMembership != null ? activeMembership.getEndDate() : null;
        Long daysRemaining = (endDate != null && !endDate.isBefore(today)) ? ChronoUnit.DAYS.between(today, endDate) : 0L;

        // 2. Trainer info
        TrainerProfile trainer = student.getAssignedTrainer();
        String trainerName = trainer != null ? trainer.getUser().getFirstName() + " " + trainer.getUser().getLastName() : null;
        String trainerSpec = trainer != null ? trainer.getSpecialization() : null;
        Long trainerId = trainer != null ? trainer.getId() : null;

        // 3. Attendance stats & today's checkin
        Attendance todayAtt = attendanceRepository.findByStudentIdAndDate(student.getId(), today).orElse(null);
        Boolean todayCheckedIn = todayAtt != null;
        long duration = (todayAtt != null && todayAtt.getCheckInTime() != null && todayAtt.getCheckOutTime() != null)
                ? Math.max(0, Duration.between(todayAtt.getCheckInTime(), todayAtt.getCheckOutTime()).toMinutes())
                : 0L;

        long present = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.PRESENT);
        long late = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.LATE);
        long absent = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.ABSENT);
        long totalAtt = present + late + absent;
        double rate = totalAtt == 0 ? 0.0 : Math.round(((present + late) * 1000.0) / totalAtt) / 10.0;

        List<Attendance> last30 = attendanceRepository.findByStudentIdAndDateRangeWithDetails(
                student.getId(), today.minusDays(29), today);
        long streak = computeStreak(last30, today);

        // 4. Progress
        List<ProgressEntry> progressList = progressEntryRepository.findTopByStudentIdOrderByRecordDateDesc(student.getId());
        ProgressEntry latestProgress = progressList.isEmpty() ? null : progressList.get(0);

        // 5. Workout plan
        List<WorkoutPlan> plans = workoutPlanRepository.findActiveByStudentIdWithDetails(student.getId());
        WorkoutPlan activePlan = plans.isEmpty() ? null : plans.get(0);
        int exerciseCount = (activePlan != null && activePlan.getExercises() != null) ? activePlan.getExercises().size() : 0;

        // 6. Counts
        long unreadNotifs = notificationRepository.countUnreadByUserId(principal.getId());
        List<Complaint> complaints = complaintRepository.findByStudentIdWithDetails(student.getId());
        long activeComplaints = complaints.stream().filter(c -> c.getStatus() == ComplaintStatus.OPEN || c.getStatus() == ComplaintStatus.IN_PROGRESS).count();

        return StudentDashboardDto.builder()
                .studentId(student.getId())
                .studentName(student.getUser().getFirstName() + " " + student.getUser().getLastName())
                .studentEmail(student.getUser().getEmail())
                .activePlanName(planName)
                .membershipStatus(membershipStatus)
                .membershipEndDate(endDate)
                .daysRemaining(daysRemaining)
                .assignedTrainerId(trainerId)
                .assignedTrainerName(trainerName)
                .assignedTrainerSpecialization(trainerSpec)
                .attendanceStreak(streak)
                .attendanceRate(rate)
                .todayCheckedIn(todayCheckedIn)
                .todayCheckInTime(todayAtt != null ? todayAtt.getCheckInTime() : null)
                .todayDurationMinutes(duration)
                .latestWeightKg(latestProgress != null ? latestProgress.getWeightKg() : student.getWeightKg())
                .latestHeightCm(latestProgress != null ? latestProgress.getHeightCm() : student.getHeightCm())
                .latestBodyFatPct(latestProgress != null ? latestProgress.getBodyFatPct() : null)
                .latestProgressDate(latestProgress != null ? latestProgress.getRecordDate() : null)
                .activeWorkoutPlanId(activePlan != null ? activePlan.getId() : null)
                .activeWorkoutPlanTitle(activePlan != null ? activePlan.getTitle() : null)
                .todayExercisesCount(exerciseCount)
                .unreadNotificationsCount(unreadNotifs)
                .activeComplaintsCount(activeComplaints)
                .build();
    }

    @Transactional(readOnly = true)
    public TrainerDashboardDto getTrainerDashboard(UserPrincipal principal) {
        TrainerProfile trainer = trainerProfileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("TrainerProfile", "userId", principal.getId()));

        List<StudentProfile> assigned = studentProfileRepository.findByAssignedTrainerIdWithUser(trainer.getId());
        List<TrainerRequest> pendingReqs = trainerRequestRepository.findByTrainerIdAndStatus(trainer.getId(), RequestStatus.PENDING);
        List<WorkoutPlan> workoutPlans = workoutPlanRepository.findByTrainerIdWithDetails(trainer.getId());

        List<TrainerDashboardDto.AssignedStudentSummary> studentSummaries = assigned.stream()
                .map(s -> TrainerDashboardDto.AssignedStudentSummary.builder()
                        .studentId(s.getId())
                        .studentName(s.getUser().getFirstName() + " " + s.getUser().getLastName())
                        .email(s.getUser().getEmail())
                        .fitnessGoal(s.getFitnessGoal())
                        .activePlanName(s.getFitnessGoal() != null ? s.getFitnessGoal() : "Standard Fitness")
                        .build())
                .collect(Collectors.toList());

        List<TrainerDashboardDto.PendingRequestSummary> requestSummaries = pendingReqs.stream()
                .map(r -> TrainerDashboardDto.PendingRequestSummary.builder()
                        .requestId(r.getId())
                        .studentId(r.getStudent().getId())
                        .studentName(r.getStudent().getUser().getFirstName() + " " + r.getStudent().getUser().getLastName())
                        .requestType(r.getRequestType().name())
                        .notes(r.getRequestNotes())
                        .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "")
                        .build())
                .collect(Collectors.toList());

        return TrainerDashboardDto.builder()
                .trainerId(trainer.getId())
                .trainerName(trainer.getUser().getFirstName() + " " + trainer.getUser().getLastName())
                .specialization(trainer.getSpecialization())
                .studentCapacity(trainer.getMaxStudentCapacity())
                .activeStudentsCount(assigned.size())
                .pendingRequestsCount(pendingReqs.size())
                .activeWorkoutPlansCount(workoutPlans.size())
                .students(studentSummaries)
                .pendingRequests(requestSummaries)
                .build();
    }

    @Transactional(readOnly = true)
    public AdminDashboardDto getAdminDashboard() {
        long studentCount = studentProfileRepository.count();
        long trainerCount = trainerProfileRepository.count();

        LocalDate today = LocalDate.now();
        List<StudentMembership> activeMemberships = studentMembershipRepository.findByStatusWithDetails(MembershipStatus.ACTIVE);
        long activeCount = activeMemberships.stream()
                .filter(m -> !m.getEndDate().isBefore(today))
                .count();

        List<Attendance> todayAtt = attendanceRepository.findByDateWithDetails(today);

        List<Payment> allPayments = paymentRepository.findAllWithDetails();
        BigDecimal totalRevenue = allPayments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Complaint> allComplaints = complaintRepository.findAllWithDetails();
        long openComplaints = allComplaints.stream()
                .filter(c -> c.getStatus() == ComplaintStatus.OPEN || c.getStatus() == ComplaintStatus.IN_PROGRESS)
                .count();

        List<AdminDashboardDto.RecentPaymentSummary> recentPayments = allPayments.stream()
                .sorted(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(p -> AdminDashboardDto.RecentPaymentSummary.builder()
                        .paymentId(p.getId())
                        .invoiceNumber(p.getInvoiceNumber())
                        .studentName(p.getStudent().getUser().getFirstName() + " " + p.getStudent().getUser().getLastName())
                        .planName(p.getMembership().getPlan().getName())
                        .amount(p.getAmount())
                        .status(p.getPaymentStatus().name())
                        .date(p.getCreatedAt() != null ? p.getCreatedAt().toString() : "")
                        .build())
                .collect(Collectors.toList());

        List<AdminDashboardDto.RecentComplaintSummary> recentComplaints = allComplaints.stream()
                .sorted(Comparator.comparing(Complaint::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(c -> AdminDashboardDto.RecentComplaintSummary.builder()
                        .complaintId(c.getId())
                        .studentName(c.getStudent().getUser().getFirstName() + " " + c.getStudent().getUser().getLastName())
                        .subject(c.getSubject())
                        .category(c.getCategory().name())
                        .priority(c.getPriority().name())
                        .status(c.getStatus().name())
                        .date(c.getCreatedAt() != null ? c.getCreatedAt().toString() : "")
                        .build())
                .collect(Collectors.toList());

        return AdminDashboardDto.builder()
                .totalStudentsCount(studentCount)
                .totalTrainersCount(trainerCount)
                .activeMembershipsCount(activeCount)
                .todayAttendanceCount((long) todayAtt.size())
                .totalRevenue(totalRevenue)
                .openComplaintsCount(openComplaints)
                .recentPayments(recentPayments)
                .recentComplaints(recentComplaints)
                .build();
    }

    private long computeStreak(List<Attendance> last30, LocalDate today) {
        long streak = 0;
        LocalDate cursor = today;
        List<LocalDate> presentDates = last30.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE)
                .map(Attendance::getDate)
                .distinct()
                .collect(Collectors.toList());
        for (int i = 0; i < 30; i++) {
            final LocalDate d = cursor;
            if (presentDates.stream().anyMatch(pd -> pd.isEqual(d))) {
                streak++;
                cursor = cursor.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }
}
