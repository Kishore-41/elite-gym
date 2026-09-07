package com.elitegym.repository;

import com.elitegym.entity.GuestPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuestPassRepository extends JpaRepository<GuestPass, Long> {
    Optional<GuestPass> findByPassCode(String passCode);
    Optional<GuestPass> findByEmail(String email);
    boolean existsByPassCode(String passCode);
}
