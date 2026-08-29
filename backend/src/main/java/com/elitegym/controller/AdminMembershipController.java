package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.membership.*;
import com.elitegym.enums.MembershipStatus;
import com.elitegym.service.MembershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMembershipController {

    private final MembershipService membershipService;

    // --- Membership Plan Management ---

    @GetMapping("/membership-plans")
    public ResponseEntity<ApiResponse<List<MembershipPlanDto>>> getAllPlans() {
        List<MembershipPlanDto> plans = membershipService.getAllPlans();
        return ResponseEntity.ok(ApiResponse.ok("All membership plans retrieved", plans));
    }

    @PostMapping("/membership-plans")
    public ResponseEntity<ApiResponse<MembershipPlanDto>> createPlan(
            @Valid @RequestBody MembershipPlanCreateRequest request) {
        log.info("Admin request to create membership plan: {}", request.getName());
        MembershipPlanDto created = membershipService.createPlan(request);
        return new ResponseEntity<>(ApiResponse.ok("Membership plan created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/membership-plans/{id}")
    public ResponseEntity<ApiResponse<MembershipPlanDto>> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody MembershipPlanUpdateRequest request) {
        log.info("Admin request to update membership plan #{}", id);
        MembershipPlanDto updated = membershipService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Membership plan updated successfully", updated));
    }

    @PatchMapping("/membership-plans/{id}/status")
    public ResponseEntity<ApiResponse<MembershipPlanDto>> togglePlanStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        MembershipPlanDto updated = membershipService.togglePlanStatus(id, active);
        return ResponseEntity.ok(ApiResponse.ok("Membership plan status updated", updated));
    }

    @DeleteMapping("/membership-plans/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        membershipService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.ok("Membership plan deleted successfully"));
    }

    // --- Student Membership Management ---

    @GetMapping("/memberships")
    public ResponseEntity<ApiResponse<List<StudentMembershipDto>>> getAllMemberships(
            @RequestParam(required = false) MembershipStatus status) {
        List<StudentMembershipDto> list = membershipService.getAllMemberships(status);
        return ResponseEntity.ok(ApiResponse.ok("Student memberships retrieved", list));
    }

    @PatchMapping("/memberships/{id}/status")
    public ResponseEntity<ApiResponse<StudentMembershipDto>> updateMembershipStatus(
            @PathVariable Long id,
            @Valid @RequestBody MembershipStatusUpdateRequest request) {
        StudentMembershipDto updated = membershipService.updateMembershipStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Membership status updated successfully", updated));
    }
}
