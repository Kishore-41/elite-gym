package com.elitegym.controller;

import com.elitegym.dto.payment.PaymentCreateRequest;
import com.elitegym.dto.payment.PaymentDto;
import com.elitegym.enums.PaymentMethod;
import com.elitegym.enums.PaymentStatus;
import com.elitegym.enums.RoleName;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.PaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class StudentPaymentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private StudentPaymentController studentPaymentController;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    private UserPrincipal studentPrincipal;
    private PaymentDto samplePaymentDto;

    @BeforeEach
    void setUp() {
        studentPrincipal = UserPrincipal.builder()
                .id(1L)
                .email("student@elitegym.com")
                .username("john_student")
                .role(RoleName.ROLE_STUDENT)
                .build();

        samplePaymentDto = PaymentDto.builder()
                .id(100L)
                .studentId(20L)
                .studentName("John Doe")
                .studentEmail("student@elitegym.com")
                .membershipId(10L)
                .planId(5L)
                .planName("Pro Quarterly")
                .amount(new BigDecimal("2999.00"))
                .paymentMethod(PaymentMethod.UPI)
                .transactionId("TXN-TEST-123")
                .paymentStatus(PaymentStatus.SUCCESS)
                .invoiceNumber("INV-100-TEST")
                .paidAt(LocalDateTime.now())
                .notes("Test payment")
                .createdAt(LocalDateTime.now())
                .build();

        HandlerMethodArgumentResolver principalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return studentPrincipal;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(studentPaymentController)
                .setCustomArgumentResolvers(principalResolver)
                .build();
    }

    @Test
    void getMyPayments_Success() throws Exception {
        when(paymentService.getMyPayments(any(UserPrincipal.class)))
                .thenReturn(List.of(samplePaymentDto));

        mockMvc.perform(get("/api/student/payments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(100))
                .andExpect(jsonPath("$.data[0].planName").value("Pro Quarterly"))
                .andExpect(jsonPath("$.data[0].amount").value(2999.00))
                .andExpect(jsonPath("$.data[0].paymentMethod").value("UPI"))
                .andExpect(jsonPath("$.data[0].paymentStatus").value("SUCCESS"));
    }

    @Test
    void getMyPaymentDetail_Success() throws Exception {
        when(paymentService.getMyPaymentDetail(any(UserPrincipal.class), eq(100L)))
                .thenReturn(samplePaymentDto);

        mockMvc.perform(get("/api/student/payments/100")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(100))
                .andExpect(jsonPath("$.data.transactionId").value("TXN-TEST-123"))
                .andExpect(jsonPath("$.data.invoiceNumber").value("INV-100-TEST"));
    }

    @Test
    void createPayment_Success() throws Exception {
        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .membershipId(10L)
                .amount(new BigDecimal("2999.00"))
                .paymentMethod(PaymentMethod.UPI)
                .transactionId("TXN-TEST-123")
                .paymentStatus(PaymentStatus.SUCCESS)
                .notes("Test payment")
                .build();

        when(paymentService.createPayment(any(UserPrincipal.class), any(PaymentCreateRequest.class)))
                .thenReturn(samplePaymentDto);

        mockMvc.perform(post("/api/student/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(100))
                .andExpect(jsonPath("$.data.paymentStatus").value("SUCCESS"));
    }

    @Test
    void createPayment_ValidationError_MissingMembershipId() throws Exception {
        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .amount(new BigDecimal("2999.00"))
                .paymentMethod(PaymentMethod.UPI)
                .transactionId("TXN-TEST-123")
                .build();

        mockMvc.perform(post("/api/student/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
