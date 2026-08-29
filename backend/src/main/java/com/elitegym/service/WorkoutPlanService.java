package com.elitegym.service;

import com.elitegym.dto.workout.*;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.TrainerProfile;
import com.elitegym.entity.WorkoutExercise;
import com.elitegym.entity.WorkoutPlan;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.TrainerProfileRepository;
import com.elitegym.repository.WorkoutExerciseRepository;
import com.elitegym.repository.WorkoutPlanRepository;
import com.elitegym.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final TrainerProfileRepository trainerProfileRepository;
    private final StudentProfileRepository studentProfileRepository;

    // =========================================================================
    // 1. TRAINER OPERATIONS - Workout Plans
    // =========================================================================

    @Transactional(readOnly = true)
    public List<WorkoutPlanDto> getTrainerWorkoutPlans(UserPrincipal principal, Boolean templatesOnly) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());
        List<WorkoutPlan> plans;
        if (Boolean.TRUE.equals(templatesOnly)) {
            plans = workoutPlanRepository.findTemplatesByTrainerId(trainer.getId());
        } else {
            plans = workoutPlanRepository.findByTrainerIdWithDetails(trainer.getId());
        }
        return plans.stream().map(this::mapToDtoWithExercises).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkoutPlanDto getWorkoutPlanById(UserPrincipal principal, Long planId) {
        WorkoutPlan plan = workoutPlanRepository.findByIdWithExercises(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));
        checkViewAccess(principal, plan);
        return mapToDtoWithExercises(plan);
    }

    @Transactional
    public WorkoutPlanDto createWorkoutPlan(UserPrincipal principal, WorkoutPlanCreateRequest request) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        validateDates(request.getStartDate(), request.getEndDate());

        WorkoutPlan plan = WorkoutPlan.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .trainer(trainer)
                .difficulty(request.getDifficulty())
                .targetGoal(request.getTargetGoal())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        if (request.getStudentId() != null) {
            StudentProfile student = studentProfileRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", request.getStudentId()));
            plan.setStudent(student);
        }

        if (request.getExercises() != null && !request.getExercises().isEmpty()) {
            int orderIdx = 0;
            for (WorkoutExerciseCreateRequest exReq : request.getExercises()) {
                WorkoutExercise exercise = buildExercise(exReq, orderIdx++);
                plan.addExercise(exercise);
            }
        }

        WorkoutPlan saved = workoutPlanRepository.save(plan);
        log.info("Trainer #{} created workout plan #{} '{}'", trainer.getId(), saved.getId(), saved.getTitle());
        return mapToDtoWithExercises(saved);
    }

    @Transactional
    public WorkoutPlanDto updateWorkoutPlan(UserPrincipal principal, Long planId, WorkoutPlanUpdateRequest request) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        WorkoutPlan plan = workoutPlanRepository.findByIdWithExercises(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        if (!plan.getTrainer().getId().equals(trainer.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this workout plan.");
        }

        validateDates(request.getStartDate(), request.getEndDate());

        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setDifficulty(request.getDifficulty());
        plan.setTargetGoal(request.getTargetGoal());
        plan.setStartDate(request.getStartDate());
        plan.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }

        if (request.getStudentId() != null) {
            StudentProfile student = studentProfileRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", request.getStudentId()));
            plan.setStudent(student);
        } else if (request.getStudentId() == null && plan.getStudent() != null) {
            plan.setStudent(null);
        }

        WorkoutPlan saved = workoutPlanRepository.save(plan);
        log.info("Trainer #{} updated workout plan #{}", trainer.getId(), planId);
        return mapToDtoWithExercises(saved);
    }

    @Transactional
    public void deleteWorkoutPlan(UserPrincipal principal, Long planId) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        if (!plan.getTrainer().getId().equals(trainer.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this workout plan.");
        }

        workoutPlanRepository.delete(plan);
        log.info("Trainer #{} deleted workout plan #{}", trainer.getId(), planId);
    }

    @Transactional
    public WorkoutPlanDto toggleWorkoutPlanStatus(UserPrincipal principal, Long planId, boolean active) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        if (!plan.getTrainer().getId().equals(trainer.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this workout plan.");
        }

        plan.setIsActive(active);
        WorkoutPlan saved = workoutPlanRepository.save(plan);
        log.info("Trainer #{} toggled workout plan #{} active={}", trainer.getId(), planId, active);
        return mapToDtoWithExercises(saved);
    }

    @Transactional
    public WorkoutPlanDto assignPlanToStudent(UserPrincipal principal, Long planId, Long studentId) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        WorkoutPlan plan = workoutPlanRepository.findByIdWithExercises(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        if (!plan.getTrainer().getId().equals(trainer.getId())) {
            throw new UnauthorizedException("You are not authorized to assign this workout plan.");
        }

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", studentId));

        plan.setStudent(student);
        WorkoutPlan saved = workoutPlanRepository.save(plan);
        log.info("Trainer #{} assigned workout plan #{} to student #{}", trainer.getId(), planId, studentId);
        return mapToDtoWithExercises(saved);
    }

    // =========================================================================
    // 2. TRAINER OPERATIONS - Workout Exercises
    // =========================================================================

    @Transactional(readOnly = true)
    public List<WorkoutExerciseDto> getPlanExercises(UserPrincipal principal, Long planId) {
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));
        checkViewAccess(principal, plan);

        return workoutExerciseRepository.findByWorkoutPlanId(planId).stream()
                .map(this::mapExerciseToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkoutExerciseDto addExercise(UserPrincipal principal, Long planId, WorkoutExerciseCreateRequest request) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        WorkoutPlan plan = workoutPlanRepository.findByIdWithExercises(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        if (!plan.getTrainer().getId().equals(trainer.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this workout plan.");
        }

        int nextOrder = plan.getExercises().size();
        if (request.getOrderIndex() != null && request.getOrderIndex() > 0) {
            nextOrder = request.getOrderIndex();
        }

        WorkoutExercise exercise = buildExercise(request, nextOrder);
        plan.addExercise(exercise);
        workoutPlanRepository.save(plan);

        WorkoutExercise saved = plan.getExercises().get(plan.getExercises().size() - 1);
        log.info("Trainer #{} added exercise to workout plan #{}", trainer.getId(), planId);
        return mapExerciseToDto(saved);
    }

    @Transactional
    public WorkoutExerciseDto updateExercise(UserPrincipal principal, Long planId, Long exerciseId, WorkoutExerciseUpdateRequest request) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        if (!plan.getTrainer().getId().equals(trainer.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this workout plan.");
        }

        WorkoutExercise exercise = workoutExerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutExercise", "id", exerciseId));

        if (!exercise.getWorkoutPlan().getId().equals(planId)) {
            throw new BadRequestException("Exercise does not belong to this workout plan.");
        }

        exercise.setDayOfWeek(request.getDayOfWeek());
        exercise.setExerciseName(request.getExerciseName());
        exercise.setSets(request.getSets());
        exercise.setReps(request.getReps());
        exercise.setTargetWeightKg(request.getTargetWeightKg());
        if (request.getRestSeconds() != null) {
            exercise.setRestSeconds(request.getRestSeconds());
        }
        exercise.setNotes(request.getNotes());
        if (request.getOrderIndex() != null) {
            exercise.setOrderIndex(request.getOrderIndex());
        }

        WorkoutExercise saved = workoutExerciseRepository.save(exercise);
        log.info("Trainer #{} updated exercise #{} in workout plan #{}", trainer.getId(), exerciseId, planId);
        return mapExerciseToDto(saved);
    }

    @Transactional
    public void removeExercise(UserPrincipal principal, Long planId, Long exerciseId) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        WorkoutPlan plan = workoutPlanRepository.findByIdWithExercises(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        if (!plan.getTrainer().getId().equals(trainer.getId())) {
            throw new UnauthorizedException("You are not authorized to modify this workout plan.");
        }

        WorkoutExercise exercise = plan.getExercises().stream()
                .filter(e -> e.getId().equals(exerciseId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutExercise", "id", exerciseId));

        plan.removeExercise(exercise);
        workoutPlanRepository.save(plan);
        log.info("Trainer #{} removed exercise #{} from workout plan #{}", trainer.getId(), exerciseId, planId);
    }

    // =========================================================================
    // 3. STUDENT OPERATIONS - View Workout Plans
    // =========================================================================

    @Transactional(readOnly = true)
    public List<WorkoutPlanDto> getStudentWorkoutPlans(UserPrincipal principal) {
        StudentProfile student = getStudentProfile(principal.getId());
        List<WorkoutPlan> plans = workoutPlanRepository.findActiveByStudentIdWithDetails(student.getId());
        return plans.stream().map(this::mapToDtoWithExercises).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkoutPlanDto getStudentWorkoutPlanDetail(UserPrincipal principal, Long planId) {
        StudentProfile student = getStudentProfile(principal.getId());

        WorkoutPlan plan = workoutPlanRepository.findByIdWithExercises(planId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        if (plan.getStudent() == null || !plan.getStudent().getId().equals(student.getId())) {
            throw new UnauthorizedException("You are not authorized to view this workout plan.");
        }

        if (Boolean.FALSE.equals(plan.getIsActive())) {
            throw new BadRequestException("This workout plan is no longer active.");
        }

        return mapToDtoWithExercises(plan);
    }

    // =========================================================================
    // 4. HELPER METHODS
    // =========================================================================

    private TrainerProfile getTrainerProfile(Long userId) {
        return trainerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("TrainerProfile", "userId", userId));
    }

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start != null && end != null && start.isAfter(end)) {
            throw new BadRequestException("Start date cannot be after end date.");
        }
    }

    private void checkViewAccess(UserPrincipal principal, WorkoutPlan plan) {
        String role = principal.getAuthorities().stream().findFirst()
                .orElseThrow(() -> new UnauthorizedException("User has no role")).getAuthority();

        switch (role) {
            case "ROLE_TRAINER":
                TrainerProfile trainer = getTrainerProfile(principal.getId());
                if (!plan.getTrainer().getId().equals(trainer.getId())) {
                    throw new UnauthorizedException("You are not authorized to view this workout plan.");
                }
                break;
            case "ROLE_STUDENT":
                if (plan.getStudent() == null ||
                        !plan.getStudent().getId().equals(getStudentProfile(principal.getId()).getId()) ||
                        Boolean.FALSE.equals(plan.getIsActive())) {
                    throw new UnauthorizedException("You are not authorized to view this workout plan.");
                }
                break;
            case "ROLE_ADMIN":
                break;
            default:
                throw new UnauthorizedException("Unknown role.");
        }
    }

    private WorkoutExercise buildExercise(WorkoutExerciseCreateRequest req, int orderIdx) {
        return WorkoutExercise.builder()
                .dayOfWeek(req.getDayOfWeek())
                .exerciseName(req.getExerciseName())
                .sets(req.getSets())
                .reps(req.getReps())
                .targetWeightKg(req.getTargetWeightKg())
                .restSeconds(req.getRestSeconds() != null ? req.getRestSeconds() : 60)
                .notes(req.getNotes())
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : orderIdx)
                .build();
    }

    private WorkoutExerciseDto mapExerciseToDto(WorkoutExercise ex) {
        return WorkoutExerciseDto.builder()
                .id(ex.getId())
                .dayOfWeek(ex.getDayOfWeek())
                .exerciseName(ex.getExerciseName())
                .sets(ex.getSets())
                .reps(ex.getReps())
                .targetWeightKg(ex.getTargetWeightKg())
                .restSeconds(ex.getRestSeconds())
                .notes(ex.getNotes())
                .orderIndex(ex.getOrderIndex())
                .build();
    }

    private WorkoutPlanDto mapToDtoWithExercises(WorkoutPlan plan) {
        String trainerName = (plan.getTrainer().getUser().getFirstName() + " " +
                plan.getTrainer().getUser().getLastName()).trim();

        String studentName = null;
        String studentEmail = null;
        Long studentId = null;
        if (plan.getStudent() != null) {
            studentId = plan.getStudent().getId();
            studentName = (plan.getStudent().getUser().getFirstName() + " " +
                    plan.getStudent().getUser().getLastName()).trim();
            studentEmail = plan.getStudent().getUser().getEmail();
        }

        List<WorkoutExerciseDto> exerciseDtos = plan.getExercises() != null
                ? plan.getExercises().stream().map(this::mapExerciseToDto).collect(Collectors.toList())
                : List.of();

        return WorkoutPlanDto.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .description(plan.getDescription())
                .trainerId(plan.getTrainer().getId())
                .trainerName(trainerName)
                .trainerSpecialization(plan.getTrainer().getSpecialization())
                .studentId(studentId)
                .studentName(studentName)
                .studentEmail(studentEmail)
                .difficulty(plan.getDifficulty())
                .targetGoal(plan.getTargetGoal())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .isActive(plan.getIsActive())
                .isTemplate(plan.isTemplate())
                .exercises(exerciseDtos)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
