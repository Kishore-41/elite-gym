package com.elitegym.dto.notification;

import com.elitegym.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {

    private Long id;
    private Long userId;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private String actionLink;
    private LocalDateTime createdAt;
}
