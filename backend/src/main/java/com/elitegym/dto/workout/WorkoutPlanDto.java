package com.elitegym.dto.workout;

import com.elitegym.enums.WorkoutDifficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanDto {

    private Long id;
    private String title;
    private String description;
    private Long trainerId;
    private String trainerName;
    private String trainerSpecialization;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private WorkoutDifficulty difficulty;
    private String targetGoal;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private Boolean isTemplate;
    @Builder.Default
    private List<WorkoutExerciseDto> exercises = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
