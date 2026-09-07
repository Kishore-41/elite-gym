package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.complaint.ComplaintCreateRequest;
import com.elitegym.dto.complaint.ComplaintDto;
import com.elitegym.enums.ComplaintCategory;
import com.elitegym.enums.ComplaintStatus;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.ComplaintService;
import com.elitegym.service.EvidenceUploadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/complaints", "/api/public/complaints"})
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final EvidenceUploadService evidenceUploadService;

    @PostMapping("/upload-evidence")
    public ResponseEntity<ApiResponse<List<String>>> uploadEvidence(
            @RequestParam("files") MultipartFile[] files) {
        log.info("Received {} evidence file(s) for upload", files != null ? files.length : 0);
        List<String> urls = evidenceUploadService.storeEvidenceFiles(files);
        return ResponseEntity.ok(ApiResponse.ok("Evidence uploaded successfully", urls));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ComplaintDto>> submitGrievance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ComplaintCreateRequest request) {
        log.info("Grievance submission received. Category: {}, Target: {}, Anonymous: {}", 
                request.getCategory(), request.getTargetAudience(), request.isAnonymous());
        ComplaintDto created = complaintService.createPublicOrMemberComplaint(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Grievance registered successfully with ID: GRIEV-" + created.getId(), created), HttpStatus.CREATED);
    }

    @GetMapping("/track/{complaintId}")
    public ResponseEntity<ApiResponse<ComplaintDto>> trackGrievanceStatus(
            @PathVariable Long complaintId) {
        ComplaintDto complaint = complaintService.getComplaintDetail(complaintId);
        // Mask details if anonymous for public inspection
        if (complaint.isAnonymous()) {
            complaint.setStudentEmail(null);
            complaint.setSubmitterEmail(null);
            complaint.setStudentName(null);
        }
        return ResponseEntity.ok(ApiResponse.ok("Grievance status retrieved", complaint));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ComplaintDto>>> listComplaints(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) String targetAudience) {
        List<ComplaintDto> list = complaintService.getAllComplaints(principal, status, category, targetAudience);
        return ResponseEntity.ok(ApiResponse.ok("Complaints retrieved", list));
    }
}
