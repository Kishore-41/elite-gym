package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.payment.PaymentCreateRequest;
import com.elitegym.dto.payment.PaymentDto;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/student/payments", "/api/v1/student/payments"})
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PaymentDto> list = paymentService.getMyPayments(principal);
        return ResponseEntity.ok(ApiResponse.ok("Payment history retrieved", list));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentDto>> getDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long paymentId) {
        PaymentDto dto = paymentService.getMyPaymentDetail(principal, paymentId);
        return ResponseEntity.ok(ApiResponse.ok("Payment detail", dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentDto>> createPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PaymentCreateRequest request) {
        log.info("Student #{} paying for membership #{}, amount {}",
                principal.getId(), request.getMembershipId(), request.getAmount());
        PaymentDto created = paymentService.createPayment(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Payment processed successfully", created), HttpStatus.CREATED);
    }
}
