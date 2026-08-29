package com.elitegym.dto.workout;

import com.elitegym.enums.WorkoutDay;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutExerciseCreateRequest {

    @NotNull(message = "Day of week is required")
    private WorkoutDay dayOfWeek;

    @NotBlank(message = "Exercise name is required")
    @Size(max = 100, message = "Exercise name cannot exceed 100 characters")
    private String exerciseName;

    @NotNull(message = "Sets is required")
    @Positive(message = "Sets must be a positive number")
    private Integer sets;

    @NotBlank(message = "Reps is required")
    @Size(max = 50, message = "Reps cannot exceed 50 characters")
    private String reps;

    private BigDecimal targetWeightKg;

    @Builder.Default
    @Positive(message = "Rest seconds must be a positive number")
    private Integer restSeconds = 60;

    @Size(max = 255, message = "Notes cannot exceed 255 characters")
    private String notes;

    @Builder.Default
    private Integer orderIndex = 0;
}
