package com.elitegym.repository;

import com.elitegym.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    List<ClassSchedule> findByDayOfWeek(String dayOfWeek);
    List<ClassSchedule> findByTrainerId(Long trainerId);
}
