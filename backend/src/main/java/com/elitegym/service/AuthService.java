package com.elitegym.service;

import com.elitegym.dto.auth.*;
import com.elitegym.entity.*;
import com.elitegym.enums.MembershipStatus;
import com.elitegym.enums.PaymentMethod;
import com.elitegym.enums.PaymentStatus;
import com.elitegym.enums.NotificationType;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.repository.*;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final MembershipPlanRepository planRepository;
    private final StudentMembershipRepository membershipRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse registerWithPlan(PlanPurchaseRequest request) {
        log.info("Processing guest-to-member checkout & registration for: {} on plan #{}", request.getEmail(), request.getPlanId());

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Email address is already registered.");
        }

        if (userRepository.existsByUsername(request.getUsername().trim().toLowerCase())) {
            throw new BadRequestException("Username is already taken.");
        }

        MembershipPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", request.getPlanId()));

        if (Boolean.FALSE.equals(plan.getIsActive())) {
            throw new BadRequestException("Selected membership plan is currently inactive.");
        }

        // 1. Create Base User
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

        // 2. Create Student Profile
        StudentProfile studentProfile = StudentProfile.builder()
                .user(savedUser)
                .emergencyContact(request.getEmergencyContact())
                .fitnessGoal(request.getFitnessGoal() != null ? request.getFitnessGoal() : "General Fitness & Health")
                .build();
        StudentProfile savedProfile = studentProfileRepository.save(studentProfile);

        // 3. Create Active Membership
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusMonths(plan.getDurationMonths());
        StudentMembership membership = StudentMembership.builder()
                .student(savedProfile)
                .plan(plan)
                .startDate(startDate)
                .endDate(endDate)
                .status(MembershipStatus.ACTIVE)
                .build();
        StudentMembership savedMembership = membershipRepository.save(membership);

        // 4. Record Payment Ledger
        String txId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String invoiceNumber = "INV-" + System.currentTimeMillis();
        Payment payment = Payment.builder()
                .student(savedProfile)
                .membership(savedMembership)
                .amount(plan.getPrice())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CREDIT_CARD)
                .transactionId(txId)
                .paymentStatus(PaymentStatus.SUCCESS)
                .invoiceNumber(invoiceNumber)
                .paidAt(LocalDateTime.now())
                .notes("Instant Online Enrollment - " + plan.getName())
                .build();
        paymentRepository.save(payment);

        // 5. Trigger Welcome Notification
        try {
            notificationService.createSystemNotification(
                    savedUser.getId(),
                    "Welcome to Elite Gym!",
                    "Your " + plan.getName() + " membership is active until " + endDate + ". Explore amenities and book your first session!",
                    NotificationType.MEMBERSHIP,
                    "/dashboard"
            );
        } catch (Exception e) {
            log.warn("Could not dispatch welcome notification: {}", e.getMessage());
        }

        // 6. Generate JWT and AuthResponse
        UserPrincipal principal = UserPrincipal.create(savedUser);
        String jwt = tokenProvider.generateTokenFromUserPrincipal(principal);

        log.info("Student #{} successfully enrolled with plan #{} (Invoice: {})", savedUser.getId(), plan.getId(), invoiceNumber);

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getExpirationDurationMs())
                .user(buildUserSummaryDto(savedUser, savedProfile.getId()))
                .build();
    }

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