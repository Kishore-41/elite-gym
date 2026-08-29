package com.elitegym.dto.payment;

import com.elitegym.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusUpdateRequest {

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    @Size(max = 255, message = "Notes must be at most 255 characters")
    private String notes;
}
