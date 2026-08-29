package com.elitegym.repository;

import com.elitegym.entity.Complaint;
import com.elitegym.enums.ComplaintCategory;
import com.elitegym.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student s JOIN FETCH s.user LEFT JOIN FETCH c.resolvedByAdmin WHERE c.student.id = :studentId ORDER BY c.createdAt DESC")
    List<Complaint> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student s JOIN FETCH s.user LEFT JOIN FETCH c.resolvedByAdmin ORDER BY c.createdAt DESC")
    List<Complaint> findAllWithDetails();

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student s JOIN FETCH s.user LEFT JOIN FETCH c.resolvedByAdmin WHERE c.status = :status ORDER BY c.createdAt DESC")
    List<Complaint> findByStatusWithDetails(@Param("status") ComplaintStatus status);

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student s JOIN FETCH s.user LEFT JOIN FETCH c.resolvedByAdmin WHERE c.category = :category ORDER BY c.createdAt DESC")
    List<Complaint> findByCategoryWithDetails(@Param("category") ComplaintCategory category);

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student s JOIN FETCH s.user LEFT JOIN FETCH c.resolvedByAdmin WHERE c.student.id = :studentId AND c.status = :status ORDER BY c.createdAt DESC")
    List<Complaint> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") ComplaintStatus status);

    @Query("SELECT c FROM Complaint c JOIN FETCH c.student s JOIN FETCH s.user LEFT JOIN FETCH c.resolvedByAdmin WHERE c.id = :id")
    Optional<Complaint> findByIdWithDetails(@Param("id") Long id);
}
