package com.elitegym.service;

import com.elitegym.dto.notification.NotificationCreateRequest;
import com.elitegym.dto.notification.NotificationDto;
import com.elitegym.entity.Notification;
import com.elitegym.entity.User;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.NotificationRepository;
import com.elitegym.repository.UserRepository;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // =========================================================================
    // 1. CREATE (Admin/SYSTEM can dispatch to any user; students restricted)
    // =========================================================================

    @Transactional
    public NotificationDto createNotification(UserPrincipal principal, NotificationCreateRequest request) {
        if (principal.getRole() != RoleName.ROLE_ADMIN) {
            throw new UnauthorizedException("Only admins can dispatch notifications.");
        }

        User recipient = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Notification notification = Notification.builder()
                .user(recipient)
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .actionLink(request.getActionLink())
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Admin #{} sent notification #{} [{}] to user #{}: {}",
                principal.getId(), saved.getId(), saved.getType(), recipient.getId(), saved.getTitle());
        return mapToDto(saved);
    }

    @Transactional
    public NotificationDto createSystemNotification(Long userId, String title, String message,
                                                    com.elitegym.enums.NotificationType type, String actionLink) {
        User recipient = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notification = Notification.builder()
                .user(recipient)
                .title(title)
                .message(message)
                .type(type)
                .actionLink(actionLink)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("System notification #{} [{}] delivered to user #{}", saved.getId(), saved.getType(), userId);
        return mapToDto(saved);
    }

    // =========================================================================
    // 2. CURRENT USER: list / unread / count
    // =========================================================================

    @Transactional(readOnly = true)
    public List<NotificationDto> getMyNotifications(UserPrincipal principal) {
        List<Notification> notifications = notificationRepository.findByUserIdWithUser(principal.getId());
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getMyUnreadNotifications(UserPrincipal principal) {
        List<Notification> notifications = notificationRepository.findUnreadByUserIdWithUser(principal.getId());
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long countUnread(UserPrincipal principal) {
        return notificationRepository.countUnreadByUserId(principal.getId());
    }

    // =========================================================================
    // 3. MARK AS READ (single + all)
    // =========================================================================

    @Transactional
    public NotificationDto markAsRead(UserPrincipal principal, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(principal.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this notification.");
        }

        if (notification.isRead()) {
            return mapToDto(notification);
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToDto(saved);
    }

    @Transactional
    public long markAllAsRead(UserPrincipal principal) {
        int updated = notificationRepository.markAllAsReadByUserId(principal.getId());
        log.info("User #{} marked {} notifications as read", principal.getId(), updated);
        return updated;
    }

    // =========================================================================
    // 4. ADMIN: list notifications for a specific user
    // =========================================================================

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotificationsByAdmin(UserPrincipal principal, Long userId) {
        if (principal.getRole() != RoleName.ROLE_ADMIN) {
            throw new UnauthorizedException("Only admins can view other users' notifications.");
        }

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }

        List<Notification> notifications = notificationRepository.findByUserIdWithUser(userId);
        return notifications.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    // =========================================================================
    // 5. HELPER
    // =========================================================================

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUser().getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .actionLink(n.getActionLink())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
