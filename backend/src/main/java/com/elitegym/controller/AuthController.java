package com.elitegym.controller;

import com.elitegym.dto.auth.*;
import com.elitegym.dto.common.ApiResponse;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping({"/api/auth", "/api/v1/auth"})
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/student")
    public ResponseEntity<ApiResponse<AuthResponse>> registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        log.info("REST request to register student: {}", request.getEmail());
        AuthResponse response = authService.registerStudent(request);
        return new ResponseEntity<>(ApiResponse.ok("Student registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/register-with-plan")
    public ResponseEntity<ApiResponse<AuthResponse>> registerWithPlan(@Valid @RequestBody PlanPurchaseRequest request) {
        log.info("REST request to checkout and register with plan: {}", request.getEmail());
        AuthResponse response = authService.registerWithPlan(request);
        return new ResponseEntity<>(ApiResponse.ok("Enrolled and registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/register/trainer")
    public ResponseEntity<ApiResponse<AuthResponse>> registerTrainer(@Valid @RequestBody TrainerRegisterRequest request) {
        log.info("REST request to register trainer: {}", request.getEmail());
        AuthResponse response = authService.registerTrainer(request);
        return new ResponseEntity<>(ApiResponse.ok("Trainer registered successfully", response), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("REST request to login user: {}", request.getUsernameOrEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User is not authenticated"));
        }
        UserSummaryDto userSummary = authService.getCurrentUser(principal);
        return ResponseEntity.ok(ApiResponse.ok("Current user profile retrieved", userSummary));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully"));
    }
}
