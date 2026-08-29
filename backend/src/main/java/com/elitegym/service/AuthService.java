package com.elitegym.service;

import com.elitegym.dto.auth.*;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.TrainerProfile;
import com.elitegym.entity.User;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.TrainerProfileRepository;
import com.elitegym.repository.UserRepository;
import com.elitegym.security.JwtTokenProvider;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {
        log.info("Processing student registration for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email address is already registered.");
        }

        if (userRepository.existsByUsername(request.getUsername().trim().toLowerCase())) {
            throw new BadRequestException("Username is already taken.");
        }

        // 1. Create Base User entity
        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .username(request.getUsername().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .role(RoleName.ROLE_STUDENT)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // 2. Automatically create associated StudentProfile
        StudentProfile studentProfile = StudentProfile.builder()
                .user(savedUser)
                .emergencyContact(request.getEmergencyContact())
                .bloodGroup(request.getBloodGroup())
                .medicalNotes(request.getMedicalNotes())
                .heightCm(request.getHeightCm())
                .weightKg(request.getWeightKg())
                .fitnessGoal(request.getFitnessGoal())
                .build();

        StudentProfile savedProfile = studentProfileRepository.save(studentProfile);
        log.info("Student profile created successfully with ID: {}", savedProfile.getId());

        // 3. Generate JWT and build AuthResponse
        UserPrincipal principal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateTokenFromUserPrincipal(principal);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationDurationMs())
                .user(buildUserSummaryDto(savedUser, savedProfile.getId()))
                .build();
    }

    @Transactional
    public AuthResponse registerTrainer(TrainerRegisterRequest request) {
        log.info("Processing trainer registration for email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email address is already registered.");
        }

        if (userRepository.existsByUsername(request.getUsername().trim().toLowerCase())) {
            throw new BadRequestException("Username is already taken.");
        }

        // 1. Create Base User entity
        User user = User.builder()
                .email(request.getEmail().trim().toLowerCase())
                .username(request.getUsername().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone())
                .role(RoleName.ROLE_TRAINER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // 2. Automatically create associated TrainerProfile
        TrainerProfile trainerProfile = TrainerProfile.builder()
                .user(savedUser)
                .specialization(request.getSpecialization().trim())
                .experienceYears(request.getExperienceYears())
                .bio(request.getBio())
                .certification(request.getCertification())
                .maxStudentCapacity(20)
                .isAvailable(true)
                .build();

        TrainerProfile savedProfile = trainerProfileRepository.save(trainerProfile);
        log.info("Trainer profile created successfully with ID: {}", savedProfile.getId());

        // 3. Generate JWT and build AuthResponse
        UserPrincipal principal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateTokenFromUserPrincipal(principal);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationDurationMs())
                .user(buildUserSummaryDto(savedUser, savedProfile.getId()))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim().toLowerCase();
        log.info("Authenticating user: {}", identifier);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        Long profileId = resolveProfileId(user);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationDurationMs())
                .user(buildUserSummaryDto(user, profileId))
                .build();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));

        Long profileId = resolveProfileId(user);
        return buildUserSummaryDto(user, profileId);
    }

    private Long resolveProfileId(User user) {
        if (user.getRole() == RoleName.ROLE_STUDENT) {
            return studentProfileRepository.findByUserId(user.getId())
                    .map(StudentProfile::getId)
                    .orElse(null);
        } else if (user.getRole() == RoleName.ROLE_TRAINER) {
            return trainerProfileRepository.findByUserId(user.getId())
                    .map(TrainerProfile::getId)
                    .orElse(null);
        }
        return null;
    }

    private UserSummaryDto buildUserSummaryDto(User user, Long profileId) {
        return UserSummaryDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .profileId(profileId)
                .build();
    }
}
