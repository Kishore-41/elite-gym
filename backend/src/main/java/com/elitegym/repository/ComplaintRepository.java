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

    @Query("SELECT DISTINCT c FROM Complaint c LEFT JOIN FETCH c.student s LEFT JOIN FETCH s.user su LEFT JOIN FETCH c.user u LEFT JOIN FETCH c.resolvedByAdmin LEFT JOIN FETCH c.resolvedBy WHERE (c.student.id = :studentId OR c.user.id = :userId) ORDER BY c.createdAt DESC")
    List<Complaint> findByStudentOrUserIdWithDetails(@Param("studentId") Long studentId, @Param("userId") Long userId);

    @Query("SELECT DISTINCT c FROM Complaint c LEFT JOIN FETCH c.student s LEFT JOIN FETCH s.user su LEFT JOIN FETCH c.user u LEFT JOIN FETCH c.resolvedByAdmin LEFT JOIN FETCH c.resolvedBy WHERE c.student.id = :studentId ORDER BY c.createdAt DESC")
    List<Complaint> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT c FROM Complaint c LEFT JOIN FETCH c.student s LEFT JOIN FETCH s.user su LEFT JOIN FETCH c.user u LEFT JOIN FETCH c.resolvedByAdmin LEFT JOIN FETCH c.resolvedBy ORDER BY c.createdAt DESC")
    List<Complaint> findAllWithDetails();

    @Query("SELECT DISTINCT c FROM Complaint c LEFT JOIN FETCH c.student s LEFT JOIN FETCH s.user su LEFT JOIN FETCH c.user u LEFT JOIN FETCH c.resolvedByAdmin LEFT JOIN FETCH c.resolvedBy WHERE c.status = :status ORDER BY c.createdAt DESC")
    List<Complaint> findByStatusWithDetails(@Param("status") ComplaintStatus status);

    @Query("SELECT DISTINCT c FROM Complaint c LEFT JOIN FETCH c.student s LEFT JOIN FETCH s.user su LEFT JOIN FETCH c.user u LEFT JOIN FETCH c.resolvedByAdmin LEFT JOIN FETCH c.resolvedBy WHERE c.category = :category ORDER BY c.createdAt DESC")
    List<Complaint> findByCategoryWithDetails(@Param("category") ComplaintCategory category);

    @Query("SELECT DISTINCT c FROM Complaint c LEFT JOIN FETCH c.student s LEFT JOIN FETCH s.user su LEFT JOIN FETCH c.user u LEFT JOIN FETCH c.resolvedByAdmin LEFT JOIN FETCH c.resolvedBy WHERE c.student.id = :studentId AND c.status = :status ORDER BY c.createdAt DESC")
    List<Complaint> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") ComplaintStatus status);

    @Query("SELECT DISTINCT c FROM Complaint c LEFT JOIN FETCH c.student s LEFT JOIN FETCH s.user su LEFT JOIN FETCH c.user u LEFT JOIN FETCH c.resolvedByAdmin LEFT JOIN FETCH c.resolvedBy WHERE c.id = :id")
    Optional<Complaint> findByIdWithDetails(@Param("id") Long id);
}
