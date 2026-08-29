package com.elitegym.dto.membership;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlanCreateRequest {

    @NotBlank(message = "Plan name is required")
    @Size(max = 100, message = "Plan name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Plan description is required")
    private String description;

    @NotNull(message = "Duration in months is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    @Max(value = 120, message = "Duration cannot exceed 120 months")
    private Integer durationMonths;

    @NotNull(message = "Plan price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0.00")
    private BigDecimal price;

    @Builder.Default
    private List<String> features = new ArrayList<>();

    @Builder.Default
    private Boolean isActive = true;
}
