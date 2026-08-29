package com.elitegym.dto.membership;

import com.elitegym.enums.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentMembershipDto {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long planId;
    private String planName;
    private BigDecimal planPrice;
    private Integer durationMonths;
    private List<String> planFeatures;
    private LocalDate startDate;
    private LocalDate endDate;
    private MembershipStatus status;
    private Long daysRemaining;
    private Boolean isCurrentlyActive;
    private LocalDateTime createdAt;
}
