package com.elitegym.service;

import com.elitegym.dto.attendance.*;
import com.elitegym.entity.Attendance;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.User;
import com.elitegym.enums.AttendanceStatus;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.AttendanceRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.UserRepository;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    private static final LocalTime LATE_THRESHOLD = LocalTime.of(9, 0);

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    private User getAdminUser(Long adminUserId) {
        return userRepository.findById(adminUserId)
                .filter(u -> u.getRole() == RoleName.ROLE_ADMIN || u.getRole() == RoleName.ROLE_TRAINER)
                .orElseThrow(() -> new UnauthorizedException("User is not authorized to mark attendance."));
    }

    private void assertOwner(Attendance a, Long studentId) {
        if (!a.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You are not authorized to access this attendance record.");
        }
    }

    private AttendanceStatus autoDetermineStatus(AttendanceStatus provided, LocalTime checkIn) {
        if (provided != null) return provided;
        return checkIn.isAfter(LATE_THRESHOLD) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
    }

    private long computeDurationMinutes(LocalTime in, LocalTime out) {
        if (in == null || out == null) return 0L;
        long mins = Duration.between(in, out).toMinutes();
        return Math.max(0L, mins);
    }

    private long computeCurrentStreak(List<Attendance> entriesAsc, LocalDate today) {
        long streak = 0;
        LocalDate cursor = today;
        List<LocalDate> presentDates = entriesAsc.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT || a.getStatus() == AttendanceStatus.LATE)
                .map(Attendance::getDate)
                .distinct()
                .collect(Collectors.toList());
        for (int i = 0; i < 60; i++) {
            final LocalDate d = cursor;
            if (presentDates.stream().anyMatch(pd -> pd.isEqual(d))) {
                streak++;
                cursor = cursor.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }

    // =========================================================================
    // STUDENT: check-in, check-out, own history, stats, today's record
    // =========================================================================

    @Transactional
    public AttendanceDto studentCheckIn(UserPrincipal principal, AttendanceCheckInRequest request) {
        StudentProfile student = getStudentProfile(principal.getId());
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        LocalTime now = request.getCheckInTime() != null ? request.getCheckInTime() : LocalTime.now();

        if (attendanceRepository.findByStudentIdAndDate(student.getId(), date).isPresent()) {
            throw new BadRequestException("You have already checked in today. Use check-out instead.");
        }

        AttendanceStatus status = autoDetermineStatus(request.getStatus(), now);
        Attendance a = Attendance.builder()
                .student(student)
                .date(date)
                .checkInTime(now)
                .status(status)
                .notes(request.getNotes())
                .build();
        Attendance saved = attendanceRepository.save(a);
        log.info("Student #{} checked in on {} at {} ({})",
                student.getId(), date, now, status);
        return mapToDto(saved);
    }

    @Transactional
    public AttendanceDto studentCheckOut(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        LocalDate today = LocalDate.now();
        Attendance a = attendanceRepository.findByStudentIdAndDate(student.getId(), today)
                .orElseThrow(() -> new BadRequestException("No check-in found for today. Check in first."));
        if (a.getCheckOutTime() != null) {
            throw new BadRequestException("Already checked out today.");
        }
        LocalTime out = LocalTime.now();
        if (out.isBefore(a.getCheckInTime())) {
            throw new BadRequestException("Check-out time cannot be before check-in time.");
        }
        a.setCheckOutTime(out);
        Attendance saved = attendanceRepository.save(a);
        log.info("Student #{} checked out on {} at {} (duration {}m)",
                student.getId(), today, out, computeDurationMinutes(a.getCheckInTime(), out));
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getMyAttendance(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        return attendanceRepository.findByStudentIdWithDetails(student.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceDto getMyToday(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        return attendanceRepository.findByStudentIdAndDate(student.getId(), LocalDate.now())
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public AttendanceStatsDto getMyStats(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        LocalDate today = LocalDate.now();
        LocalDate from30 = today.minusDays(29);
        List<Attendance> listAsc = attendanceRepository
                .findByStudentIdAndDateRangeWithDetails(student.getId(), from30, today)
                .stream()
                .sorted(Comparator.comparing(Attendance::getDate))
                .collect(Collectors.toList());

        long present = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.ABSENT);
        long late = attendanceRepository.countByStudentIdAndStatus(student.getId(), AttendanceStatus.LATE);
        long total = present + absent + late;
        double rate = total == 0 ? 0.0 : Math.round(((present + late) * 1000.0) / total) / 10.0;
        long streak = computeCurrentStreak(listAsc, today);

        return AttendanceStatsDto.builder()
                .totalDays(total)
                .presentCount(present)
                .absentCount(absent)
                .lateCount(late)
                .presentRate(rate)
                .currentStreak(streak)
                .build();
    }

    // =========================================================================
    // ADMIN / TRAINER: mark attendance for any student, view all, by date, by student
    // =========================================================================

    @Transactional
    public AttendanceDto staffMarkAttendance(UserPrincipal staff, AttendanceCheckInRequest request) {
        if (request.getStudentId() == null) {
            throw new BadRequestException("studentId is required.");
        }
        StudentProfile student = studentProfileRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", request.getStudentId()));
        User staffUser = getAdminUser(staff.getId());

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        LocalTime in = request.getCheckInTime() != null ? request.getCheckInTime() : LocalTime.now();

        Attendance existing = attendanceRepository.findByStudentIdAndDate(student.getId(), date).orElse(null);
        AttendanceStatus status = autoDetermineStatus(request.getStatus(), in);

        if (existing != null) {
            existing.setCheckInTime(in);
            existing.setStatus(status);
            existing.setMarkedByAdmin(staffUser);
            if (request.getNotes() != null) existing.setNotes(request.getNotes());
            Attendance saved = attendanceRepository.save(existing);
            log.info("Staff #{} updated attendance for student #{} on {}", staff.getId(), student.getId(), date);
            return mapToDto(saved);
        }

        Attendance a = Attendance.builder()
                .student(student)
                .date(date)
                .checkInTime(in)
                .status(status)
                .markedByAdmin(staffUser)
                .notes(request.getNotes())
                .build();
        Attendance saved = attendanceRepository.save(a);
        log.info("Staff #{} marked attendance for student #{} on {} ({})",
                staff.getId(), student.getId(), date, status);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getAllAttendance() {
        return attendanceRepository.findByDateRangeWithDetails(
                LocalDate.now().minusDays(60), LocalDate.now())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getByDate(LocalDate date) {
        return attendanceRepository.findByDateWithDetails(date)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getByStudent(Long studentId) {
        return attendanceRepository.findByStudentIdWithDetails(studentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> getByDateRange(LocalDate from, LocalDate to) {
        return attendanceRepository.findByDateRangeWithDetails(from, to)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDto updateAttendance(Long attendanceId, AttendanceUpdateRequest request) {
        Attendance a = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance", "id", attendanceId));
        if (request.getCheckOutTime() != null) {
            if (request.getCheckOutTime().isBefore(a.getCheckInTime())) {
                throw new BadRequestException("Check-out time cannot be before check-in time.");
            }
            a.setCheckOutTime(request.getCheckOutTime());
        }
        if (request.getStatus() != null) a.setStatus(request.getStatus());
        if (request.getNotes() != null) a.setNotes(request.getNotes());
        Attendance saved = attendanceRepository.save(a);
        log.info("Updated attendance #{}: status={}, checkOut={}", attendanceId, saved.getStatus(), saved.getCheckOutTime());
        return mapToDto(saved);
    }

    // =========================================================================
    // MAPPING
    // =========================================================================

    private AttendanceDto mapToDto(Attendance a) {
        String adminName = null;
        Long adminId = null;
        if (a.getMarkedByAdmin() != null) {
            adminId = a.getMarkedByAdmin().getId();
            adminName = a.getMarkedByAdmin().getFirstName() + " " + a.getMarkedByAdmin().getLastName();
        }
        return AttendanceDto.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getUser().getFirstName() + " " + a.getStudent().getUser().getLastName())
                .studentEmail(a.getStudent().getUser().getEmail())
                .date(a.getDate())
                .checkInTime(a.getCheckInTime())
                .checkOutTime(a.getCheckOutTime())
                .durationMinutes(computeDurationMinutes(a.getCheckInTime(), a.getCheckOutTime()))
                .status(a.getStatus())
                .markedByAdminId(adminId)
                .markedByAdminName(adminName)
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
