package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.complaint.ComplaintCreateRequest;
import com.elitegym.dto.complaint.ComplaintDto;
import com.elitegym.enums.ComplaintStatus;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.ComplaintService;
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
public class StudentComplaintController {

    private final ComplaintService complaintService;

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<ComplaintDto>>> getMyComplaints(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) ComplaintStatus status) {
        List<ComplaintDto> complaints = complaintService.getStudentComplaints(principal, status);
        return ResponseEntity.ok(ApiResponse.ok("Your complaints retrieved", complaints));
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<ApiResponse<ComplaintDto>> getMyComplaintDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long complaintId) {
        ComplaintDto complaint = complaintService.getStudentComplaintDetail(principal, complaintId);
        return ResponseEntity.ok(ApiResponse.ok("Complaint detail retrieved", complaint));
    }

    @PostMapping("/complaints")
    public ResponseEntity<ApiResponse<ComplaintDto>> createComplaint(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ComplaintCreateRequest request) {
        log.info("Student #{} submitting complaint [{}]: {}", principal.getId(), request.getCategory(), request.getSubject());
        ComplaintDto created = complaintService.createComplaint(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Complaint submitted successfully", created), HttpStatus.CREATED);
    }
}
