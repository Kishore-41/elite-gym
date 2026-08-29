package com.elitegym.repository;

import com.elitegym.entity.StudentMembership;
import com.elitegym.enums.MembershipStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentMembershipRepository extends JpaRepository<StudentMembership, Long> {

    @Query("SELECT sm FROM StudentMembership sm JOIN FETCH sm.plan JOIN FETCH sm.student s JOIN FETCH s.user WHERE sm.student.id = :studentId ORDER BY sm.createdAt DESC")
    List<StudentMembership> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT sm FROM StudentMembership sm JOIN FETCH sm.plan JOIN FETCH sm.student s JOIN FETCH s.user WHERE sm.student.id = :studentId AND sm.status = :status AND sm.endDate >= :currentDate ORDER BY sm.endDate DESC")
    List<StudentMembership> findActiveMembershipsByStudentId(
            @Param("studentId") Long studentId,
            @Param("status") MembershipStatus status,
            @Param("currentDate") LocalDate currentDate);

    @Query("SELECT sm FROM StudentMembership sm JOIN FETCH sm.plan JOIN FETCH sm.student s JOIN FETCH s.user ORDER BY sm.createdAt DESC")
    List<StudentMembership> findAllWithDetails();

    @Query("SELECT sm FROM StudentMembership sm JOIN FETCH sm.plan JOIN FETCH sm.student s JOIN FETCH s.user WHERE sm.status = :status ORDER BY sm.createdAt DESC")
    List<StudentMembership> findByStatusWithDetails(@Param("status") MembershipStatus status);

    List<StudentMembership> findByEndDateBeforeAndStatus(LocalDate date, MembershipStatus status);

    Boolean existsByPlanId(Long planId);

    Boolean existsByStudentIdAndStatusAndEndDateGreaterThanEqual(
            Long studentId, MembershipStatus status, LocalDate date);
}
