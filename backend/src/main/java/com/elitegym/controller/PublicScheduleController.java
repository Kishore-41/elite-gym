package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.publicinfo.ClassScheduleDto;
import com.elitegym.entity.ClassSchedule;
import com.elitegym.repository.ClassScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({"/api/schedule", "/api/public/schedule"})
@RequiredArgsConstructor
public class PublicScheduleController {

    private final ClassScheduleRepository classScheduleRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassScheduleDto>>> getWeeklySchedule(
            @RequestParam(required = false) String dayOfWeek) {
        List<ClassSchedule> schedules;
        if (dayOfWeek != null && !dayOfWeek.isBlank()) {
            schedules = classScheduleRepository.findByDayOfWeek(dayOfWeek.toUpperCase());
        } else {
            schedules = classScheduleRepository.findAll();
        }

        List<ClassScheduleDto> dtos = schedules.stream()
                .map(s -> {
                    String trainerName = "Certified Specialist";
                    Long trainerId = null;
                    if (s.getTrainer() != null) {
                        trainerId = s.getTrainer().getId();
                        trainerName = s.getTrainer().getFullName();
                    }
                    int booked = s.getBookedSlots() != null ? s.getBookedSlots() : 0;
                    int remaining = Math.max(0, s.getCapacity() - booked);

                    return ClassScheduleDto.builder()
                            .id(s.getId())
                            .title(s.getTitle())
                            .trainerId(trainerId)
                            .trainerName(trainerName)
                            .dayOfWeek(s.getDayOfWeek())
                            .startTime(s.getStartTime())
                            .endTime(s.getEndTime())
                            .capacity(s.getCapacity())
                            .bookedSlots(booked)
                            .remainingSlots(remaining)
                            .room(s.getRoom())
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Class schedule retrieved successfully", dtos));
    }
}
