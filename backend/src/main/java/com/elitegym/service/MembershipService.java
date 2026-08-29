package com.elitegym.service;

import com.elitegym.dto.membership.*;
import com.elitegym.entity.MembershipPlan;
import com.elitegym.entity.StudentMembership;
import com.elitegym.entity.StudentProfile;
import com.elitegym.enums.MembershipStatus;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.repository.MembershipPlanRepository;
import com.elitegym.repository.StudentMembershipRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipService {

    private final MembershipPlanRepository planRepository;
    private final StudentMembershipRepository membershipRepository;
    private final StudentProfileRepository studentProfileRepository;

    // =========================================================================
    // 1. PUBLIC OPERATIONS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<MembershipPlanDto> getActivePlans() {
        return planRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToPlanDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MembershipPlanDto getPlanById(Long id) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", id));
        return mapToPlanDto(plan);
    }

    // =========================================================================
    // 2. STUDENT OPERATIONS
    // =========================================================================

    @Transactional
    public List<StudentMembershipDto> getStudentMemberships(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        refreshExpiredMemberships();
        return membershipRepository.findByStudentIdWithDetails(student.getId())
                .stream()
                .map(this::mapToStudentMembershipDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentMembershipDto getActiveStudentMembership(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        refreshExpiredMemberships();

        List<StudentMembership> activeList = membershipRepository.findActiveMembershipsByStudentId(
                student.getId(), MembershipStatus.ACTIVE, LocalDate.now());

        if (activeList.isEmpty()) {
            return null;
        }

        return mapToStudentMembershipDto(activeList.get(0));
    }

    @Transactional
    public StudentMembershipDto purchaseMembership(UserPrincipal principal, MembershipPurchaseRequest request) {
        StudentProfile student = getStudentProfile(principal.getId());

        MembershipPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", request.getPlanId()));

        if (Boolean.FALSE.equals(plan.getIsActive())) {
            throw new BadRequestException("Selected membership plan is currently inactive and cannot be purchased.");
        }

        // Check for conflicting active membership
        List<StudentMembership> activeList = membershipRepository.findActiveMembershipsByStudentId(
                student.getId(), MembershipStatus.ACTIVE, LocalDate.now());

        if (!activeList.isEmpty()) {
            StudentMembership currentActive = activeList.get(0);
            throw new BadRequestException("You already have an active membership for '" +
                    currentActive.getPlan().getName() + "' until " + currentActive.getEndDate() +
                    ". Please wait until it expires or contact management.");
        }

        LocalDate startDate = (request.getStartDate() != null && !request.getStartDate().isBefore(LocalDate.now()))
                ? request.getStartDate()
                : LocalDate.now();

        LocalDate endDate = startDate.plusMonths(plan.getDurationMonths());

        StudentMembership membership = StudentMembership.builder()
                .student(student)
                .plan(plan)
                .startDate(startDate)
                .endDate(endDate)
                .status(MembershipStatus.ACTIVE)
                .build();

        StudentMembership saved = membershipRepository.save(membership);
        log.info("Student #{} subscribed to plan '{}' with ID #{}", student.getId(), plan.getName(), saved.getId());

        return mapToStudentMembershipDto(saved);
    }

    // =========================================================================
    // 3. ADMIN OPERATIONS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<MembershipPlanDto> getAllPlans() {
        return planRepository.findAll()
                .stream()
                .map(this::mapToPlanDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MembershipPlanDto createPlan(MembershipPlanCreateRequest request) {
        if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Plan price must be strictly greater than 0.");
        }

        if (request.getDurationMonths() <= 0) {
            throw new BadRequestException("Plan duration must be at least 1 month.");
        }

        if (planRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("A membership plan with name '" + request.getName().trim() + "' already exists.");
        }

        MembershipPlan plan = MembershipPlan.builder()
                .name(request.getName().trim())
                .description(request.getDescription().trim())
                .durationMonths(request.getDurationMonths())
                .price(request.getPrice())
                .features(request.getFeatures() != null ? request.getFeatures() : List.of())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        MembershipPlan saved = planRepository.save(plan);
        log.info("Admin created new membership plan '{}' with ID #{}", saved.getName(), saved.getId());
        return mapToPlanDto(saved);
    }

    @Transactional
    public MembershipPlanDto updatePlan(Long id, MembershipPlanUpdateRequest request) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", id));

        if (request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Plan price must be strictly greater than 0.");
        }

        if (request.getDurationMonths() <= 0) {
            throw new BadRequestException("Plan duration must be at least 1 month.");
        }

        if (!plan.getName().equalsIgnoreCase(request.getName().trim()) &&
                planRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("A membership plan with name '" + request.getName().trim() + "' already exists.");
        }

        plan.setName(request.getName().trim());
        plan.setDescription(request.getDescription().trim());
        plan.setDurationMonths(request.getDurationMonths());
        plan.setPrice(request.getPrice());
        if (request.getFeatures() != null) {
            plan.setFeatures(request.getFeatures());
        }
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }

        MembershipPlan updated = planRepository.save(plan);
        log.info("Admin updated membership plan #{}", updated.getId());
        return mapToPlanDto(updated);
    }

    @Transactional
    public MembershipPlanDto togglePlanStatus(Long id, boolean active) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", id));

        plan.setIsActive(active);
        MembershipPlan updated = planRepository.save(plan);
        log.info("Admin toggled plan #{} active status to: {}", id, active);
        return mapToPlanDto(updated);
    }

    @Transactional
    public void deletePlan(Long id) {
        MembershipPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MembershipPlan", "id", id));

        if (membershipRepository.existsByPlanId(id)) {
            throw new BadRequestException("Cannot delete plan '" + plan.getName() +
                    "' because existing student memberships reference it. Please deactivate the plan instead.");
        }

        planRepository.delete(plan);
        log.info("Admin safely deleted membership plan #{}", id);
    }

    @Transactional
    public List<StudentMembershipDto> getAllMemberships(MembershipStatus status) {
        refreshExpiredMemberships();

        List<StudentMembership> list;
        if (status != null) {
            list = membershipRepository.findByStatusWithDetails(status);
        } else {
            list = membershipRepository.findAllWithDetails();
        }

        return list.stream().map(this::mapToStudentMembershipDto).collect(Collectors.toList());
    }

    @Transactional
    public StudentMembershipDto updateMembershipStatus(Long id, MembershipStatus status) {
        StudentMembership membership = membershipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentMembership", "id", id));

        membership.setStatus(status);
        StudentMembership updated = membershipRepository.save(membership);
        log.info("Admin updated membership #{} status to: {}", id, status);
        return mapToStudentMembershipDto(updated);
    }

    // =========================================================================
    // 4. HELPER METHODS & EXPIRY REFRESH
    // =========================================================================

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    private void refreshExpiredMemberships() {
        List<StudentMembership> expired = membershipRepository.findByEndDateBeforeAndStatus(
                LocalDate.now(), MembershipStatus.ACTIVE);
        for (StudentMembership m : expired) {
            m.setStatus(MembershipStatus.EXPIRED);
            membershipRepository.save(m);
        }
    }

    private MembershipPlanDto mapToPlanDto(MembershipPlan plan) {
        return MembershipPlanDto.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .durationMonths(plan.getDurationMonths())
                .price(plan.getPrice())
                .features(plan.getFeatures() != null ? plan.getFeatures() : List.of())
                .isActive(plan.getIsActive())
                .createdAt(plan.getCreatedAt())
                .build();
    }

    private StudentMembershipDto mapToStudentMembershipDto(StudentMembership membership) {
        LocalDate today = LocalDate.now();
        long daysRemaining = 0;
        if (membership.getStatus() == MembershipStatus.ACTIVE && !today.isAfter(membership.getEndDate())) {
            daysRemaining = ChronoUnit.DAYS.between(today, membership.getEndDate());
        }

        String studentName = (membership.getStudent().getUser().getFirstName() + " " +
                membership.getStudent().getUser().getLastName()).trim();

        return StudentMembershipDto.builder()
                .id(membership.getId())
                .studentId(membership.getStudent().getId())
                .studentName(studentName)
                .studentEmail(membership.getStudent().getUser().getEmail())
                .planId(membership.getPlan().getId())
                .planName(membership.getPlan().getName())
                .planPrice(membership.getPlan().getPrice())
                .durationMonths(membership.getPlan().getDurationMonths())
                .planFeatures(membership.getPlan().getFeatures() != null ? membership.getPlan().getFeatures() : List.of())
                .startDate(membership.getStartDate())
                .endDate(membership.getEndDate())
                .status(membership.getStatus())
                .daysRemaining(daysRemaining)
                .isCurrentlyActive(membership.isCurrentlyActive())
                .createdAt(membership.getCreatedAt())
                .build();
    }
}
