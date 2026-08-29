package com.elitegym.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerDashboardDto {
    private Long trainerId;
    private String trainerName;
    private String specialization;
    private Integer studentCapacity;
    private Integer activeStudentsCount;
    private Integer pendingRequestsCount;
    private Integer activeWorkoutPlansCount;

    private List<AssignedStudentSummary> students;
    private List<PendingRequestSummary> pendingRequests;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignedStudentSummary {
        private Long studentId;
        private String studentName;
        private String email;
        private String fitnessGoal;
        private String activePlanName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PendingRequestSummary {
        private Long requestId;
        private Long studentId;
        private String studentName;
        private String requestType;
        private String notes;
        private String createdAt;
    }
}
