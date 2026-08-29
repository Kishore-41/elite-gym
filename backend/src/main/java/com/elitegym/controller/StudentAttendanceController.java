package com.elitegym.controller;

import com.elitegym.dto.attendance.*;
import com.elitegym.dto.common.ApiResponse;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.AttendanceService;
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
@RequestMapping({"/api/student/attendance", "/api/v1/student/attendance"})
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentAttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getMyHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AttendanceDto> list = attendanceService.getMyAttendance(principal);
        return ResponseEntity.ok(ApiResponse.ok("Attendance history", list));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<AttendanceDto>> getMyToday(
            @AuthenticationPrincipal UserPrincipal principal) {
        AttendanceDto dto = attendanceService.getMyToday(principal);
        return ResponseEntity.ok(ApiResponse.ok("Today's attendance", dto));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AttendanceStatsDto>> getMyStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        AttendanceStatsDto stats = attendanceService.getMyStats(principal);
        return ResponseEntity.ok(ApiResponse.ok("Attendance stats", stats));
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<AttendanceDto>> checkIn(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) AttendanceCheckInRequest request) {
        AttendanceCheckInRequest req = request != null ? request : new AttendanceCheckInRequest();
        log.info("Student #{} checking in", principal.getId());
        AttendanceDto dto = attendanceService.studentCheckIn(principal, req);
        return new ResponseEntity<>(ApiResponse.ok("Check-in successful", dto), HttpStatus.CREATED);
    }

    @PostMapping("/check-out")
    public ResponseEntity<ApiResponse<AttendanceDto>> checkOut(
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("Student #{} checking out", principal.getId());
        AttendanceDto dto = attendanceService.studentCheckOut(principal);
        return ResponseEntity.ok(ApiResponse.ok("Check-out successful", dto));
    }
}
