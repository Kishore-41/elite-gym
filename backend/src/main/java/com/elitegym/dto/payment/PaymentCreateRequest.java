package com.elitegym.dto.payment;

import com.elitegym.enums.PaymentMethod;
import com.elitegym.enums.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateRequest {

    @NotNull(message = "Membership ID is required")
    private Long membershipId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Transaction ID is required")
    @Size(max = 100, message = "Transaction ID must be at most 100 characters")
    private String transactionId;

    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.SUCCESS;

    @Size(max = 255, message = "Notes must be at most 255 characters")
    private String notes;

    private LocalDateTime paidAt;
}
