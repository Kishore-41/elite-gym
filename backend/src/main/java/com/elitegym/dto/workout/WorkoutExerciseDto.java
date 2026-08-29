package com.elitegym.dto.workout;

import com.elitegym.enums.WorkoutDay;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutExerciseDto {

    private Long id;
    private WorkoutDay dayOfWeek;
    private String exerciseName;
    private Integer sets;
    private String reps;
    private BigDecimal targetWeightKg;
    private Integer restSeconds;
    private String notes;
    private Integer orderIndex;
}
