package com.elitegym.dto.membership;

import com.elitegym.enums.MembershipStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MembershipStatusUpdateRequest {

    @NotNull(message = "Membership status is required")
    private MembershipStatus status;
}
