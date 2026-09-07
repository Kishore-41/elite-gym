package com.elitegym.repository;

import com.elitegym.entity.AmenityBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AmenityBookingRepository extends JpaRepository<AmenityBooking, Long> {
    List<AmenityBooking> findByUserId(Long userId);
    List<AmenityBooking> findByFacilityIdAndBookingDate(Long facilityId, LocalDate bookingDate);
    List<AmenityBooking> findByUserIdAndStatus(Long userId, String status);
}
