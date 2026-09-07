package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.publicinfo.GuestPassDto;
import com.elitegym.dto.publicinfo.GuestPassRequest;
import com.elitegym.entity.GuestPass;
import com.elitegym.repository.GuestPassRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping({"/api/guest-pass", "/api/public/guest-pass"})
@RequiredArgsConstructor
public class GuestPassController {

    private final GuestPassRepository guestPassRepository;
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @PostMapping
    public ResponseEntity<ApiResponse<GuestPassDto>> generateGuestPass(
            @Valid @RequestBody GuestPassRequest request) {
        log.info("Generating VIP Guest Pass for: {}", request.getEmail());

        String passCode;
        do {
            passCode = "MAD-PASS-" + (1000 + RANDOM.nextInt(9000));
        } while (guestPassRepository.existsByPassCode(passCode));

        LocalDate validDate = LocalDate.now().plusDays(1);

        GuestPass pass = GuestPass.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phoneNumber(request.getPhoneNumber().trim())
                .passCode(passCode)
                .validDate(validDate)
                .status("ACTIVE")
                .build();

        GuestPass saved = guestPassRepository.save(pass);

        GuestPassDto dto = GuestPassDto.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .phoneNumber(saved.getPhoneNumber())
                .passCode(saved.getPassCode())
                .validDate(saved.getValidDate())
                .status(saved.getStatus())
                .message("Your VIP 1-Day Guest Pass is active! Present code " + saved.getPassCode() + " at the front desk before " + validDate + ".")
                .build();

        return new ResponseEntity<>(ApiResponse.ok("Guest pass generated successfully", dto), HttpStatus.CREATED);
    }

    @GetMapping("/{passCode}")
    public ResponseEntity<ApiResponse<GuestPassDto>> verifyGuestPass(@PathVariable String passCode) {
        return guestPassRepository.findByPassCode(passCode.toUpperCase())
                .map(pass -> {
                    String status = pass.getStatus();
                    if ("ACTIVE".equals(status) && LocalDate.now().isAfter(pass.getValidDate())) {
                        status = "EXPIRED";
                    }
                    GuestPassDto dto = GuestPassDto.builder()
                            .id(pass.getId())
                            .fullName(pass.getFullName())
                            .email(pass.getEmail())
                            .phoneNumber(pass.getPhoneNumber())
                            .passCode(pass.getPassCode())
                            .validDate(pass.getValidDate())
                            .status(status)
                            .message("Pass status: " + status)
                            .build();
                    return ResponseEntity.ok(ApiResponse.ok("Guest pass verified", dto));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Guest pass not found with code: " + passCode)));
    }

    private String generateRandomCode(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
