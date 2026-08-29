package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.dashboard.TrainerDashboardDto;
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
@RequestMapping({"/api/trainer/dashboard", "/api/v1/trainer/dashboard"})
@PreAuthorize("hasRole('TRAINER')")
@RequiredArgsConstructor
public class TrainerDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<TrainerDashboardDto>> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        TrainerDashboardDto dto = dashboardService.getTrainerDashboard(principal);
        return ResponseEntity.ok(ApiResponse.ok("Trainer dashboard stats retrieved", dto));
    }
}
