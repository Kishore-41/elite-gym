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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanUpdateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    private String description;

    @NotNull(message = "Difficulty is required")
    private WorkoutDifficulty difficulty;

    @Size(max = 100, message = "Target goal cannot exceed 100 characters")
    private String targetGoal;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean isActive;

    private Long studentId;
}
