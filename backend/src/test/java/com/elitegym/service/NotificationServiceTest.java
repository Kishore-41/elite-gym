package com.elitegym.service;

import com.elitegym.dto.notification.NotificationCreateRequest;
import com.elitegym.dto.notification.NotificationDto;
import com.elitegym.entity.Notification;
import com.elitegym.entity.User;
import com.elitegym.enums.NotificationType;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.NotificationRepository;
import com.elitegym.repository.UserRepository;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private User studentUser;
    private User adminUser;
    private User trainerUser;
    private Notification noteUnread1;
    private Notification noteUnread2;
    private Notification noteRead1;
    private UserPrincipal studentPrincipal;
    private UserPrincipal adminPrincipal;
    private UserPrincipal trainerPrincipal;

    @BeforeEach
    void setUp() {
        studentUser = User.builder()
                .id(1L)
                .email("student@elitegym.com")
                .username("john_student")
                .firstName("John")
                .lastName("Doe")
                .role(RoleName.ROLE_STUDENT)
                .isActive(true)
                .build();

        adminUser = User.builder()
                .id(3L)
                .email("admin@elitegym.com")
                .username("system_admin")
                .firstName("System")
                .lastName("Admin")
                .role(RoleName.ROLE_ADMIN)
                .isActive(true)
                .build();

        trainerUser = User.builder()
                .id(2L)
                .email("trainer@elitegym.com")
                .username("trainer_mike")
                .firstName("Mike")
                .lastName("Coach")
                .role(RoleName.ROLE_TRAINER)
                .isActive(true)
                .build();

        noteUnread1 = Notification.builder()
                .id(100L)
                .user(studentUser)
                .title("Membership Renewal")
                .message("Your membership ends in 5 days.")
                .type(NotificationType.MEMBERSHIP)
                .isRead(false)
                .actionLink("/student/membership")
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();

        noteUnread2 = Notification.builder()
                .id(101L)
                .user(studentUser)
                .title("Workout Assigned")
                .message("New weekly workout plan assigned by your trainer.")
                .type(NotificationType.WORKOUT)
                .isRead(false)
                .actionLink("/student/workouts")
                .createdAt(LocalDateTime.now().minusMinutes(30))
                .build();

        noteRead1 = Notification.builder()
                .id(102L)
                .user(studentUser)
                .title("Complaint Resolved")
                .message("Your equipment complaint has been resolved.")
                .type(NotificationType.COMPLAINT)
                .isRead(true)
                .actionLink(null)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        studentPrincipal = UserPrincipal.create(studentUser);
        adminPrincipal = UserPrincipal.create(adminUser);
        trainerPrincipal = UserPrincipal.create(trainerUser);
    }

    // =========================================================================
    // createNotification (Admin-only)
    // =========================================================================

    @Test
    void createNotification_Admin_Success() {
        NotificationCreateRequest req = NotificationCreateRequest.builder()
                .userId(1L)
                .title("System Maintenance")
                .message("Gym will be closed Sunday for maintenance.")
                .type(NotificationType.SYSTEM)
                .actionLink(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(studentUser));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification n = invocation.getArgument(0);
            n.setId(500L);
            return n;
        });

        NotificationDto created = notificationService.createNotification(adminPrincipal, req);

        assertNotNull(created);
        assertEquals(500L, created.getId());
        assertEquals(1L, created.getUserId());
        assertEquals("System Maintenance", created.getTitle());
        assertEquals(NotificationType.SYSTEM, created.getType());
        assertFalse(created.isRead());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void createNotification_StudentRole_ThrowsUnauthorized() {
        NotificationCreateRequest req = NotificationCreateRequest.builder()
                .userId(2L).title("X").message("Y").type(NotificationType.SYSTEM).build();

        assertThrows(UnauthorizedException.class, () ->
                notificationService.createNotification(studentPrincipal, req));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createNotification_TrainerRole_ThrowsUnauthorized() {
        NotificationCreateRequest req = NotificationCreateRequest.builder()
                .userId(1L).title("X").message("Y").type(NotificationType.SYSTEM).build();

        assertThrows(UnauthorizedException.class, () ->
                notificationService.createNotification(trainerPrincipal, req));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void createNotification_RecipientNotFound() {
        NotificationCreateRequest req = NotificationCreateRequest.builder()
                .userId(999L).title("X").message("Y").type(NotificationType.SYSTEM).build();

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                notificationService.createNotification(adminPrincipal, req));
    }

    // =========================================================================
    // createSystemNotification (internal)
    // =========================================================================

    @Test
    void createSystemNotification_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(studentUser));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
            Notification n = invocation.getArgument(0);
            n.setId(777L);
            return n;
        });

        NotificationDto dto = notificationService.createSystemNotification(
                1L, "Payment Confirmation", "Thank you for your payment.",
                NotificationType.PAYMENT, "/student/membership");

        assertEquals(777L, dto.getId());
        assertEquals(NotificationType.PAYMENT, dto.getType());
        assertEquals(1L, dto.getUserId());
        assertFalse(dto.isRead());
    }

    // =========================================================================
    // getMyNotifications
    // =========================================================================

    @Test
    void getMyNotifications_AllMixed() {
        when(notificationRepository.findByUserIdWithUser(1L))
                .thenReturn(List.of(noteUnread2, noteUnread1, noteRead1));

        List<NotificationDto> list = notificationService.getMyNotifications(studentPrincipal);

        assertEquals(3, list.size());
        assertEquals(101L, list.get(0).getId());
    }

    // =========================================================================
    // getMyUnreadNotifications
    // =========================================================================

    @Test
    void getMyUnreadNotifications_OnlyUnread() {
        when(notificationRepository.findUnreadByUserIdWithUser(1L))
                .thenReturn(List.of(noteUnread2, noteUnread1));

        List<NotificationDto> list = notificationService.getMyUnreadNotifications(studentPrincipal);

        assertEquals(2, list.size());
        assertFalse(list.get(0).isRead());
        assertFalse(list.get(1).isRead());
    }

    // =========================================================================
    // countUnread
    // =========================================================================

    @Test
    void countUnread_ReturnsCount() {
        when(notificationRepository.countUnreadByUserId(1L)).thenReturn(2L);

        long count = notificationService.countUnread(studentPrincipal);

        assertEquals(2L, count);
    }

    // =========================================================================
    // markAsRead
    // =========================================================================

    @Test
    void markAsRead_Owner_Success() {
        when(notificationRepository.findById(100L)).thenReturn(Optional.of(noteUnread1));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationDto dto = notificationService.markAsRead(studentPrincipal, 100L);

        assertTrue(dto.isRead());
        assertEquals(100L, dto.getId());
    }

    @Test
    void markAsRead_AlreadyRead_NoOp() {
        when(notificationRepository.findById(102L)).thenReturn(Optional.of(noteRead1));

        NotificationDto dto = notificationService.markAsRead(studentPrincipal, 102L);

        assertTrue(dto.isRead());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAsRead_NonOwner_ThrowsUnauthorized() {
        when(notificationRepository.findById(100L)).thenReturn(Optional.of(noteUnread1));

        assertThrows(UnauthorizedException.class, () ->
                notificationService.markAsRead(trainerPrincipal, 100L));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAsRead_NotFound() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () ->
                notificationService.markAsRead(studentPrincipal, 999L));
    }

    // =========================================================================
    // markAllAsRead
    // =========================================================================

    @Test
    void markAllAsRead_ReturnsUpdatedCount() {
        when(notificationRepository.markAllAsReadByUserId(1L)).thenReturn(3);

        long updated = notificationService.markAllAsRead(studentPrincipal);

        assertEquals(3L, updated);
        verify(notificationRepository, times(1)).markAllAsReadByUserId(1L);
    }

    // =========================================================================
    // getUserNotificationsByAdmin
    // =========================================================================

    @Test
    void getUserNotificationsByAdmin_Success() {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(notificationRepository.findByUserIdWithUser(1L))
                .thenReturn(List.of(noteUnread1, noteRead1));

        List<NotificationDto> list = notificationService.getUserNotificationsByAdmin(adminPrincipal, 1L);

        assertEquals(2, list.size());
    }

    @Test
    void getUserNotificationsByAdmin_NonAdmin_ThrowsUnauthorized() {
        assertThrows(UnauthorizedException.class, () ->
                notificationService.getUserNotificationsByAdmin(studentPrincipal, 1L));
    }

    @Test
    void getUserNotificationsByAdmin_UserNotFound() {
        when(userRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () ->
                notificationService.getUserNotificationsByAdmin(adminPrincipal, 999L));
    }

    // =========================================================================
    // Enum parity (match schema ENUM)
    // =========================================================================

    @Test
    void enumValues_NotificationType_MatchSchemaEnum() {
        assertEquals(6, NotificationType.values().length);
        assertNotNull(NotificationType.valueOf("MEMBERSHIP"));
        assertNotNull(NotificationType.valueOf("PAYMENT"));
        assertNotNull(NotificationType.valueOf("WORKOUT"));
        assertNotNull(NotificationType.valueOf("ATTENDANCE"));
        assertNotNull(NotificationType.valueOf("COMPLAINT"));
        assertNotNull(NotificationType.valueOf("SYSTEM"));
    }
}
