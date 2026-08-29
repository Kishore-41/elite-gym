package com.elitegym.repository;

import com.elitegym.entity.ProgressEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressEntryRepository extends JpaRepository<ProgressEntry, Long> {

    @Query("SELECT DISTINCT p FROM ProgressEntry p JOIN FETCH p.student s JOIN FETCH s.user LEFT JOIN FETCH p.photos WHERE s.id = :studentId ORDER BY p.recordDate DESC")
    List<ProgressEntry> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT p FROM ProgressEntry p JOIN FETCH p.student s JOIN FETCH s.user LEFT JOIN FETCH p.photos WHERE p.id = :id")
    Optional<ProgressEntry> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM ProgressEntry p JOIN FETCH p.student s JOIN FETCH s.user LEFT JOIN FETCH p.photos WHERE s.id = :studentId ORDER BY p.recordDate DESC")
    List<ProgressEntry> findTopByStudentIdOrderByRecordDateDesc(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(p) > 0 FROM ProgressEntry p WHERE p.student.id = :studentId AND p.recordDate = :recordDate AND p.id <> :excludeId")
    boolean existsDuplicateDate(@Param("studentId") Long studentId,
                                 @Param("recordDate") LocalDate recordDate,
                                 @Param("excludeId") Long excludeId);
}
