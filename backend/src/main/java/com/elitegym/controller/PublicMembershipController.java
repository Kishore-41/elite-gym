package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.membership.MembershipPlanDto;
import com.elitegym.service.MembershipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/plans", "/api/public/plans", "/api/public/membership-plans", "/api/memberships/plans"})
@RequiredArgsConstructor
public class PublicMembershipController {

    private final MembershipService membershipService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MembershipPlanDto>>> getActivePlans() {
        List<MembershipPlanDto> plans = membershipService.getActivePlans();
        return ResponseEntity.ok(ApiResponse.ok("Active membership plans retrieved", plans));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MembershipPlanDto>> getPlanById(@PathVariable Long id) {
        MembershipPlanDto plan = membershipService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.ok("Membership plan retrieved", plan));
    }
}
