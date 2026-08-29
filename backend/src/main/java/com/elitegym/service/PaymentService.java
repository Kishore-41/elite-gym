package com.elitegym.service;

import com.elitegym.dto.payment.PaymentCreateRequest;
import com.elitegym.dto.payment.PaymentDto;
import com.elitegym.dto.payment.PaymentStatusUpdateRequest;
import com.elitegym.entity.Payment;
import com.elitegym.entity.StudentMembership;
import com.elitegym.entity.StudentProfile;
import com.elitegym.enums.MembershipStatus;
import com.elitegym.enums.PaymentStatus;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.PaymentRepository;
import com.elitegym.repository.StudentMembershipRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentMembershipRepository membershipRepository;
    private final StudentProfileRepository studentProfileRepository;

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    private void assertOwner(Payment payment, Long studentId) {
        if (!payment.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You are not authorized to access this payment.");
        }
    }

    private String generateInvoiceNumber() {
        return "INV-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }

    private void validateCreateRequest(PaymentCreateRequest req, StudentMembership membership, Long studentId) {
        if (!membership.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("Membership does not belong to this student.");
        }
        if (req.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be positive.");
        }
        if (paymentRepository.existsByTransactionId(req.getTransactionId())) {
            throw new BadRequestException("Transaction ID already exists.");
        }
    }

    @Transactional
    public PaymentDto createPayment(UserPrincipal principal, PaymentCreateRequest request) {
        StudentProfile student = getStudentProfile(principal.getId());

        StudentMembership membership = membershipRepository.findById(request.getMembershipId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentMembership", "id", request.getMembershipId()));

        validateCreateRequest(request, membership, student.getId());

        LocalDateTime paidAt = request.getPaidAt() != null ? request.getPaidAt() : LocalDateTime.now();
        PaymentStatus status = request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.SUCCESS;

        String invoiceNumber = generateInvoiceNumber();
        while (paymentRepository.existsByInvoiceNumber(invoiceNumber)) {
            invoiceNumber = generateInvoiceNumber();
        }

        Payment payment = Payment.builder()
                .student(student)
                .membership(membership)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionId(request.getTransactionId())
                .paymentStatus(status)
                .invoiceNumber(invoiceNumber)
                .paidAt(paidAt)
                .notes(request.getNotes())
                .build();

        Payment saved = paymentRepository.save(payment);

        if (status == PaymentStatus.SUCCESS
                && (membership.getStatus() == MembershipStatus.PENDING || membership.getStatus() == MembershipStatus.CANCELLED)) {
            membership.setStatus(MembershipStatus.ACTIVE);
            membershipRepository.save(membership);
            log.info("Membership #{} activated after successful payment #{}", membership.getId(), saved.getId());
        }

        log.info("Payment #{} created for student #{} (membership #{}, amount {})",
                saved.getId(), student.getId(), membership.getId(), saved.getAmount());
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getMyPayments(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        return paymentRepository.findByStudentIdWithDetails(student.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentDto getMyPaymentDetail(UserPrincipal principal, Long paymentId) {
        StudentProfile student = getStudentProfile(principal.getId());
        Payment payment = paymentRepository.findByIdWithDetails(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));
        assertOwner(payment, student.getId());
        return mapToDto(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAllWithDetails()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByStatusWithDetails(status)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByStudent(Long studentId) {
        return paymentRepository.findByStudentIdWithDetails(studentId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentDto getPaymentDetail(Long paymentId) {
        Payment payment = paymentRepository.findByIdWithDetails(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));
        return mapToDto(payment);
    }

    @Transactional
    public PaymentDto updatePaymentStatus(Long paymentId, PaymentStatusUpdateRequest request) {
        Payment payment = paymentRepository.findByIdWithDetails(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        PaymentStatus oldStatus = payment.getPaymentStatus();
        PaymentStatus newStatus = request.getPaymentStatus();

        if (oldStatus == PaymentStatus.REFUNDED && newStatus != PaymentStatus.REFUNDED) {
            throw new BadRequestException("Refunded payments cannot be un-refunded.");
        }

        payment.setPaymentStatus(newStatus);
        if (request.getNotes() != null) {
            payment.setNotes(request.getNotes());
        }

        StudentMembership membership = payment.getMembership();
        if (newStatus == PaymentStatus.SUCCESS
                && (membership.getStatus() == MembershipStatus.PENDING || membership.getStatus() == MembershipStatus.CANCELLED)) {
            membership.setStatus(MembershipStatus.ACTIVE);
            membershipRepository.save(membership);
        }

        Payment saved = paymentRepository.save(payment);
        log.info("Admin updated payment #{} status: {} -> {}", paymentId, oldStatus, newStatus);
        return mapToDto(saved);
    }

    private PaymentDto mapToDto(Payment p) {
        return PaymentDto.builder()
                .id(p.getId())
                .studentId(p.getStudent().getId())
                .studentName(p.getStudent().getUser().getFirstName() + " " + p.getStudent().getUser().getLastName())
                .studentEmail(p.getStudent().getUser().getEmail())
                .membershipId(p.getMembership().getId())
                .planId(p.getMembership().getPlan().getId())
                .planName(p.getMembership().getPlan().getName())
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .transactionId(p.getTransactionId())
                .paymentStatus(p.getPaymentStatus())
                .invoiceNumber(p.getInvoiceNumber())
                .paidAt(p.getPaidAt())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
