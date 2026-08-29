package com.elitegym.controller;

import com.elitegym.dto.payment.PaymentDto;
import com.elitegym.dto.payment.PaymentStatusUpdateRequest;
import com.elitegym.enums.PaymentMethod;
import com.elitegym.enums.PaymentStatus;
import com.elitegym.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminPaymentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private AdminPaymentController adminPaymentController;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private PaymentDto samplePaymentDto;

    @BeforeEach
    void setUp() {
        samplePaymentDto = PaymentDto.builder()
                .id(200L)
                .studentId(15L)
                .studentName("Sara Lee")
                .studentEmail("sara@elitegym.com")
                .membershipId(12L)
                .planId(3L)
                .planName("Gold Yearly")
                .amount(new BigDecimal("9999.00"))
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .transactionId("TXN-ADMIN-999")
                .paymentStatus(PaymentStatus.SUCCESS)
                .invoiceNumber("INV-ADMIN-200")
                .paidAt(LocalDateTime.now())
                .notes("Admin view")
                .createdAt(LocalDateTime.now())
                .build();

        mockMvc = MockMvcBuilders.standaloneSetup(adminPaymentController).build();
    }

    @Test
    void getAllPayments_Success() throws Exception {
        when(paymentService.getAllPayments()).thenReturn(List.of(samplePaymentDto));

        mockMvc.perform(get("/api/admin/payments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(200))
                .andExpect(jsonPath("$.data[0].studentName").value("Sara Lee"))
                .andExpect(jsonPath("$.data[0].amount").value(9999.00));
    }

    @Test
    void getByStatus_Success() throws Exception {
        when(paymentService.getPaymentsByStatus(PaymentStatus.SUCCESS)).thenReturn(List.of(samplePaymentDto));

        mockMvc.perform(get("/api/admin/payments/status/SUCCESS")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].paymentStatus").value("SUCCESS"));
    }

    @Test
    void getByStudent_Success() throws Exception {
        when(paymentService.getPaymentsByStudent(15L)).thenReturn(List.of(samplePaymentDto));

        mockMvc.perform(get("/api/admin/payments/student/15")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].studentId").value(15));
    }

    @Test
    void getDetail_Success() throws Exception {
        when(paymentService.getPaymentDetail(200L)).thenReturn(samplePaymentDto);

        mockMvc.perform(get("/api/admin/payments/200")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(200))
                .andExpect(jsonPath("$.data.invoiceNumber").value("INV-ADMIN-200"));
    }

    @Test
    void updateStatus_Success() throws Exception {
        PaymentStatusUpdateRequest updateRequest = PaymentStatusUpdateRequest.builder()
                .paymentStatus(PaymentStatus.REFUNDED)
                .notes("Refund processed by admin")
                .build();

        PaymentDto updatedDto = PaymentDto.builder()
                .id(200L)
                .studentId(15L)
                .studentName("Sara Lee")
                .studentEmail("sara@elitegym.com")
                .membershipId(12L)
                .planId(3L)
                .planName("Gold Yearly")
                .amount(new BigDecimal("9999.00"))
                .paymentMethod(PaymentMethod.CREDIT_CARD)
                .transactionId("TXN-ADMIN-999")
                .paymentStatus(PaymentStatus.REFUNDED)
                .invoiceNumber("INV-ADMIN-200")
                .paidAt(LocalDateTime.now())
                .notes("Refund processed by admin")
                .createdAt(LocalDateTime.now())
                .build();

        when(paymentService.updatePaymentStatus(eq(200L), any(PaymentStatusUpdateRequest.class)))
                .thenReturn(updatedDto);

        mockMvc.perform(put("/api/admin/payments/200/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentStatus").value("REFUNDED"))
                .andExpect(jsonPath("$.data.notes").value("Refund processed by admin"));
    }

    @Test
    void updateStatus_ValidationError_MissingStatus() throws Exception {
        PaymentStatusUpdateRequest invalidRequest = PaymentStatusUpdateRequest.builder()
                .notes("Missing status")
                .build();

        mockMvc.perform(put("/api/admin/payments/200/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
