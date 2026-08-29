package com.elitegym.service;

import com.elitegym.dto.workout.*;
import com.elitegym.entity.*;
import com.elitegym.enums.RoleName;
import com.elitegym.enums.WorkoutDay;
import com.elitegym.enums.WorkoutDifficulty;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.TrainerProfileRepository;
import com.elitegym.repository.WorkoutExerciseRepository;
import com.elitegym.repository.WorkoutPlanRepository;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutPlanServiceTest {

    @Mock
    private WorkoutPlanRepository workoutPlanRepository;

    @Mock
    private WorkoutExerciseRepository workoutExerciseRepository;

    @Mock
    private TrainerProfileRepository trainerProfileRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @InjectMocks
    private WorkoutPlanService workoutPlanService;

    private User trainerUser;
    private User studentUser;
    private TrainerProfile sampleTrainer;
    private StudentProfile sampleStudent;
    private WorkoutPlan samplePlan;
    private WorkoutExercise sampleExercise;
    private UserPrincipal trainerPrincipal;
    private UserPrincipal studentPrincipal;

    @BeforeEach
    void setUp() {
        trainerUser = User.builder()
                .id(1L)
                .email("trainer@elitegym.com")
                .username("mike_trainer")
                .firstName("Mike")
                .lastName("Johnson")
                .role(RoleName.ROLE_TRAINER)
                .build();

        studentUser = User.builder()
                .id(2L)
                .email("student@elitegym.com")
                .username("sara_student")
                .firstName("Sara")
                .lastName("Williams")
                .role(RoleName.ROLE_STUDENT)
                .build();

        sampleTrainer = TrainerProfile.builder()
                .id(10L)
                .user(trainerUser)
                .specialization("Powerlifting")
                .build();

        sampleStudent = StudentProfile.builder()
                .id(20L)
                .user(studentUser)
                .fitnessGoal("Strength")
                .assignedTrainer(sampleTrainer)
                .build();

        samplePlan = WorkoutPlan.builder()
                .id(100L)
                .title("Beginner Strength 4-Week")
                .description("Introduction to compound lifts.")
                .trainer(sampleTrainer)
                .student(sampleStudent)
                .difficulty(WorkoutDifficulty.BEGINNER)
                .targetGoal("Strength Foundation")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusWeeks(4))
                .isActive(true)
                .exercises(new ArrayList<>())
                .build();

        sampleExercise = WorkoutExercise.builder()
                .id(1000L)
                .workoutPlan(samplePlan)
                .dayOfWeek(WorkoutDay.MONDAY)
                .exerciseName("Bench Press")
                .sets(4)
                .reps("8-10")
                .targetWeightKg(new BigDecimal("60.00"))
                .restSeconds(90)
                .orderIndex(1)
                .build();

        trainerPrincipal = UserPrincipal.create(trainerUser);
        studentPrincipal = UserPrincipal.create(studentUser);
    }

    @Test
    void createWorkoutPlan_Success_WithExercises() {
        WorkoutExerciseCreateRequest ex = WorkoutExerciseCreateRequest.builder()
                .dayOfWeek(WorkoutDay.MONDAY)
                .exerciseName("Squat")
                .sets(4)
                .reps("5")
                .targetWeightKg(new BigDecimal("80.00"))
                .restSeconds(120)
                .build();

        WorkoutPlanCreateRequest request = WorkoutPlanCreateRequest.builder()
                .title("Test Plan")
                .description("Desc")
                .difficulty(WorkoutDifficulty.INTERMEDIATE)
                .exercises(List.of(ex))
                .build();

        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(invocation -> {
            WorkoutPlan p = invocation.getArgument(0);
            p.setId(200L);
            return p;
        });

        WorkoutPlanDto created = workoutPlanService.createWorkoutPlan(trainerPrincipal, request);

        assertNotNull(created);
        assertEquals(200L, created.getId());
        assertEquals("Test Plan", created.getTitle());
        assertTrue(created.getIsTemplate());
        assertEquals(1, created.getExercises().size());
        assertEquals("Squat", created.getExercises().get(0).getExerciseName());
    }

    @Test
    void createWorkoutPlan_AssignedToStudent() {
        WorkoutPlanCreateRequest request = WorkoutPlanCreateRequest.builder()
                .title("Sara Custom Plan")
                .studentId(20L)
                .difficulty(WorkoutDifficulty.BEGINNER)
                .build();

        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        when(studentProfileRepository.findById(20L)).thenReturn(Optional.of(sampleStudent));
        when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(invocation -> {
            WorkoutPlan p = invocation.getArgument(0);
            p.setId(201L);
            return p;
        });

        WorkoutPlanDto created = workoutPlanService.createWorkoutPlan(trainerPrincipal, request);

        assertNotNull(created);
        assertFalse(created.getIsTemplate());
        assertEquals(20L, created.getStudentId());
        assertEquals("Sara Williams", created.getStudentName());
    }

    @Test
    void createWorkoutPlan_InvalidDates() {
        WorkoutPlanCreateRequest request = WorkoutPlanCreateRequest.builder()
                .title("Bad Dates Plan")
                .difficulty(WorkoutDifficulty.INTERMEDIATE)
                .startDate(LocalDate.now().plusDays(10))
                .endDate(LocalDate.now())
                .build();

        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));

        assertThrows(BadRequestException.class, () -> workoutPlanService.createWorkoutPlan(trainerPrincipal, request));
        verify(workoutPlanRepository, never()).save(any());
    }

    @Test
    void getTrainerWorkoutPlans_TemplatesOnly() {
        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        WorkoutPlan template = WorkoutPlan.builder()
                .id(300L).title("Template A").trainer(sampleTrainer)
                .difficulty(WorkoutDifficulty.BEGINNER).isActive(true).exercises(new ArrayList<>()).build();
        when(workoutPlanRepository.findTemplatesByTrainerId(10L)).thenReturn(List.of(template));

        List<WorkoutPlanDto> plans = workoutPlanService.getTrainerWorkoutPlans(trainerPrincipal, true);

        assertNotNull(plans);
        assertEquals(1, plans.size());
        assertEquals(300L, plans.get(0).getId());
    }

    @Test
    void getStudentWorkoutPlans_Success() {
        when(studentProfileRepository.findByUserId(2L)).thenReturn(Optional.of(sampleStudent));
        when(workoutPlanRepository.findActiveByStudentIdWithDetails(20L)).thenReturn(List.of(samplePlan));

        List<WorkoutPlanDto> plans = workoutPlanService.getStudentWorkoutPlans(studentPrincipal);

        assertNotNull(plans);
        assertEquals(1, plans.size());
        assertEquals(100L, plans.get(0).getId());
    }

    @Test
    void getStudentWorkoutPlanDetail_RejectInactive() {
        samplePlan.setIsActive(false);

        when(studentProfileRepository.findByUserId(2L)).thenReturn(Optional.of(sampleStudent));
        when(workoutPlanRepository.findByIdWithExercises(100L)).thenReturn(Optional.of(samplePlan));

        assertThrows(BadRequestException.class, () ->
                workoutPlanService.getStudentWorkoutPlanDetail(studentPrincipal, 100L));
    }

    @Test
    void getStudentWorkoutPlanDetail_RejectWrongStudent() {
        User otherStudentUser = User.builder().id(3L).role(RoleName.ROLE_STUDENT).build();
        StudentProfile otherStudent = StudentProfile.builder().id(30L).user(otherStudentUser).build();
        UserPrincipal otherPrincipal = UserPrincipal.create(otherStudentUser);

        when(studentProfileRepository.findByUserId(3L)).thenReturn(Optional.of(otherStudent));
        when(workoutPlanRepository.findByIdWithExercises(100L)).thenReturn(Optional.of(samplePlan));

        assertThrows(UnauthorizedException.class, () ->
                workoutPlanService.getStudentWorkoutPlanDetail(otherPrincipal, 100L));
    }

    @Test
    void updateWorkoutPlan_Success() {
        WorkoutPlanUpdateRequest request = WorkoutPlanUpdateRequest.builder()
                .title("Updated Plan Title")
                .description("Updated desc")
                .difficulty(WorkoutDifficulty.ADVANCED)
                .isActive(true)
                .build();

        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        when(workoutPlanRepository.findByIdWithExercises(100L)).thenReturn(Optional.of(samplePlan));
        when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutPlanDto updated = workoutPlanService.updateWorkoutPlan(trainerPrincipal, 100L, request);

        assertNotNull(updated);
        assertEquals("Updated Plan Title", updated.getTitle());
        assertEquals(WorkoutDifficulty.ADVANCED, updated.getDifficulty());
    }

    @Test
    void updateWorkoutPlan_UnauthorizedTrainer() {
        User otherTrainerUser = User.builder().id(4L).role(RoleName.ROLE_TRAINER).build();
        TrainerProfile otherTrainer = TrainerProfile.builder().id(40L).user(otherTrainerUser).build();
        UserPrincipal otherTrainerPrincipal = UserPrincipal.create(otherTrainerUser);

        WorkoutPlanUpdateRequest request = WorkoutPlanUpdateRequest.builder()
                .title("Hacker Title").difficulty(WorkoutDifficulty.BEGINNER).build();

        when(trainerProfileRepository.findByUserId(4L)).thenReturn(Optional.of(otherTrainer));
        when(workoutPlanRepository.findByIdWithExercises(100L)).thenReturn(Optional.of(samplePlan));

        assertThrows(UnauthorizedException.class, () ->
                workoutPlanService.updateWorkoutPlan(otherTrainerPrincipal, 100L, request));
    }

    @Test
    void deleteWorkoutPlan_Success() {
        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        when(workoutPlanRepository.findById(100L)).thenReturn(Optional.of(samplePlan));
        doNothing().when(workoutPlanRepository).delete(samplePlan);

        assertDoesNotThrow(() -> workoutPlanService.deleteWorkoutPlan(trainerPrincipal, 100L));
        verify(workoutPlanRepository, times(1)).delete(samplePlan);
    }

    @Test
    void assignPlanToStudent_Success() {
        WorkoutPlan templatePlan = WorkoutPlan.builder()
                .id(400L).title("Template").trainer(sampleTrainer)
                .difficulty(WorkoutDifficulty.BEGINNER).isActive(true).exercises(new ArrayList<>()).build();

        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        when(workoutPlanRepository.findByIdWithExercises(400L)).thenReturn(Optional.of(templatePlan));
        when(studentProfileRepository.findById(20L)).thenReturn(Optional.of(sampleStudent));
        when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutPlanDto result = workoutPlanService.assignPlanToStudent(trainerPrincipal, 400L, 20L);

        assertNotNull(result);
        assertEquals(20L, result.getStudentId());
        assertFalse(result.getIsTemplate());
    }

    @Test
    void addExercise_Success() {
        WorkoutExerciseCreateRequest request = WorkoutExerciseCreateRequest.builder()
                .dayOfWeek(WorkoutDay.TUESDAY)
                .exerciseName("Deadlift")
                .sets(5)
                .reps("3")
                .targetWeightKg(new BigDecimal("100.00"))
                .restSeconds(180)
                .build();

        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        when(workoutPlanRepository.findByIdWithExercises(100L)).thenReturn(Optional.of(samplePlan));
        when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutExerciseDto added = workoutPlanService.addExercise(trainerPrincipal, 100L, request);

        assertNotNull(added);
        assertEquals("Deadlift", added.getExerciseName());
        assertEquals(WorkoutDay.TUESDAY, added.getDayOfWeek());
    }

    @Test
    void removeExercise_Success() {
        samplePlan.getExercises().add(sampleExercise);

        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        when(workoutPlanRepository.findByIdWithExercises(100L)).thenReturn(Optional.of(samplePlan));
        when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> workoutPlanService.removeExercise(trainerPrincipal, 100L, 1000L));
    }

    @Test
    void removeExercise_NotFound() {
        when(trainerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleTrainer));
        when(workoutPlanRepository.findByIdWithExercises(100L)).thenReturn(Optional.of(samplePlan));

        assertThrows(ResourceNotFoundException.class, () ->
                workoutPlanService.removeExercise(trainerPrincipal, 100L, 9999L));
    }
}
