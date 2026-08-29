package com.elitegym.repository;

import com.elitegym.entity.TrainerRequest;
import com.elitegym.enums.RequestStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerRequestRepository extends JpaRepository<TrainerRequest, Long> {

    @Query("SELECT tr FROM TrainerRequest tr JOIN FETCH tr.student s JOIN FETCH s.user JOIN FETCH tr.trainer t JOIN FETCH t.user WHERE tr.trainer.id = :trainerId ORDER BY tr.createdAt DESC")
    List<TrainerRequest> findByTrainerIdWithDetails(@Param("trainerId") Long trainerId);

    @Query("SELECT tr FROM TrainerRequest tr JOIN FETCH tr.student s JOIN FETCH s.user JOIN FETCH tr.trainer t JOIN FETCH t.user WHERE tr.student.id = :studentId ORDER BY tr.createdAt DESC")
    List<TrainerRequest> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT tr FROM TrainerRequest tr JOIN FETCH tr.student s JOIN FETCH s.user JOIN FETCH tr.trainer t JOIN FETCH t.user WHERE tr.trainer.id = :trainerId AND tr.status = :status ORDER BY tr.createdAt DESC")
    List<TrainerRequest> findByTrainerIdAndStatus(@Param("trainerId") Long trainerId, @Param("status") RequestStatus status);

    @Query("SELECT tr FROM TrainerRequest tr JOIN FETCH tr.student s JOIN FETCH s.user JOIN FETCH tr.trainer t JOIN FETCH t.user WHERE tr.student.id = :studentId AND tr.status = :status ORDER BY tr.createdAt DESC")
    List<TrainerRequest> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") RequestStatus status);

    @Query("SELECT tr FROM TrainerRequest tr JOIN FETCH tr.student s JOIN FETCH s.user JOIN FETCH tr.trainer t JOIN FETCH t.user WHERE tr.id = :id")
    Optional<TrainerRequest> findByIdWithDetails(@Param("id") Long id);
}
