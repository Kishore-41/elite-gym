package com.elitegym.service;

import com.elitegym.dto.auth.AuthResponse;
import com.elitegym.dto.auth.LoginRequest;
import com.elitegym.dto.auth.StudentRegisterRequest;
import com.elitegym.dto.auth.TrainerRegisterRequest;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.TrainerProfile;
import com.elitegym.entity.User;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.TrainerProfileRepository;
import com.elitegym.repository.UserRepository;
import com.elitegym.repository.MembershipPlanRepository;
import com.elitegym.repository.StudentMembershipRepository;
import com.elitegym.repository.PaymentRepository;
import com.elitegym.security.JwtTokenProvider;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TrainerProfileRepository trainerProfileRepository;

    @Mock
    private MembershipPlanRepository planRepository;

    @Mock
    private StudentMembershipRepository membershipRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private StudentRegisterRequest studentRequest;
    private TrainerRegisterRequest trainerRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        studentRequest = StudentRegisterRequest.builder()
                .email("student@elitegym.com")
                .username("alex_fit")
                .password("password123")
                .firstName("Alex")
                .lastName("Smith")
                .phone("+1234567890")
                .heightCm(new BigDecimal("180.5"))
                .weightKg(new BigDecimal("75.0"))
                .fitnessGoal("Hypertrophy")
                .build();

        trainerRequest = TrainerRegisterRequest.builder()
                .email("trainer@elitegym.com")
                .username("coach_john")
                .password("password123")
                .firstName("John")
                .lastName("Doe")
                .phone("+1987654321")
                .specialization("Strength & Conditioning")
                .experienceYears(5)
                .certification("CSCS Certified")
                .build();

        mockUser = User.builder()
                .id(1L)
                .email("student@elitegym.com")
                .username("alex_fit")
                .password("hashed_password")
                .firstName("Alex")
                .lastName("Smith")
                .role(RoleName.ROLE_STUDENT)
                .isActive(true)
                .build();
    }

    @Test
    void registerStudent_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        StudentProfile mockProfile = StudentProfile.builder()
                .id(10L)
                .user(mockUser)
                .fitnessGoal("Hypertrophy")
                .build();
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(mockProfile);
        when(tokenProvider.generateTokenFromUserPrincipal(any(UserPrincipal.class))).thenReturn("mock.jwt.token");
        when(tokenProvider.getExpirationDurationMs()).thenReturn(86400000L);

        AuthResponse response = authService.registerStudent(studentRequest);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getAccessToken());
        assertEquals("student@elitegym.com", response.getUser().getEmail());
        assertEquals(RoleName.ROLE_STUDENT, response.getUser().getRole());
        assertEquals(10L, response.getUser().getProfileId());

        verify(userRepository, times(1)).save(any(User.class));
        verify(studentProfileRepository, times(1)).save(any(StudentProfile.class));
    }

    @Test
    void registerStudent_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail("student@elitegym.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerStudent(studentRequest));

        verify(userRepository, never()).save(any(User.class));
        verify(studentProfileRepository, never()).save(any(StudentProfile.class));
    }

    @Test
    void registerStudent_DuplicateUsername_ThrowsException() {
        when(userRepository.existsByEmail("student@elitegym.com")).thenReturn(false);
        when(userRepository.existsByUsername("alex_fit")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerStudent(studentRequest));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerTrainer_Success() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");

        User trainerUser = User.builder()
                .id(2L)
                .email("trainer@elitegym.com")
                .username("coach_john")
                .role(RoleName.ROLE_TRAINER)
                .firstName("John")
                .lastName("Doe")
                .build();
        when(userRepository.save(any(User.class))).thenReturn(trainerUser);

        TrainerProfile trainerProfile = TrainerProfile.builder()
                .id(20L)
                .user(trainerUser)
                .specialization("Strength & Conditioning")
                .build();
        when(trainerProfileRepository.save(any(TrainerProfile.class))).thenReturn(trainerProfile);
        when(tokenProvider.generateTokenFromUserPrincipal(any(UserPrincipal.class))).thenReturn("mock.trainer.jwt");
        when(tokenProvider.getExpirationDurationMs()).thenReturn(86400000L);

        AuthResponse response = authService.registerTrainer(trainerRequest);

        assertNotNull(response);
        assertEquals("mock.trainer.jwt", response.getAccessToken());
        assertEquals(RoleName.ROLE_TRAINER, response.getUser().getRole());
        assertEquals(20L, response.getUser().getProfileId());

        verify(trainerProfileRepository, times(1)).save(any(TrainerProfile.class));
    }

    @Test
    void login_Success() {
        LoginRequest loginRequest = new LoginRequest("alex_fit", "password123");

        UserPrincipal principal = UserPrincipal.create(mockUser);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn("mock.login.jwt");
        when(tokenProvider.getExpirationDurationMs()).thenReturn(86400000L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        StudentProfile mockProfile = StudentProfile.builder().id(10L).user(mockUser).build();
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(mockProfile));

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock.login.jwt", response.getAccessToken());
        assertEquals("alex_fit", response.getUser().getUsername());
        assertEquals(10L, response.getUser().getProfileId());
    }
}
