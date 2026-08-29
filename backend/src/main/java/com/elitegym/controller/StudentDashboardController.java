package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.dashboard.StudentDashboardDto;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping({"/api/student/dashboard", "/api/v1/student/dashboard"})
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        StudentDashboardDto dto = dashboardService.getStudentDashboard(principal);
        return ResponseEntity.ok(ApiResponse.ok("Student dashboard stats retrieved", dto));
    }
}
