package com.elitegym.service;

import com.elitegym.dto.attendance.*;
import com.elitegym.entity.*;
import com.elitegym.enums.AttendanceStatus;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.AttendanceRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.UserRepository;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private StudentProfileRepository studentProfileRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private User studentUser;
    private User trainerUser;
    private User adminUser;
    private User otherStudentUser;
    private StudentProfile sampleStudent;
    private StudentProfile otherStudent;
    private UserPrincipal studentPrincipal;
    private UserPrincipal otherStudentPrincipal;
    private UserPrincipal trainerPrincipal;
    private UserPrincipal adminPrincipal;
    private Attendance todayPresent;
    private Attendance yesterdayPresent;
    private Attendance dayBeforeLate;
    private Attendance day3Present;

    private final LocalDate TODAY = LocalDate.now();
    private final LocalDate YESTERDAY = LocalDate.now().minusDays(1);
    private final LocalDate DAY_BEFORE = LocalDate.now().minusDays(2);
    private final LocalDate DAY3 = LocalDate.now().minusDays(3);

    @BeforeEach
    void setUp() {
        studentUser = User.builder()
                .id(1L).email("john@elitegym.com").username("john")
                .firstName("John").lastName("Doe")
                .role(RoleName.ROLE_STUDENT).isActive(true).build();

        otherStudentUser = User.builder()
                .id(10L).email("sara@elitegym.com").username("sara")
                .firstName("Sara").lastName("Lee")
                .role(RoleName.ROLE_STUDENT).isActive(true).build();

        trainerUser = User.builder()
                .id(50L).email("trainer@elitegym.com").username("trainer1")
                .firstName("Jane").lastName("Trainer")
                .role(RoleName.ROLE_TRAINER).isActive(true).build();

        adminUser = User.builder()
                .id(99L).email("admin@elitegym.com").username("admin")
                .firstName("Admin").lastName("Admin")
                .role(RoleName.ROLE_ADMIN).isActive(true).build();

        sampleStudent = StudentProfile.builder().id(20L).user(studentUser).build();
        otherStudent = StudentProfile.builder().id(30L).user(otherStudentUser).build();

        studentPrincipal = UserPrincipal.create(studentUser);
        otherStudentPrincipal = UserPrincipal.create(otherStudentUser);
        trainerPrincipal = UserPrincipal.create(trainerUser);
        adminPrincipal = UserPrincipal.create(adminUser);

        todayPresent = Attendance.builder()
                .id(1L).student(sampleStudent).date(TODAY)
                .checkInTime(LocalTime.of(7, 30)).checkOutTime(null)
                .status(AttendanceStatus.PRESENT).build();

        yesterdayPresent = Attendance.builder()
                .id(2L).student(sampleStudent).date(YESTERDAY)
                .checkInTime(LocalTime.of(8, 0)).checkOutTime(LocalTime.of(9, 30))
                .status(AttendanceStatus.PRESENT).build();

        dayBeforeLate = Attendance.builder()
                .id(3L).student(sampleStudent).date(DAY_BEFORE)
                .checkInTime(LocalTime.of(10, 15)).checkOutTime(LocalTime.of(11, 0))
                .status(AttendanceStatus.LATE).build();

        day3Present = Attendance.builder()
                .id(4L).student(sampleStudent).date(DAY3)
                .checkInTime(LocalTime.of(8, 0)).checkOutTime(LocalTime.of(9, 0))
                .status(AttendanceStatus.PRESENT).build();
    }

    // =========================================================================
    // STUDENT CHECK-IN
    // =========================================================================

    @Test
    void studentCheckIn_Success_DefaultPresent() {
        AttendanceCheckInRequest req = new AttendanceCheckInRequest();
        req.setDate(TODAY);
        req.setCheckInTime(LocalTime.of(7, 30));

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> {
            Attendance a = inv.getArgument(0);
            a.setId(100L);
            return a;
        });

        AttendanceDto dto = attendanceService.studentCheckIn(studentPrincipal, req);
        assertEquals(20L, dto.getStudentId());
        assertEquals(TODAY, dto.getDate());
        assertEquals(LocalTime.of(7, 30), dto.getCheckInTime());
        assertEquals(AttendanceStatus.PRESENT, dto.getStatus());
    }

    @Test
    void studentCheckIn_AfterThreshold_AutoLate() {
        AttendanceCheckInRequest req = new AttendanceCheckInRequest();
        req.setDate(TODAY);
        req.setCheckInTime(LocalTime.of(10, 30));

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));

        AttendanceDto dto = attendanceService.studentCheckIn(studentPrincipal, req);
        assertEquals(AttendanceStatus.LATE, dto.getStatus());
    }

    @Test
    void studentCheckIn_DuplicateDate_ThrowsBadRequest() {
        AttendanceCheckInRequest req = new AttendanceCheckInRequest();
        req.setDate(TODAY);
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.of(todayPresent));

        assertThrows(BadRequestException.class, () ->
                attendanceService.studentCheckIn(studentPrincipal, req));
    }

    @Test
    void studentCheckIn_StudentNotFound_ThrowsResourceNotFound() {
        AttendanceCheckInRequest req = new AttendanceCheckInRequest();
        when(studentProfileRepository.findByUserId(9999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                attendanceService.studentCheckIn(UserPrincipal.create(
                        User.builder().id(9999L).role(RoleName.ROLE_STUDENT).build()), req));
    }

    // =========================================================================
    // STUDENT CHECK-OUT
    // =========================================================================

    @Test
    void studentCheckOut_Success_ComputesDuration() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.of(todayPresent));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));

        AttendanceDto dto = attendanceService.studentCheckOut(studentPrincipal);
        assertNotNull(dto.getCheckOutTime());
        assertTrue(dto.getDurationMinutes() >= 0);
    }

    @Test
    void studentCheckOut_NoCheckIn_ThrowsBadRequest() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () ->
                attendanceService.studentCheckOut(studentPrincipal));
    }

    @Test
    void studentCheckOut_Duplicate_ThrowsBadRequest() {
        todayPresent.setCheckOutTime(LocalTime.of(9, 0));
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.of(todayPresent));

        assertThrows(BadRequestException.class, () ->
                attendanceService.studentCheckOut(studentPrincipal));
    }

    // =========================================================================
    // HISTORY + STATS
    // =========================================================================

    @Test
    void getMyAttendance_ReturnsDescOrder() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdWithDetails(20L)).thenReturn(
                List.of(todayPresent, yesterdayPresent, dayBeforeLate));

        List<AttendanceDto> list = attendanceService.getMyAttendance(studentPrincipal);
        assertEquals(3, list.size());
        assertEquals(TODAY, list.get(0).getDate());
    }

    @Test
    void getMyToday_WhenRecordExists_ReturnsDto() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.of(todayPresent));

        AttendanceDto dto = attendanceService.getMyToday(studentPrincipal);
        assertNotNull(dto);
        assertEquals(1L, dto.getId());
    }

    @Test
    void getMyToday_Empty_ReturnsNull() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.empty());

        assertNull(attendanceService.getMyToday(studentPrincipal));
    }

    @Test
    void getMyStats_CalculatesStreakAndRate() {
        List<Attendance> last30 = new ArrayList<>(List.of(day3Present, dayBeforeLate, yesterdayPresent, todayPresent));
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(attendanceRepository.findByStudentIdAndDateRangeWithDetails(eq(20L), any(), eq(TODAY)))
                .thenReturn(last30);
        when(attendanceRepository.countByStudentIdAndStatus(20L, AttendanceStatus.PRESENT)).thenReturn(30L);
        when(attendanceRepository.countByStudentIdAndStatus(20L, AttendanceStatus.ABSENT)).thenReturn(5L);
        when(attendanceRepository.countByStudentIdAndStatus(20L, AttendanceStatus.LATE)).thenReturn(5L);

        AttendanceStatsDto stats = attendanceService.getMyStats(studentPrincipal);

        assertEquals(40L, stats.getTotalDays());
        assertEquals(30L, stats.getPresentCount());
        assertEquals(5L, stats.getLateCount());
        assertEquals(5L, stats.getAbsentCount());
        assertEquals(87.5, stats.getPresentRate(), 0.01);
        assertEquals(4L, stats.getCurrentStreak());
    }

    // =========================================================================
    // STAFF MARK ATTENDANCE
    // =========================================================================

    @Test
    void staffMarkAttendance_Admin_NewRecord() {
        AttendanceCheckInRequest req = AttendanceCheckInRequest.builder()
                .studentId(20L).date(TODAY)
                .checkInTime(LocalTime.of(8, 0))
                .notes("Admin checked in student").build();

        when(studentProfileRepository.findById(20L)).thenReturn(Optional.of(sampleStudent));
        when(userRepository.findById(99L)).thenReturn(Optional.of(adminUser));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> {
            Attendance a = inv.getArgument(0);
            a.setId(500L);
            return a;
        });

        AttendanceDto dto = attendanceService.staffMarkAttendance(adminPrincipal, req);
        assertEquals(500L, dto.getId());
        assertEquals(99L, dto.getMarkedByAdminId());
        assertEquals("Admin Admin", dto.getMarkedByAdminName());
        assertEquals("Admin checked in student", dto.getNotes());
    }

    @Test
    void staffMarkAttendance_Trainer_UpdatesExisting() {
        AttendanceCheckInRequest req = AttendanceCheckInRequest.builder()
                .studentId(20L).date(TODAY)
                .checkInTime(LocalTime.of(9, 0))
                .status(AttendanceStatus.LATE)
                .notes("Ran late, trainer noted").build();

        when(studentProfileRepository.findById(20L)).thenReturn(Optional.of(sampleStudent));
        when(userRepository.findById(50L)).thenReturn(Optional.of(trainerUser));
        when(attendanceRepository.findByStudentIdAndDate(20L, TODAY)).thenReturn(Optional.of(todayPresent));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));

        AttendanceDto dto = attendanceService.staffMarkAttendance(trainerPrincipal, req);
        assertEquals(AttendanceStatus.LATE, dto.getStatus());
        assertEquals(LocalTime.of(9, 0), dto.getCheckInTime());
        assertEquals("Jane Trainer", dto.getMarkedByAdminName());
        assertEquals("Ran late, trainer noted", dto.getNotes());
    }

    @Test
    void staffMarkAttendance_NoStudentId_ThrowsBadRequest() {
        AttendanceCheckInRequest req = new AttendanceCheckInRequest();
        assertThrows(BadRequestException.class, () ->
                attendanceService.staffMarkAttendance(adminPrincipal, req));
    }

    @Test
    void staffMarkAttendance_StudentNotFound_ThrowsResourceNotFound() {
        AttendanceCheckInRequest req = AttendanceCheckInRequest.builder().studentId(9999L).build();
        when(studentProfileRepository.findById(9999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                attendanceService.staffMarkAttendance(adminPrincipal, req));
    }

    @Test
    void staffMarkAttendance_UnauthorizedUser_ThrowsUnauthorized() {
        AttendanceCheckInRequest req = AttendanceCheckInRequest.builder().studentId(20L).build();
        when(studentProfileRepository.findById(20L)).thenReturn(Optional.of(sampleStudent));
        when(userRepository.findById(1L)).thenReturn(Optional.of(studentUser));

        assertThrows(UnauthorizedException.class, () ->
                attendanceService.staffMarkAttendance(studentPrincipal, req));
    }

    // =========================================================================
    // ADMIN QUERIES + UPDATE
    // =========================================================================

    @Test
    void getByDate_ReturnsRecords() {
        when(attendanceRepository.findByDateWithDetails(TODAY)).thenReturn(List.of(todayPresent));
        List<AttendanceDto> list = attendanceService.getByDate(TODAY);
        assertEquals(1, list.size());
    }

    @Test
    void getByStudent_ReturnsStudentOnly() {
        when(attendanceRepository.findByStudentIdWithDetails(20L))
                .thenReturn(List.of(todayPresent, yesterdayPresent));
        List<AttendanceDto> list = attendanceService.getByStudent(20L);
        assertEquals(2, list.size());
        assertTrue(list.stream().allMatch(d -> d.getStudentId().equals(20L)));
    }

    @Test
    void updateAttendance_CheckOutAndStatus() {
        todayPresent.setId(10L);
        when(attendanceRepository.findById(10L)).thenReturn(Optional.of(todayPresent));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));

        AttendanceUpdateRequest req = AttendanceUpdateRequest.builder()
                .checkOutTime(LocalTime.of(9, 0))
                .status(AttendanceStatus.LATE)
                .notes("Updated by admin")
                .build();

        AttendanceDto dto = attendanceService.updateAttendance(10L, req);
        assertEquals(LocalTime.of(9, 0), dto.getCheckOutTime());
        assertEquals(AttendanceStatus.LATE, dto.getStatus());
        assertEquals("Updated by admin", dto.getNotes());
    }

    @Test
    void updateAttendance_CheckOutBeforeCheckIn_ThrowsBadRequest() {
        todayPresent.setId(10L);
        when(attendanceRepository.findById(10L)).thenReturn(Optional.of(todayPresent));

        AttendanceUpdateRequest req = AttendanceUpdateRequest.builder()
                .checkOutTime(LocalTime.of(6, 0))
                .build();

        assertThrows(BadRequestException.class, () ->
                attendanceService.updateAttendance(10L, req));
    }

    @Test
    void updateAttendance_NotFound_ThrowsResourceNotFound() {
        when(attendanceRepository.findById(9999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () ->
                attendanceService.updateAttendance(9999L, new AttendanceUpdateRequest()));
    }

    // =========================================================================
    // Enum parity
    // =========================================================================

    @Test
    void enumValues_AttendanceStatus_Counts() {
        assertEquals(3, AttendanceStatus.values().length);
        assertNotNull(AttendanceStatus.valueOf("PRESENT"));
        assertNotNull(AttendanceStatus.valueOf("ABSENT"));
        assertNotNull(AttendanceStatus.valueOf("LATE"));
    }
}
