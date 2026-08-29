package com.elitegym.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private Long totalStudentsCount;
    private Long totalTrainersCount;
    private Long activeMembershipsCount;
    private Long todayAttendanceCount;
    private BigDecimal totalRevenue;
    private Long openComplaintsCount;

    private List<RecentPaymentSummary> recentPayments;
    private List<RecentComplaintSummary> recentComplaints;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentPaymentSummary {
        private Long paymentId;
        private String invoiceNumber;
        private String studentName;
        private String planName;
        private BigDecimal amount;
        private String status;
        private String date;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentComplaintSummary {
        private Long complaintId;
        private String studentName;
        private String subject;
        private String category;
        private String priority;
        private String status;
        private String date;
    }
}
