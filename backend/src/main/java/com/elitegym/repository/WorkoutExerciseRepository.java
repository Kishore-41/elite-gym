package com.elitegym.repository;

import com.elitegym.entity.WorkoutExercise;
import com.elitegym.enums.WorkoutDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {

    List<WorkoutExercise> findByWorkoutPlanId(Long workoutPlanId);

    List<WorkoutExercise> findByWorkoutPlanIdAndDayOfWeek(Long workoutPlanId, WorkoutDay dayOfWeek);

    void deleteByWorkoutPlanId(Long workoutPlanId);

    long countByWorkoutPlanId(Long workoutPlanId);
}
