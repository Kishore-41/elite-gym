package com.elitegym.dto.membership;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlanDto {

    private Long id;
    private String name;
    private String description;
    private Integer durationMonths;
    private BigDecimal price;
    private List<String> features;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
