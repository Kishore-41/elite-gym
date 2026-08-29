package com.elitegym.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDto {
    private Long studentId;
    private String studentName;
    private String studentEmail;

    // Membership
    private String activePlanName;
    private String membershipStatus;
    private LocalDate membershipEndDate;
    private Long daysRemaining;

    // Trainer
    private Long assignedTrainerId;
    private String assignedTrainerName;
    private String assignedTrainerSpecialization;

    // Attendance
    private Long attendanceStreak;
    private Double attendanceRate;
    private Boolean todayCheckedIn;
    private LocalTime todayCheckInTime;
    private Long todayDurationMinutes;

    // Progress
    private BigDecimal latestWeightKg;
    private BigDecimal latestHeightCm;
    private BigDecimal latestBodyFatPct;
    private LocalDate latestProgressDate;

    // Workout
    private Long activeWorkoutPlanId;
    private String activeWorkoutPlanTitle;
    private Integer todayExercisesCount;

    // Alerts
    private Long unreadNotificationsCount;
    private Long activeComplaintsCount;
}
