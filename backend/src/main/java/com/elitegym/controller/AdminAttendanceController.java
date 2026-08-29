package com.elitegym.controller;

import com.elitegym.dto.attendance.*;
import com.elitegym.dto.common.ApiResponse;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/admin/attendance", "/api/v1/admin/attendance"})
@PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
@RequiredArgsConstructor
public class AdminAttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceDto>> markAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AttendanceCheckInRequest request) {
        log.info("Staff #{} marking attendance for student #{}", principal.getId(), request.getStudentId());
        AttendanceDto dto = attendanceService.staffMarkAttendance(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Attendance recorded", dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getAll() {
        List<AttendanceDto> list = attendanceService.getAllAttendance();
        return ResponseEntity.ok(ApiResponse.ok("All attendance (last 60 days)", list));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceDto> list = attendanceService.getByDate(date);
        return ResponseEntity.ok(ApiResponse.ok("Attendance for " + date, list));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getByStudent(
            @PathVariable Long studentId) {
        List<AttendanceDto> list = attendanceService.getByStudent(studentId);
        return ResponseEntity.ok(ApiResponse.ok("Attendance for student #" + studentId, list));
    }

    @GetMapping("/range")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<AttendanceDto> list = attendanceService.getByDateRange(from, to);
        return ResponseEntity.ok(ApiResponse.ok("Attendance between " + from + " and " + to, list));
    }

    @PutMapping("/{attendanceId}")
    public ResponseEntity<ApiResponse<AttendanceDto>> updateAttendance(
            @PathVariable Long attendanceId,
            @RequestBody AttendanceUpdateRequest request) {
        log.info("Admin updating attendance #{}", attendanceId);
        AttendanceDto dto = attendanceService.updateAttendance(attendanceId, request);
        return ResponseEntity.ok(ApiResponse.ok("Attendance updated", dto));
    }
}
