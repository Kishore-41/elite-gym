package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.publicinfo.AchievementDto;
import com.elitegym.entity.Achievement;
import com.elitegym.repository.AchievementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({"/api/achievements", "/api/public/achievements"})
@RequiredArgsConstructor
public class PublicAchievementController {

    private final AchievementRepository achievementRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AchievementDto>>> getAchievements() {
        List<Achievement> achievements = achievementRepository.findAllByOrderByYearAwardedDesc();

        List<AchievementDto> dtos = achievements.stream()
                .map(a -> AchievementDto.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        .description(a.getDescription())
                        .yearAwarded(a.getYearAwarded())
                        .organization(a.getOrganization())
                        .badgeIconUrl(a.getBadgeIconUrl())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok("Gym achievements retrieved successfully", dtos));
    }
}
