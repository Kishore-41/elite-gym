package com.elitegym.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStatsDto {

    private Long totalDays;
    private Long presentCount;
    private Long absentCount;
    private Long lateCount;
    private Double presentRate;
    private Long currentStreak;
}
