package com.elitegym.service;

import com.elitegym.dto.payment.PaymentCreateRequest;
import com.elitegym.dto.payment.PaymentDto;
import com.elitegym.dto.payment.PaymentStatusUpdateRequest;
import com.elitegym.entity.*;
import com.elitegym.enums.MembershipStatus;
import com.elitegym.enums.PaymentMethod;
import com.elitegym.enums.PaymentStatus;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.PaymentRepository;
import com.elitegym.repository.StudentMembershipRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private StudentMembershipRepository membershipRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private PaymentService paymentService;

    private User studentUser;
    private User otherStudentUser;
    private User adminUser;
    private StudentProfile sampleStudent;
    private StudentProfile otherStudentProfile;
    private MembershipPlan proPlan;
    private StudentMembership pendingMembership;
    private StudentMembership activeMembership;
    private Payment paidPayment;
    private Payment pendingPayment;
    private Payment refundedPayment;
    private UserPrincipal studentPrincipal;
    private UserPrincipal otherStudentPrincipal;

    @BeforeEach
    void setUp() {
        studentUser = User.builder()
                .id(1L)
                .email("john@elitegym.com")
                .username("john")
                .firstName("John")
                .lastName("Doe")
                .role(RoleName.ROLE_STUDENT)
                .isActive(true)
                .build();

        otherStudentUser = User.builder()
                .id(10L)
                .email("sara@elitegym.com")
                .username("sara")
                .firstName("Sara")
                .lastName("Lee")
                .role(RoleName.ROLE_STUDENT)
                .isActive(true)
                .build();

        adminUser = User.builder()
                .id(99L)
                .email("admin@elitegym.com")
                .role(RoleName.ROLE_ADMIN)
                .isActive(true)
                .build();

        sampleStudent = StudentProfile.builder()
                .id(20L)
                .user(studentUser)
                .build();

        otherStudentProfile = StudentProfile.builder()
                .id(30L)
                .user(otherStudentUser)
                .build();

        proPlan = MembershipPlan.builder()
                .id(5L)
                .name("Pro Quarterly")
                .price(new BigDecimal("2999.00"))
                .durationMonths(3)
                .isActive(true)
                .build();

        pendingMembership = StudentMembership.builder()
                .id(100L)
                .student(sampleStudent)
                .plan(proPlan)
                .status(MembershipStatus.PENDING)
                .build();

        activeMembership = StudentMembership.builder()
                .id(101L)
                .student(sampleStudent)
                .plan(proPlan)
                .status(MembershipStatus.ACTIVE)
                .build();

        paidPayment = Payment.builder()
                .id(1000L)
                .student(sampleStudent)
                .membership(activeMembership)
                .amount(new BigDecimal("2999.00"))
                .paymentMethod(PaymentMethod.UPI)
                .transactionId("TXN-JAN-001")
                .paymentStatus(PaymentStatus.SUCCESS)
                .invoiceNumber("INV-1000")
                .paidAt(LocalDateTime.now().minusDays(7))
                .createdAt(LocalDateTime.now().minusDays(7))
                .build();

        pendingPayment = Payment.builder()
                .id(1001L)
                .student(sampleStudent)
                .membership(pendingMembership)
                .amount(new BigDecimal("2999.00"))
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .transactionId("TXN-FEB-099")
                .paymentStatus(PaymentStatus.PENDING)
                .invoiceNumber("INV-1001")
                .paidAt(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .build();

        refundedPayment = Payment.builder()
                .id(1002L)
                .student(sampleStudent)
                .membership(activeMembership)
                .amount(new BigDecimal("2999.00"))
                .paymentMethod(PaymentMethod.NET_BANKING)
                .transactionId("TXN-REFUND-01")
                .paymentStatus(PaymentStatus.REFUNDED)
                .invoiceNumber("INV-1002")
                .paidAt(LocalDateTime.now().minusDays(2))
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

        studentPrincipal = UserPrincipal.create(studentUser);
        otherStudentPrincipal = UserPrincipal.create(otherStudentUser);
    }

    // =========================================================================
    // CREATE
    // =========================================================================

    @Test
    void createPayment_Success_ActivatesPendingMembership() {
        PaymentCreateRequest req = PaymentCreateRequest.builder()
                .membershipId(100L)
                .amount(new BigDecimal("2999.00"))
                .paymentMethod(PaymentMethod.UPI)
                .transactionId("TXN-NEW-1")
                .paymentStatus(PaymentStatus.SUCCESS)
                .notes("Welcome payment")
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(membershipRepository.findById(100L)).thenReturn(Optional.of(pendingMembership));
        when(paymentRepository.existsByTransactionId("TXN-NEW-1")).thenReturn(false);
        when(paymentRepository.existsByInvoiceNumber(anyString())).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(5000L);
            return p;
        });

        PaymentDto dto = paymentService.createPayment(studentPrincipal, req);

        assertEquals(5000L, dto.getId());
        assertEquals(20L, dto.getStudentId());
        assertEquals(PaymentStatus.SUCCESS, dto.getPaymentStatus());
        assertEquals(PaymentMethod.UPI, dto.getPaymentMethod());
        assertEquals("TXN-NEW-1", dto.getTransactionId());
        assertEquals("Welcome payment", dto.getNotes());
        verify(membershipRepository, times(1)).save(pendingMembership);
        assertEquals(MembershipStatus.ACTIVE, pendingMembership.getStatus());
    }

    @Test
    void createPayment_FailedStatus_DoesNotActivateMembership() {
        PaymentCreateRequest req = PaymentCreateRequest.builder()
                .membershipId(100L)
                .amount(new BigDecimal("2999.00"))
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .transactionId("TXN-FAIL-1")
                .paymentStatus(PaymentStatus.FAILED)
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(membershipRepository.findById(100L)).thenReturn(Optional.of(pendingMembership));
        when(paymentRepository.existsByTransactionId("TXN-FAIL-1")).thenReturn(false);
        when(paymentRepository.existsByInvoiceNumber(anyString())).thenReturn(false);
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentDto dto = paymentService.createPayment(studentPrincipal, req);

        assertEquals(PaymentStatus.FAILED, dto.getPaymentStatus());
        verify(membershipRepository, never()).save(any(StudentMembership.class));
        assertEquals(MembershipStatus.PENDING, pendingMembership.getStatus());
    }

    @Test
    void createPayment_DuplicateTransactionId_ThrowsBadRequest() {
        PaymentCreateRequest req = PaymentCreateRequest.builder()
                .membershipId(100L)
                .amount(new BigDecimal("100"))
                .paymentMethod(PaymentMethod.CASH)
                .transactionId("TXN-JAN-001")
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(membershipRepository.findById(100L)).thenReturn(Optional.of(pendingMembership));
        when(paymentRepository.existsByTransactionId("TXN-JAN-001")).thenReturn(true);

        assertThrows(BadRequestException.class, () ->
                paymentService.createPayment(studentPrincipal, req));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    void createPayment_ZeroAmount_ThrowsBadRequest() {
        PaymentCreateRequest req = PaymentCreateRequest.builder()
                .membershipId(100L)
                .amount(BigDecimal.ZERO)
                .paymentMethod(PaymentMethod.UPI)
                .transactionId("TXN-ZERO")
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(membershipRepository.findById(100L)).thenReturn(Optional.of(pendingMembership));

        assertThrows(BadRequestException.class, () ->
                paymentService.createPayment(studentPrincipal, req));
    }

    @Test
    void createPayment_WrongMembershipOwner_ThrowsUnauthorized() {
        StudentMembership othersMembership = StudentMembership.builder()
                .id(999L).student(otherStudentProfile).plan(proPlan).status(MembershipStatus.PENDING).build();

        PaymentCreateRequest req = PaymentCreateRequest.builder()
                .membershipId(999L)
                .amount(new BigDecimal("100"))
                .paymentMethod(PaymentMethod.UPI)
                .transactionId("TXN-HACK")
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(membershipRepository.findById(999L)).thenReturn(Optional.of(othersMembership));

        assertThrows(UnauthorizedException.class, () ->
                paymentService.createPayment(studentPrincipal, req));
    }

    @Test
    void createPayment_MembershipNotFound_ThrowsResourceNotFound() {
        PaymentCreateRequest req = PaymentCreateRequest.builder()
                .membershipId(9999L)
                .amount(new BigDecimal("100"))
                .paymentMethod(PaymentMethod.UPI)
                .transactionId("TXN-NF")
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(membershipRepository.findById(9999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                paymentService.createPayment(studentPrincipal, req));
    }

    // =========================================================================
    // READ: getMyPayments / getMyPaymentDetail / admin lookups
    // =========================================================================

    @Test
    void getMyPayments_ReturnsHistoryDesc() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(paymentRepository.findByStudentIdWithDetails(20L))
                .thenReturn(List.of(pendingPayment, paidPayment));

        List<PaymentDto> list = paymentService.getMyPayments(studentPrincipal);

        assertEquals(2, list.size());
        assertEquals("TXN-FEB-099", list.get(0).getTransactionId());
        assertEquals(5L, list.get(0).getPlanId());
        assertEquals("Pro Quarterly", list.get(0).getPlanName());
    }

    @Test
    void getMyPaymentDetail_Owner_Success() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(paymentRepository.findByIdWithDetails(1000L)).thenReturn(Optional.of(paidPayment));

        PaymentDto dto = paymentService.getMyPaymentDetail(studentPrincipal, 1000L);
        assertEquals(1000L, dto.getId());
        assertEquals("John Doe", dto.getStudentName());
        assertEquals("john@elitegym.com", dto.getStudentEmail());
    }

    @Test
    void getMyPaymentDetail_NonOwner_ThrowsUnauthorized() {
        Payment otherPayment = Payment.builder()
                .id(777L).student(otherStudentProfile).membership(activeMembership)
                .amount(new BigDecimal("1")).paymentMethod(PaymentMethod.CASH)
                .transactionId("OTHER-TXN").invoiceNumber("INV-OTHER")
                .paymentStatus(PaymentStatus.SUCCESS).paidAt(LocalDateTime.now()).build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(paymentRepository.findByIdWithDetails(777L)).thenReturn(Optional.of(otherPayment));

        assertThrows(UnauthorizedException.class, () ->
                paymentService.getMyPaymentDetail(studentPrincipal, 777L));
    }

    @Test
    void admin_getPaymentDetail_Success() {
        when(paymentRepository.findByIdWithDetails(1000L)).thenReturn(Optional.of(paidPayment));
        PaymentDto dto = paymentService.getPaymentDetail(1000L);
        assertEquals(PaymentStatus.SUCCESS, dto.getPaymentStatus());
    }

    @Test
    void admin_getAllPayments_ReturnsAll() {
        when(paymentRepository.findAllWithDetails()).thenReturn(List.of(paidPayment, pendingPayment, refundedPayment));
        List<PaymentDto> list = paymentService.getAllPayments();
        assertEquals(3, list.size());
    }

    @Test
    void admin_getByStatus_Filters() {
        when(paymentRepository.findByStatusWithDetails(PaymentStatus.REFUNDED))
                .thenReturn(List.of(refundedPayment));
        List<PaymentDto> list = paymentService.getPaymentsByStatus(PaymentStatus.REFUNDED);
        assertEquals(1, list.size());
        assertEquals(PaymentStatus.REFUNDED, list.get(0).getPaymentStatus());
    }

    @Test
    void admin_getByStudent_ReturnsOnlyThatStudent() {
        when(paymentRepository.findByStudentIdWithDetails(30L)).thenReturn(List.of());
        List<PaymentDto> list = paymentService.getPaymentsByStudent(30L);
        assertEquals(0, list.size());
    }

    // =========================================================================
    // UPDATE: admin status update
    // =========================================================================

    @Test
    void updatePaymentStatus_PendingToSuccess_ActivatesMembership() {
        PaymentStatusUpdateRequest req = PaymentStatusUpdateRequest.builder()
                .paymentStatus(PaymentStatus.SUCCESS)
                .notes("Reconciled by admin")
                .build();

        when(paymentRepository.findByIdWithDetails(1001L)).thenReturn(Optional.of(pendingPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentDto dto = paymentService.updatePaymentStatus(1001L, req);

        assertEquals(PaymentStatus.SUCCESS, dto.getPaymentStatus());
        assertEquals("Reconciled by admin", dto.getNotes());
        verify(membershipRepository, times(1)).save(pendingMembership);
        assertEquals(MembershipStatus.ACTIVE, pendingMembership.getStatus());
    }

    @Test
    void updatePaymentStatus_RefundedCannotRevert_ThrowsBadRequest() {
        PaymentStatusUpdateRequest req = PaymentStatusUpdateRequest.builder()
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();

        when(paymentRepository.findByIdWithDetails(1002L)).thenReturn(Optional.of(refundedPayment));

        assertThrows(BadRequestException.class, () ->
                paymentService.updatePaymentStatus(1002L, req));
    }

    @Test
    void updatePaymentStatus_NotFound_ThrowsResourceNotFound() {
        PaymentStatusUpdateRequest req = PaymentStatusUpdateRequest.builder()
                .paymentStatus(PaymentStatus.FAILED).build();
        when(paymentRepository.findByIdWithDetails(9999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                paymentService.updatePaymentStatus(9999L, req));
    }

    // =========================================================================
    // Enum parity
    // =========================================================================

    @Test
    void enumValues_PaymentMethod_Counts() {
        assertEquals(5, PaymentMethod.values().length);
        assertNotNull(PaymentMethod.valueOf("CREDIT_CARD"));
        assertNotNull(PaymentMethod.valueOf("DEBIT_CARD"));
        assertNotNull(PaymentMethod.valueOf("UPI"));
        assertNotNull(PaymentMethod.valueOf("NET_BANKING"));
        assertNotNull(PaymentMethod.valueOf("CASH"));
    }

    @Test
    void enumValues_PaymentStatus_Counts() {
        assertEquals(4, PaymentStatus.values().length);
        assertNotNull(PaymentStatus.valueOf("SUCCESS"));
        assertNotNull(PaymentStatus.valueOf("PENDING"));
        assertNotNull(PaymentStatus.valueOf("FAILED"));
        assertNotNull(PaymentStatus.valueOf("REFUNDED"));
    }
}
