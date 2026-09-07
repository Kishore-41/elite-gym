package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.trainer.AssignedStudentDto;
import com.elitegym.dto.trainer.TrainerRequestDto;
import com.elitegym.dto.trainer.TrainerRequestResponseRequest;
import com.elitegym.dto.workout.*;
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
@RequestMapping({"/api/trainer", "/api/v1/trainer"})
@PreAuthorize("hasRole('TRAINER')")
@RequiredArgsConstructor
public class TrainerWorkoutController {

    private final TrainerRequestService trainerRequestService;
    private final WorkoutPlanService workoutPlanService;

    // =============== Assigned Students ===============

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<AssignedStudentDto>>> getAssignedStudents(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AssignedStudentDto> students = trainerRequestService.getAssignedStudents(principal);
        return ResponseEntity.ok(ApiResponse.ok("Assigned students retrieved", students));
    }

    // =============== Trainer Requests ===============

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<TrainerRequestDto>>> getTrainerRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) RequestStatus status) {
        List<TrainerRequestDto> requests = trainerRequestService.getTrainerRequests(principal, status);
        return ResponseEntity.ok(ApiResponse.ok("Trainer requests retrieved", requests));
    }

    @RequestMapping(value = {"/requests/{requestId}", "/requests/{requestId}/status"}, method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<TrainerRequestDto>> respondToRequest(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long requestId,
            @Valid @RequestBody TrainerRequestResponseRequest response) {
        log.info("Trainer #{} responding to request #{} with status {}", principal.getId(), requestId, response.getStatus());
        TrainerRequestDto updated = trainerRequestService.respondToRequest(principal, requestId, response);
        return ResponseEntity.ok(ApiResponse.ok("Request response recorded", updated));
    }

    // =============== Workout Plans (CRUD) ===============

    @GetMapping("/workout-plans")
    public ResponseEntity<ApiResponse<List<WorkoutPlanDto>>> getMyWorkoutPlans(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Boolean templatesOnly) {
        List<WorkoutPlanDto> plans = workoutPlanService.getTrainerWorkoutPlans(principal, templatesOnly);
        return ResponseEntity.ok(ApiResponse.ok("Workout plans retrieved", plans));
    }

    @GetMapping("/workout-plans/{planId}")
    public ResponseEntity<ApiResponse<WorkoutPlanDto>> getWorkoutPlanById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId) {
        WorkoutPlanDto plan = workoutPlanService.getWorkoutPlanById(principal, planId);
        return ResponseEntity.ok(ApiResponse.ok("Workout plan retrieved", plan));
    }

    @PostMapping("/workout-plans")
    public ResponseEntity<ApiResponse<WorkoutPlanDto>> createWorkoutPlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WorkoutPlanCreateRequest request) {
        log.info("Trainer #{} creating workout plan '{}'", principal.getId(), request.getTitle());
        WorkoutPlanDto created = workoutPlanService.createWorkoutPlan(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Workout plan created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/workout-plans/{planId}")
    public ResponseEntity<ApiResponse<WorkoutPlanDto>> updateWorkoutPlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId,
            @Valid @RequestBody WorkoutPlanUpdateRequest request) {
        log.info("Trainer #{} updating workout plan #{}", principal.getId(), planId);
        WorkoutPlanDto updated = workoutPlanService.updateWorkoutPlan(principal, planId, request);
        return ResponseEntity.ok(ApiResponse.ok("Workout plan updated successfully", updated));
    }

    @PatchMapping("/workout-plans/{planId}/status")
    public ResponseEntity<ApiResponse<WorkoutPlanDto>> toggleWorkoutPlanStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId,
            @RequestParam boolean active) {
        WorkoutPlanDto updated = workoutPlanService.toggleWorkoutPlanStatus(principal, planId, active);
        return ResponseEntity.ok(ApiResponse.ok("Workout plan status updated", updated));
    }

    @PatchMapping("/workout-plans/{planId}/assign/{studentId}")
    public ResponseEntity<ApiResponse<WorkoutPlanDto>> assignPlanToStudent(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId,
            @PathVariable Long studentId) {
        log.info("Trainer #{} assigning plan #{} to student #{}", principal.getId(), planId, studentId);
        WorkoutPlanDto updated = workoutPlanService.assignPlanToStudent(principal, planId, studentId);
        return ResponseEntity.ok(ApiResponse.ok("Workout plan assigned to student", updated));
    }

    @DeleteMapping("/workout-plans/{planId}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkoutPlan(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId) {
        workoutPlanService.deleteWorkoutPlan(principal, planId);
        return ResponseEntity.ok(ApiResponse.ok("Workout plan deleted successfully"));
    }

    // =============== Workout Exercises (CRUD within a Plan) ===============

    @GetMapping("/workout-plans/{planId}/exercises")
    public ResponseEntity<ApiResponse<List<WorkoutExerciseDto>>> getPlanExercises(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId) {
        List<WorkoutExerciseDto> exercises = workoutPlanService.getPlanExercises(principal, planId);
        return ResponseEntity.ok(ApiResponse.ok("Workout exercises retrieved", exercises));
    }

    @PostMapping("/workout-plans/{planId}/exercises")
    public ResponseEntity<ApiResponse<WorkoutExerciseDto>> addExercise(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId,
            @Valid @RequestBody WorkoutExerciseCreateRequest request) {
        log.info("Trainer #{} adding exercise '{}' to plan #{}", principal.getId(), request.getExerciseName(), planId);
        WorkoutExerciseDto created = workoutPlanService.addExercise(principal, planId, request);
        return new ResponseEntity<>(ApiResponse.ok("Exercise added to workout plan", created), HttpStatus.CREATED);
    }

    @PutMapping("/workout-plans/{planId}/exercises/{exerciseId}")
    public ResponseEntity<ApiResponse<WorkoutExerciseDto>> updateExercise(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId,
            @PathVariable Long exerciseId,
            @Valid @RequestBody WorkoutExerciseUpdateRequest request) {
        log.info("Trainer #{} updating exercise #{} in plan #{}", principal.getId(), exerciseId, planId);
        WorkoutExerciseDto updated = workoutPlanService.updateExercise(principal, planId, exerciseId, request);
        return ResponseEntity.ok(ApiResponse.ok("Exercise updated successfully", updated));
    }

    @DeleteMapping("/workout-plans/{planId}/exercises/{exerciseId}")
    public ResponseEntity<ApiResponse<Void>> removeExercise(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long planId,
            @PathVariable Long exerciseId) {
        workoutPlanService.removeExercise(principal, planId, exerciseId);
        return ResponseEntity.ok(ApiResponse.ok("Exercise removed from workout plan"));
    }
}
