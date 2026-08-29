package com.elitegym.repository;

import com.elitegym.entity.ProgressPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgressPhotoRepository extends JpaRepository<ProgressPhoto, Long> {
}
