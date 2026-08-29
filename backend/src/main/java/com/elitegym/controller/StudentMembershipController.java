package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.membership.MembershipPurchaseRequest;
import com.elitegym.dto.membership.StudentMembershipDto;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.MembershipService;
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
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentMembershipController {

    private final MembershipService membershipService;

    @GetMapping("/membership")
    public ResponseEntity<ApiResponse<StudentMembershipDto>> getActiveMembership(
            @AuthenticationPrincipal UserPrincipal principal) {
        StudentMembershipDto activeMembership = membershipService.getActiveStudentMembership(principal);
        if (activeMembership == null) {
            return ResponseEntity.ok(ApiResponse.ok("No active membership found", null));
        }
        return ResponseEntity.ok(ApiResponse.ok("Active membership retrieved", activeMembership));
    }

    @GetMapping("/memberships")
    public ResponseEntity<ApiResponse<List<StudentMembershipDto>>> getAllStudentMemberships(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<StudentMembershipDto> history = membershipService.getStudentMemberships(principal);
        return ResponseEntity.ok(ApiResponse.ok("Membership history retrieved", history));
    }

    @PostMapping("/memberships")
    public ResponseEntity<ApiResponse<StudentMembershipDto>> purchaseMembership(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MembershipPurchaseRequest request) {
        log.info("Student #{} requesting membership subscription to plan #{}", principal.getId(), request.getPlanId());
        StudentMembershipDto membership = membershipService.purchaseMembership(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Membership subscribed successfully", membership), HttpStatus.CREATED);
    }
}
