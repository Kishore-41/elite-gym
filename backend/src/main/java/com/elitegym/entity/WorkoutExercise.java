package com.elitegym.entity;

import com.elitegym.enums.WorkoutDay;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "workout_exercises", indexes = {
    @Index(name = "idx_workout_exercises_plan_day", columnList = "workout_plan_id, day_of_week")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_plan_id", nullable = false, foreignKey = @ForeignKey(name = "fk_workout_exercises_plan"))
    private WorkoutPlan workoutPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 12)
    private WorkoutDay dayOfWeek;

    @Column(name = "exercise_name", nullable = false, length = 100)
    private String exerciseName;

    @Column(nullable = false)
    private Integer sets;

    @Column(nullable = false, length = 50)
    private String reps;

    @Column(name = "target_weight_kg", precision = 5, scale = 2)
    private BigDecimal targetWeightKg;

    @Column(name = "rest_seconds", nullable = false)
    @Builder.Default
    private Integer restSeconds = 60;

    @Column(length = 255)
    private String notes;

    @Column(name = "order_index", nullable = false)
    @Builder.Default
    private Integer orderIndex = 0;
}
