package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.payment.PaymentDto;
import com.elitegym.dto.payment.PaymentStatusUpdateRequest;
import com.elitegym.enums.PaymentStatus;
import com.elitegym.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/admin/payments", "/api/v1/admin/payments"})
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getAllPayments() {
        List<PaymentDto> list = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.ok("All payments retrieved", list));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getByStatus(@PathVariable PaymentStatus status) {
        List<PaymentDto> list = paymentService.getPaymentsByStatus(status);
        return ResponseEntity.ok(ApiResponse.ok("Payments by status", list));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getByStudent(@PathVariable Long studentId) {
        List<PaymentDto> list = paymentService.getPaymentsByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.ok("Payments by student", list));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentDto>> getDetail(@PathVariable Long paymentId) {
        PaymentDto dto = paymentService.getPaymentDetail(paymentId);
        return ResponseEntity.ok(ApiResponse.ok("Payment detail", dto));
    }

    @PutMapping("/{paymentId}/status")
    public ResponseEntity<ApiResponse<PaymentDto>> updateStatus(
            @PathVariable Long paymentId,
            @Valid @RequestBody PaymentStatusUpdateRequest request) {
        log.info("Admin updating payment #{} status to {}", paymentId, request.getPaymentStatus());
        PaymentDto updated = paymentService.updatePaymentStatus(paymentId, request);
        return ResponseEntity.ok(ApiResponse.ok("Payment status updated", updated));
    }
}
