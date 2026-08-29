package com.elitegym.service;

import com.elitegym.dto.membership.*;
import com.elitegym.entity.MembershipPlan;
import com.elitegym.entity.StudentMembership;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.User;
import com.elitegym.enums.MembershipStatus;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.repository.MembershipPlanRepository;
import com.elitegym.repository.StudentMembershipRepository;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MembershipServiceTest {

    @Mock
    private MembershipPlanRepository planRepository;

    @Mock
    private StudentMembershipRepository membershipRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private MembershipService membershipService;

    private MembershipPlan samplePlan;
    private StudentProfile sampleStudent;
    private User sampleUser;
    private UserPrincipal studentPrincipal;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("student@elitegym.com")
                .username("alex_fit")
                .firstName("Alex")
                .lastName("Smith")
                .role(RoleName.ROLE_STUDENT)
                .build();

        sampleStudent = StudentProfile.builder()
                .id(10L)
                .user(sampleUser)
                .fitnessGoal("Hypertrophy")
                .build();

        studentPrincipal = UserPrincipal.create(sampleUser);

        samplePlan = MembershipPlan.builder()
                .id(100L)
                .name("Pro Quarterly")
                .description("3 months fitness plan")
                .durationMonths(3)
                .price(new BigDecimal("79.99"))
                .features(List.of("Sauna", "Custom Splits"))
                .isActive(true)
                .build();
    }

    @Test
    void createPlan_Success() {
        MembershipPlanCreateRequest request = MembershipPlanCreateRequest.builder()
                .name("Elite Annual")
                .description("12 months VIP plan")
                .durationMonths(12)
                .price(new BigDecimal("249.99"))
                .features(List.of("VIP Locker", "Trainer"))
                .isActive(true)
                .build();

        when(planRepository.existsByNameIgnoreCase("Elite Annual")).thenReturn(false);
        when(planRepository.save(any(MembershipPlan.class))).thenAnswer(invocation -> {
            MembershipPlan p = invocation.getArgument(0);
            p.setId(200L);
            return p;
        });

        MembershipPlanDto created = membershipService.createPlan(request);

        assertNotNull(created);
        assertEquals("Elite Annual", created.getName());
        assertEquals(new BigDecimal("249.99"), created.getPrice());
        assertEquals(12, created.getDurationMonths());
    }

    @Test
    void createPlan_RejectInvalidPrice() {
        MembershipPlanCreateRequest request = MembershipPlanCreateRequest.builder()
                .name("Free Trial")
                .description("Invalid zero price")
                .durationMonths(1)
                .price(BigDecimal.ZERO)
                .build();

        assertThrows(BadRequestException.class, () -> membershipService.createPlan(request));
        verify(planRepository, never()).save(any());
    }

    @Test
    void createPlan_RejectInvalidDuration() {
        MembershipPlanCreateRequest request = MembershipPlanCreateRequest.builder()
                .name("Zero Month Plan")
                .description("Invalid duration")
                .durationMonths(0)
                .price(new BigDecimal("10.00"))
                .build();

        assertThrows(BadRequestException.class, () -> membershipService.createPlan(request));
        verify(planRepository, never()).save(any());
    }

    @Test
    void getActivePlans_Success() {
        when(planRepository.findByIsActiveTrue()).thenReturn(List.of(samplePlan));

        List<MembershipPlanDto> plans = membershipService.getActivePlans();

        assertNotNull(plans);
        assertEquals(1, plans.size());
        assertEquals("Pro Quarterly", plans.get(0).getName());
    }

    @Test
    void purchaseMembership_Success() {
        MembershipPurchaseRequest request = MembershipPurchaseRequest.builder()
                .planId(100L)
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(planRepository.findById(100L)).thenReturn(Optional.of(samplePlan));
        when(membershipRepository.findActiveMembershipsByStudentId(eq(10L), eq(MembershipStatus.ACTIVE), any(LocalDate.class)))
                .thenReturn(Collections.emptyList());

        when(membershipRepository.save(any(StudentMembership.class))).thenAnswer(invocation -> {
            StudentMembership m = invocation.getArgument(0);
            m.setId(1000L);
            return m;
        });

        StudentMembershipDto result = membershipService.purchaseMembership(studentPrincipal, request);

        assertNotNull(result);
        assertEquals(1000L, result.getId());
        assertEquals("Pro Quarterly", result.getPlanName());
        assertEquals(MembershipStatus.ACTIVE, result.getStatus());
        assertEquals(LocalDate.now(), result.getStartDate());
        assertEquals(LocalDate.now().plusMonths(3), result.getEndDate());
    }

    @Test
    void purchaseMembership_RejectConflictingActiveMembership() {
        MembershipPurchaseRequest request = MembershipPurchaseRequest.builder()
                .planId(100L)
                .build();

        StudentMembership existingActive = StudentMembership.builder()
                .id(999L)
                .student(sampleStudent)
                .plan(samplePlan)
                .startDate(LocalDate.now().minusMonths(1))
                .endDate(LocalDate.now().plusMonths(2))
                .status(MembershipStatus.ACTIVE)
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(planRepository.findById(100L)).thenReturn(Optional.of(samplePlan));
        when(membershipRepository.findActiveMembershipsByStudentId(eq(10L), eq(MembershipStatus.ACTIVE), any(LocalDate.class)))
                .thenReturn(List.of(existingActive));

        assertThrows(BadRequestException.class, () -> membershipService.purchaseMembership(studentPrincipal, request));
        verify(membershipRepository, never()).save(any(StudentMembership.class));
    }

    @Test
    void purchaseMembership_RejectInactivePlan() {
        MembershipPurchaseRequest request = MembershipPurchaseRequest.builder()
                .planId(100L)
                .build();

        samplePlan.setIsActive(false);

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(planRepository.findById(100L)).thenReturn(Optional.of(samplePlan));

        assertThrows(BadRequestException.class, () -> membershipService.purchaseMembership(studentPrincipal, request));
        verify(membershipRepository, never()).save(any(StudentMembership.class));
    }

    @Test
    void deletePlan_RejectIfReferencedByMemberships() {
        when(planRepository.findById(100L)).thenReturn(Optional.of(samplePlan));
        when(membershipRepository.existsByPlanId(100L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> membershipService.deletePlan(100L));
        verify(planRepository, never()).delete(any(MembershipPlan.class));
    }
}
