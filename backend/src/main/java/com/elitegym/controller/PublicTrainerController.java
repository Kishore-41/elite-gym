package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.trainer.TrainerProfileDto;
import com.elitegym.service.TrainerRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping({"/api/trainers", "/api/public/trainers", "/api/v1/public/trainers"})
@RequiredArgsConstructor
public class PublicTrainerController {

    private final TrainerRequestService trainerRequestService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrainerProfileDto>>> getAvailableTrainers() {
        List<TrainerProfileDto> trainers = trainerRequestService.getAvailableTrainers();
        return ResponseEntity.ok(ApiResponse.ok("Available trainers retrieved", trainers));
    }
}
