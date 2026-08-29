package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.complaint.ComplaintDto;
import com.elitegym.dto.complaint.ComplaintResponseRequest;
import com.elitegym.enums.ComplaintCategory;
import com.elitegym.enums.ComplaintStatus;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/admin", "/api/v1/admin"})
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminComplaintController {

    private final ComplaintService complaintService;

    @GetMapping("/complaints")
    public ResponseEntity<ApiResponse<List<ComplaintDto>>> getAllComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category) {
        List<ComplaintDto> complaints = complaintService.getAllComplaints(status, category);
        return ResponseEntity.ok(ApiResponse.ok("All complaints retrieved", complaints));
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<ApiResponse<ComplaintDto>> getComplaintDetail(
            @PathVariable Long complaintId) {
        ComplaintDto complaint = complaintService.getComplaintDetail(complaintId);
        return ResponseEntity.ok(ApiResponse.ok("Complaint detail retrieved", complaint));
    }

    @GetMapping("/students/{studentId}/complaints")
    public ResponseEntity<ApiResponse<List<ComplaintDto>>> getStudentComplaints(
            @PathVariable Long studentId,
            @RequestParam(required = false) ComplaintStatus status) {
        List<ComplaintDto> complaints = complaintService.getStudentComplaintsByAdmin(studentId, status);
        return ResponseEntity.ok(ApiResponse.ok("Student complaints retrieved", complaints));
    }

    @PatchMapping("/complaints/{complaintId}/respond")
    public ResponseEntity<ApiResponse<ComplaintDto>> respondToComplaint(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long complaintId,
            @Valid @RequestBody ComplaintResponseRequest response) {
        log.info("Admin #{} responding to complaint #{} with status {}", principal.getId(), complaintId, response.getStatus());
        ComplaintDto updated = complaintService.respondToComplaint(principal, complaintId, response);
        return ResponseEntity.ok(ApiResponse.ok("Complaint status updated successfully", updated));
    }
}
