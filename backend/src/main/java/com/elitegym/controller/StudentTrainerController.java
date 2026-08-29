package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.trainer.TrainerRequestCreateRequest;
import com.elitegym.dto.trainer.TrainerRequestDto;
import com.elitegym.dto.workout.WorkoutPlanDto;
import com.elitegym.enums.RequestStatus;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.TrainerRequestService;
import com.elitegym.service.WorkoutPlanService;
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
@RequestMapping({"/api/student", "/api/v1/student"})
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentTrainerController {

    private final TrainerRequestService trainerRequestService;
    private final WorkoutPlanService workoutPlanService;

    // =============== Trainer Requests ===============

    @GetMapping("/trainer-requests")
    public ResponseEntity<ApiResponse<List<TrainerRequestDto>>> getMyTrainerRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) RequestStatus status) {
        List<TrainerRequestDto> requests = trainerRequestService.getStudentRequests(principal, status);
        return ResponseEntity.ok(ApiResponse.ok("Trainer requests retrieved", requests));
    }

    @PostMapping("/trainer-requests")
    public ResponseEntity<ApiResponse<TrainerRequestDto>> createTrainerRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TrainerRequestCreateRequest request) {
        log.info("Student #{} creating trainer request to trainer #{}", principal.getId(), request.getTrainerId());
        TrainerRequestDto created = trainerRequestService.createRequest(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Trainer request submitted successfully", created), HttpStatus.CREATED);
    }

    // =============== Workout Plans ===============

    @GetMapping("/workout-plans")
    public ResponseEntity<ApiResponse<List<WorkoutPlanDto>>> getMyWorkoutPlans(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<WorkoutPlanDto> plans = workoutPlanService.getStudentWorkoutPlans(principal);
        return ResponseEntity.ok(ApiResponse.ok("Assigned workout plans retrieved", plans));
    }

    @GetMapping("/workout-plans/{planId}")
    public ResponseEntity<ApiResponse<WorkoutPlanDto>> getWorkoutPlanDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId) {
        WorkoutPlanDto plan = workoutPlanService.getStudentWorkoutPlanDetail(principal, planId);
        return ResponseEntity.ok(ApiResponse.ok("Workout plan detail retrieved", plan));
    }
}
