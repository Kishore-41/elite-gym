package com.elitegym.dto.membership;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPurchaseRequest {

    @NotNull(message = "Membership plan ID is required")
    private Long planId;

    private LocalDate startDate;
}
