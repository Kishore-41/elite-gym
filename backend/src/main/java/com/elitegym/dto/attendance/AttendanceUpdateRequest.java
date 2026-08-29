package com.elitegym.dto.attendance;

import com.elitegym.enums.AttendanceStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceUpdateRequest {

    private LocalTime checkOutTime;
    private AttendanceStatus status;

    @Size(max = 255, message = "Notes must be at most 255 characters")
    private String notes;
}
