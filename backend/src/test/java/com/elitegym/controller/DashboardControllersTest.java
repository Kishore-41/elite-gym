package com.elitegym.controller;

import com.elitegym.dto.dashboard.AdminDashboardDto;
import com.elitegym.dto.dashboard.StudentDashboardDto;
import com.elitegym.dto.dashboard.TrainerDashboardDto;
import com.elitegym.enums.RoleName;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.DashboardService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DashboardControllersTest {

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private StudentDashboardController studentDashboardController;

    @InjectMocks
    private TrainerDashboardController trainerDashboardController;

    @InjectMocks
    private AdminDashboardController adminDashboardController;

    private MockMvc studentMockMvc;
    private MockMvc trainerMockMvc;
    private MockMvc adminMockMvc;

    private UserPrincipal studentPrincipal;
    private UserPrincipal trainerPrincipal;

    @BeforeEach
    void setUp() {
        studentPrincipal = UserPrincipal.builder()
                .id(1L)
                .email("student@elitegym.com")
                .username("john_student")
                .role(RoleName.ROLE_STUDENT)
                .build();

        trainerPrincipal = UserPrincipal.builder()
                .id(2L)
                .email("trainer@elitegym.com")
                .username("bob_trainer")
                .role(RoleName.ROLE_TRAINER)
                .build();

        HandlerMethodArgumentResolver studentResolver = new HandlerMethodArgumentResolver() {
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

        HandlerMethodArgumentResolver trainerResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return trainerPrincipal;
            }
        };

        studentMockMvc = MockMvcBuilders.standaloneSetup(studentDashboardController)
                .setCustomArgumentResolvers(studentResolver)
                .build();

        trainerMockMvc = MockMvcBuilders.standaloneSetup(trainerDashboardController)
                .setCustomArgumentResolvers(trainerResolver)
                .build();

        adminMockMvc = MockMvcBuilders.standaloneSetup(adminDashboardController).build();
    }

    @Test
    void studentDashboardStats_Success() throws Exception {
        StudentDashboardDto dto = StudentDashboardDto.builder()
                .studentId(10L)
                .studentName("John Doe")
                .activePlanName("Pro Quarterly")
                .attendanceStreak(5L)
                .attendanceRate(90.0)
                .todayCheckedIn(true)
                .build();

        when(dashboardService.getStudentDashboard(any(UserPrincipal.class))).thenReturn(dto);

        studentMockMvc.perform(get("/api/student/dashboard/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studentName").value("John Doe"))
                .andExpect(jsonPath("$.data.attendanceStreak").value(5))
                .andExpect(jsonPath("$.data.todayCheckedIn").value(true));
    }

    @Test
    void trainerDashboardStats_Success() throws Exception {
        TrainerDashboardDto dto = TrainerDashboardDto.builder()
                .trainerId(20L)
                .trainerName("Bob Coach")
                .specialization("Strength & Conditioning")
                .studentCapacity(15)
                .activeStudentsCount(4)
                .pendingRequestsCount(2)
                .build();

        when(dashboardService.getTrainerDashboard(any(UserPrincipal.class))).thenReturn(dto);

        trainerMockMvc.perform(get("/api/trainer/dashboard/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.trainerName").value("Bob Coach"))
                .andExpect(jsonPath("$.data.activeStudentsCount").value(4))
                .andExpect(jsonPath("$.data.pendingRequestsCount").value(2));
    }

    @Test
    void adminDashboardStats_Success() throws Exception {
        AdminDashboardDto dto = AdminDashboardDto.builder()
                .totalStudentsCount(120L)
                .totalTrainersCount(8L)
                .activeMembershipsCount(95L)
                .totalRevenue(new BigDecimal("150000.00"))
                .openComplaintsCount(3L)
                .build();

        when(dashboardService.getAdminDashboard()).thenReturn(dto);

        adminMockMvc.perform(get("/api/admin/dashboard/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalStudentsCount").value(120))
                .andExpect(jsonPath("$.data.totalTrainersCount").value(8))
                .andExpect(jsonPath("$.data.totalRevenue").value(150000.00));
    }
}
