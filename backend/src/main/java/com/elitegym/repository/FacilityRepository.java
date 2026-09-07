package com.elitegym.repository;

import com.elitegym.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByActiveTrue();
    List<Facility> findByCategoryAndActiveTrue(String category);
}
