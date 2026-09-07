package com.elitegym.dto.publicinfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassScheduleDto {
    private Long id;
    private String title;
    private Long trainerId;
    private String trainerName;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer capacity;
    private Integer bookedSlots;
    private Integer remainingSlots;
    private String room;
}
