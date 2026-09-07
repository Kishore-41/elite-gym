package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.publicinfo.FacilityDto;
import com.elitegym.entity.Facility;
import com.elitegym.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({"/api/facilities", "/api/public/facilities"})
@RequiredArgsConstructor
public class PublicFacilityController {

    private final FacilityRepository facilityRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityDto>>> getActiveFacilities(
            @RequestParam(required = false) String category) {
        List<Facility> facilities;
        if (category != null && !category.isBlank()) {
            facilities = facilityRepository.findByCategoryAndActiveTrue(category.toUpperCase());
        } else {
            facilities = facilityRepository.findByActiveTrue();
        }

        List<FacilityDto> dtos = facilities.stream()
                .map(f -> FacilityDto.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .category(f.getCategory())
                        .description(f.getDescription())
                        .rules(f.getRules())
                        .capacity(f.getCapacity())
                        .imageUrl(f.getImageUrl())
                        .operationalHours(f.getOperationalHours())
                        .active(f.isActive())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Active facilities retrieved successfully", dtos));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDto>> getFacilityById(@PathVariable Long id) {
        return facilityRepository.findById(id)
                .map(f -> FacilityDto.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .category(f.getCategory())
                        .description(f.getDescription())
                        .rules(f.getRules())
                        .capacity(f.getCapacity())
                        .imageUrl(f.getImageUrl())
                        .operationalHours(f.getOperationalHours())
                        .active(f.isActive())
                        .build())
                .map(dto -> ResponseEntity.ok(ApiResponse.ok("Facility details retrieved", dto)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
