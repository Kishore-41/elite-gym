package com.elitegym.repository;

import com.elitegym.entity.TrainerProfile;
import com.elitegym.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerProfileRepository extends JpaRepository<TrainerProfile, Long> {

    Optional<TrainerProfile> findByUser(User user);

    Optional<TrainerProfile> findByUserId(Long userId);

    List<TrainerProfile> findByIsAvailableTrue();

    Boolean existsByUserId(Long userId);
}
