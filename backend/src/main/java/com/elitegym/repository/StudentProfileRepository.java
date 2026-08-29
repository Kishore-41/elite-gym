package com.elitegym.repository;

import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUser(User user);

    Optional<StudentProfile> findByUserId(Long userId);

    Boolean existsByUserId(Long userId);

    @Query("SELECT sp FROM StudentProfile sp JOIN FETCH sp.user u WHERE sp.assignedTrainer.id = :trainerId ORDER BY u.firstName, u.lastName")
    List<StudentProfile> findByAssignedTrainerIdWithUser(@Param("trainerId") Long trainerId);

    @Query("SELECT COUNT(sp) FROM StudentProfile sp WHERE sp.assignedTrainer.id = :trainerId")
    long countByAssignedTrainerId(@Param("trainerId") Long trainerId);

    @Query("SELECT sp FROM StudentProfile sp JOIN FETCH sp.user u LEFT JOIN FETCH sp.assignedTrainer at LEFT JOIN FETCH at.user au WHERE sp.id = :id")
    Optional<StudentProfile> findByIdWithDetails(@Param("id") Long id);
}
