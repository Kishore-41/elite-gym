package com.elitegym.service;

import com.elitegym.dto.booking.AmenityBookingDto;
import com.elitegym.dto.booking.AmenityBookingRequest;
import com.elitegym.entity.*;
import com.elitegym.enums.MembershipStatus;
import com.elitegym.enums.NotificationType;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UpgradeRequiredException;
import com.elitegym.repository.*;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmenityBookingService {

    private final AmenityBookingRepository amenityBookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentMembershipRepository studentMembershipRepository;
    private final NotificationService notificationService;

    @Transactional
    public AmenityBookingDto createBooking(UserPrincipal principal, AmenityBookingRequest request) {
        log.info("Processing amenity booking request for user #{}, facility #{}", principal.getId(), request.getFacilityId());

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        StudentProfile profile = studentProfileRepository.findByUserId(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", principal.getId()));

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility", "id", request.getFacilityId()));

        if (!facility.isActive()) {
            throw new BadRequestException("This facility is currently closed or inactive.");
        }

        // 1. Tier-Gating Check
        List<StudentMembership> activeMemberships = studentMembershipRepository.findByStudentIdAndStatus(
                profile.getId(), MembershipStatus.ACTIVE);

        LocalDate today = LocalDate.now();
        StudentMembership currentMembership = activeMemberships.stream()
                .filter(m -> !today.isBefore(m.getStartDate()) && !today.isAfter(m.getEndDate()))
                .findFirst()
                .orElse(null);

        if (currentMembership == null) {
            throw new BadRequestException("An active membership subscription is required to book gym amenities.");
        }

        String planName = currentMembership.getPlan().getName().toLowerCase();
        String facilityCat = facility.getCategory().toUpperCase();

        if (planName.contains("basic")) {
            if ("SWIMMING_POOL".equals(facilityCat) || "SPA_RECOVERY".equals(facilityCat)) {
                log.warn("User #{} on Basic plan attempted to book tier-gated facility category {}", principal.getId(), facilityCat);
                throw new UpgradeRequiredException("Upgrade to Premium or Elite to access Pool & Spa amenities");
            }
        }

        // 2. Capacity Check
        List<AmenityBooking> bookingsOnDate = amenityBookingRepository.findByFacilityIdAndBookingDate(
                facility.getId(), request.getBookingDate());

        long overlappingCount = bookingsOnDate.stream()
                .filter(b -> "CONFIRMED".equalsIgnoreCase(b.getStatus()))
                .filter(b -> !(request.getEndTime().isBefore(b.getStartTime()) || request.getStartTime().isAfter(b.getEndTime())))
                .count();

        if (overlappingCount >= facility.getCapacity()) {
            throw new BadRequestException("Selected time slot is at maximum capacity (" +
                    facility.getCapacity() + " members). Please choose an alternate slot.");
        }

        // 3. Save Booking
        AmenityBooking booking = AmenityBooking.builder()
                .user(user)
                .facility(facility)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status("CONFIRMED")
                .build();

        AmenityBooking saved = amenityBookingRepository.save(booking);

        // 4. Trigger In-App Notification
        try {
            notificationService.createSystemNotification(
                    user.getId(),
                    "Amenity Booking Confirmed",
                    "Your session at " + facility.getName() + " on " + request.getBookingDate() +
                            " (" + request.getStartTime() + " - " + request.getEndTime() + ") is confirmed.",
                    NotificationType.SYSTEM,
                    "/dashboard"
            );
        } catch (Exception e) {
            log.warn("Could not dispatch booking confirmation notification: {}", e.getMessage());
        }

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AmenityBookingDto> getMyBookings(UserPrincipal principal) {
        return amenityBookingRepository.findByUserId(principal.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AmenityBookingDto cancelBooking(UserPrincipal principal, Long bookingId) {
        AmenityBooking booking = amenityBookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("AmenityBooking", "id", bookingId));

        if (!booking.getUser().getId().equals(principal.getId())) {
            throw new BadRequestException("You can only cancel your own amenity bookings.");
        }

        booking.setStatus("CANCELLED");
        AmenityBooking saved = amenityBookingRepository.save(booking);

        return mapToDto(saved);
    }

    private AmenityBookingDto mapToDto(AmenityBooking b) {
        return AmenityBookingDto.builder()
                .id(b.getId())
                .userId(b.getUser().getId())
                .userName(b.getUser().getFullName())
                .facilityId(b.getFacility().getId())
                .facilityName(b.getFacility().getName())
                .facilityCategory(b.getFacility().getCategory())
                .bookingDate(b.getBookingDate())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
