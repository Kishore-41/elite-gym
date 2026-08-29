package com.elitegym.dto.payment;

import com.elitegym.enums.PaymentMethod;
import com.elitegym.enums.PaymentStatus;
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
public class PaymentDto {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long membershipId;
    private Long planId;
    private String planName;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private PaymentStatus paymentStatus;
    private String invoiceNumber;
    private LocalDateTime paidAt;
    private String notes;
    private LocalDateTime createdAt;
}
