package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.notification.NotificationCreateRequest;
import com.elitegym.dto.notification.NotificationDto;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.NotificationService;
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
@RequestMapping({"/api/admin/notifications", "/api/v1/admin/notifications"})
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationDto>> createNotification(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody NotificationCreateRequest request) {
        log.info("Admin #{} dispatching notification [{}] to user #{}",
                principal.getId(), request.getType(), request.getUserId());
        NotificationDto created = notificationService.createNotification(principal, request);
        return new ResponseEntity<>(ApiResponse.ok("Notification dispatched", created), HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getUserNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId) {
        List<NotificationDto> list = notificationService.getUserNotificationsByAdmin(principal, userId);
        return ResponseEntity.ok(ApiResponse.ok("User notifications retrieved", list));
    }
}
