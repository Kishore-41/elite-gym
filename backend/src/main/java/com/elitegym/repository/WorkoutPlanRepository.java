package com.elitegym.repository;

import com.elitegym.entity.WorkoutPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {

    @Query("SELECT wp FROM WorkoutPlan wp JOIN FETCH wp.trainer t JOIN FETCH t.user LEFT JOIN FETCH wp.student s LEFT JOIN FETCH s.user WHERE wp.trainer.id = :trainerId ORDER BY wp.createdAt DESC")
    List<WorkoutPlan> findByTrainerIdWithDetails(@Param("trainerId") Long trainerId);

    @Query("SELECT wp FROM WorkoutPlan wp JOIN FETCH wp.trainer t JOIN FETCH t.user LEFT JOIN FETCH wp.student s LEFT JOIN FETCH s.user WHERE wp.student.id = :studentId AND wp.isActive = true ORDER BY wp.createdAt DESC")
    List<WorkoutPlan> findActiveByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT wp FROM WorkoutPlan wp JOIN FETCH wp.trainer t JOIN FETCH t.user LEFT JOIN FETCH wp.student s LEFT JOIN FETCH s.user WHERE wp.student.id IS NULL AND wp.trainer.id = :trainerId ORDER BY wp.createdAt DESC")
    List<WorkoutPlan> findTemplatesByTrainerId(@Param("trainerId") Long trainerId);

    @Query("SELECT wp FROM WorkoutPlan wp JOIN FETCH wp.trainer t JOIN FETCH t.user LEFT JOIN FETCH wp.student s LEFT JOIN FETCH s.user LEFT JOIN FETCH wp.exercises e WHERE wp.id = :id")
    Optional<WorkoutPlan> findByIdWithExercises(@Param("id") Long id);

    List<WorkoutPlan> findByTrainerIdAndStudentId(Long trainerId, Long studentId);
}
