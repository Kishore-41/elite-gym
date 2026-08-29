package com.elitegym.controller;

import com.elitegym.dto.common.ApiResponse;
import com.elitegym.dto.notification.NotificationDto;
import com.elitegym.security.UserPrincipal;
import com.elitegym.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/notifications", "/api/v1/notifications"})
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationDto> list = notificationService.getMyNotifications(principal);
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", list));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyUnreadNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<NotificationDto> list = notificationService.getMyUnreadNotifications(principal);
        return ResponseEntity.ok(ApiResponse.ok("Unread notifications retrieved", list));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countUnread(
            @AuthenticationPrincipal UserPrincipal principal) {
        long count = notificationService.countUnread(principal);
        return ResponseEntity.ok(ApiResponse.ok("Unread count", Map.of("count", count)));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long notificationId) {
        NotificationDto updated = notificationService.markAsRead(principal, notificationId);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", updated));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Map<String, Long>>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        long updated = notificationService.markAllAsRead(principal);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", Map.of("updated", updated)));
    }
}
