package com.elitegym.dto.workout;

import com.elitegym.enums.WorkoutDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    private String description;

    private Long studentId;

    @NotNull(message = "Difficulty is required")
    @Builder.Default
    private WorkoutDifficulty difficulty = WorkoutDifficulty.INTERMEDIATE;

    @Size(max = 100, message = "Target goal cannot exceed 100 characters")
    private String targetGoal;

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    private List<WorkoutExerciseCreateRequest> exercises = new ArrayList<>();
}
