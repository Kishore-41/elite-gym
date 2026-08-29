package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.progress.ProgressEntryCreateRequest;
import com.elitegym.dto.progress.ProgressEntryDto;
import com.elitegym.dto.progress.ProgressEntryUpdateRequest;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/student/progress", "/api/v1/student/progress"})
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentProgressController {

    private final ProgressService progressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProgressEntryDto>>> getMyProgress(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ProgressEntryDto> list = progressService.getMyProgress(principal);
        return ResponseEntity.ok(ApiResponse.ok("Progress history retrieved", list));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<ProgressEntryDto>> getLatest(
            @AuthenticationPrincipal UserPrincipal principal) {
        ProgressEntryDto latest = progressService.getLatest(principal);
        return ResponseEntity.ok(ApiResponse.ok("Latest progress entry", latest));
    }

    @GetMapping("/{entryId}")
    public ResponseEntity<ApiResponse<ProgressEntryDto>> getDetail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long entryId) {
        ProgressEntryDto dto = progressService.getDetail(principal, entryId);
        return ResponseEntity.ok(ApiResponse.ok("Progress entry detail", dto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProgressEntryDto>> createEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProgressEntryCreateRequest request) {
        log.info("Student #{} creating progress entry for date {}", principal.getId(), request.getRecordDate());
        ProgressEntryDto created = progressService.createEntry(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Progress entry created", created), HttpStatus.CREATED);
    }

    @PutMapping("/{entryId}")
    public ResponseEntity<ApiResponse<ProgressEntryDto>> updateEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long entryId,
            @Valid @RequestBody ProgressEntryUpdateRequest request) {
        ProgressEntryDto updated = progressService.updateEntry(principal, entryId, request);
        return ResponseEntity.ok(ApiResponse.ok("Progress entry updated", updated));
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> deleteEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long entryId) {
        progressService.deleteEntry(principal, entryId);
        return ResponseEntity.ok(ApiResponse.ok("Progress entry deleted", Map.of("deleted", true)));
    }
}
