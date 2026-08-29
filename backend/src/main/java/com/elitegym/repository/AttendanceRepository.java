package com.elitegym.repository;

import com.elitegym.entity.Attendance;
import com.elitegym.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student s JOIN FETCH s.user WHERE s.id = :studentId ORDER BY a.date DESC")
    List<Attendance> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student s JOIN FETCH s.user WHERE s.id = :studentId AND a.date = :date")
    Optional<Attendance> findByStudentIdAndDate(@Param("studentId") Long studentId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student s JOIN FETCH s.user WHERE a.date = :date ORDER BY a.checkInTime DESC")
    List<Attendance> findByDateWithDetails(@Param("date") LocalDate date);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student s JOIN FETCH s.user WHERE a.date BETWEEN :from AND :to ORDER BY a.date DESC")
    List<Attendance> findByDateRangeWithDetails(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student s JOIN FETCH s.user WHERE s.id = :studentId AND a.date BETWEEN :from AND :to ORDER BY a.date DESC")
    List<Attendance> findByStudentIdAndDateRangeWithDetails(
            @Param("studentId") Long studentId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = :status")
    long countByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.date BETWEEN :from AND :to")
    long countByStudentIdAndDateRange(@Param("studentId") Long studentId,
                                       @Param("from") LocalDate from,
                                       @Param("to") LocalDate to);

    @Query("SELECT COUNT(DISTINCT a.student.id) FROM Attendance a WHERE a.date = :date")
    long countUniqueStudentsOnDate(@Param("date") LocalDate date);
}
