package com.elitegym.controller;

import com.elitegym.dto.booking.AmenityBookingDto;
import com.elitegym.dto.booking.AmenityBookingRequest;
import com.elitegym.dto.common.ApiResponse;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.AmenityBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/student/amenity-bookings", "/api/v1/student/amenity-bookings"})
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class AmenityBookingController {

    private final AmenityBookingService amenityBookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<AmenityBookingDto>> bookAmenity(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AmenityBookingRequest request) {
        log.info("Student #{} requesting booking for facility #{}", principal.getId(), request.getFacilityId());
        AmenityBookingDto dto = amenityBookingService.createBooking(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Amenity booking confirmed successfully", dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AmenityBookingDto>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<AmenityBookingDto> dtos = amenityBookingService.getMyBookings(principal);
        return ResponseEntity.ok(ApiResponse.ok("Your amenity bookings retrieved", dtos));
    }

    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<AmenityBookingDto>> cancelBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long bookingId) {
        log.info("Student #{} cancelling booking #{}", principal.getId(), bookingId);
        AmenityBookingDto dto = amenityBookingService.cancelBooking(principal, bookingId);
        return ResponseEntity.ok(ApiResponse.ok("Amenity booking cancelled", dto));
    }
}
