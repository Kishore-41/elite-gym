package com.elitegym.entity;

import com.elitegym.enums.WorkoutDifficulty;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_plans", indexes = {
    @Index(name = "idx_workout_plans_trainer", columnList = "trainer_id"),
    @Index(name = "idx_workout_plans_student", columnList = "student_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trainer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_workout_plans_trainer"))
    private TrainerProfile trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", foreignKey = @ForeignKey(name = "fk_workout_plans_student"))
    private StudentProfile student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private WorkoutDifficulty difficulty = WorkoutDifficulty.INTERMEDIATE;

    @Column(name = "target_goal", length = 100)
    private String targetGoal;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "workoutPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayOfWeek ASC, orderIndex ASC")
    @Builder.Default
    private List<WorkoutExercise> exercises = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void addExercise(WorkoutExercise exercise) {
        exercises.add(exercise);
        exercise.setWorkoutPlan(this);
    }

    public void removeExercise(WorkoutExercise exercise) {
        exercises.remove(exercise);
        exercise.setWorkoutPlan(null);
    }

    public boolean isTemplate() {
        return student == null;
    }
}
