package com.elitegym.repository;

import com.elitegym.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Long> {

    List<MembershipPlan> findByIsActiveTrue();

    Optional<MembershipPlan> findByNameIgnoreCase(String name);

    Boolean existsByNameIgnoreCase(String name);
}
