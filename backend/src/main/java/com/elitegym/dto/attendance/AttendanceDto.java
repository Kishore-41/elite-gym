package com.elitegym.dto.attendance;

import com.elitegym.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Long durationMinutes;
    private AttendanceStatus status;
    private Long markedByAdminId;
    private String markedByAdminName;
    private String notes;
    private LocalDateTime createdAt;
}
