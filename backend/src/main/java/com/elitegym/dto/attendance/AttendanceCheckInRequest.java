package com.elitegym.dto.attendance;

import com.elitegym.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCheckInRequest {

    private Long studentId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private LocalTime checkInTime;

    private AttendanceStatus status;

    @Size(max = 255, message = "Notes must be at most 255 characters")
    private String notes;
}
