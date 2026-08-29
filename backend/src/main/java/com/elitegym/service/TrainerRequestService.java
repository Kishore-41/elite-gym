package com.elitegym.service;

import com.elitegym.dto.trainer.*;
import com.elitegym.entity.StudentProfile;
import com.elitegym.entity.TrainerProfile;
import com.elitegym.entity.TrainerRequest;
import com.elitegym.enums.RequestStatus;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.enums.RoleName;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.TrainerProfileRepository;
import com.elitegym.repository.TrainerRequestRepository;
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
public class TrainerRequestService {

    private final TrainerRequestRepository requestRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TrainerProfileRepository trainerProfileRepository;

    // =========================================================================
    // 1. STUDENT OPERATIONS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<TrainerRequestDto> getStudentRequests(UserPrincipal principal, RequestStatus status) {
        StudentProfile student = getStudentProfile(principal.getId());
        List<TrainerRequest> requests;
        if (status != null) {
            requests = requestRepository.findByStudentIdAndStatus(student.getId(), status);
        } else {
            requests = requestRepository.findByStudentIdWithDetails(student.getId());
        }
        return requests.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public TrainerRequestDto createRequest(UserPrincipal principal, TrainerRequestCreateRequest request) {
        StudentProfile student = getStudentProfile(principal.getId());

        TrainerProfile trainer = trainerProfileRepository.findById(request.getTrainerId())
                .orElseThrow(() -> new ResourceNotFoundException("TrainerProfile", "id", request.getTrainerId()));

        if (Boolean.FALSE.equals(trainer.getIsAvailable())) {
            throw new BadRequestException("Trainer is currently unavailable and cannot accept new requests.");
        }

        TrainerRequest trainerRequest = TrainerRequest.builder()
                .student(student)
                .trainer(trainer)
                .requestType(request.getRequestType())
                .status(RequestStatus.PENDING)
                .requestNotes(request.getRequestNotes())
                .build();

        TrainerRequest saved = requestRepository.save(trainerRequest);
        log.info("Student #{} created trainer request #{} to trainer #{}", student.getId(), saved.getId(), trainer.getId());
        return mapToDto(saved);
    }

    // =========================================================================
    // 2. TRAINER OPERATIONS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<TrainerRequestDto> getTrainerRequests(UserPrincipal principal, RequestStatus status) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());
        List<TrainerRequest> requests;
        if (status != null) {
            requests = requestRepository.findByTrainerIdAndStatus(trainer.getId(), status);
        } else {
            requests = requestRepository.findByTrainerIdWithDetails(trainer.getId());
        }
        return requests.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public TrainerRequestDto respondToRequest(UserPrincipal principal, Long requestId, TrainerRequestResponseRequest response) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());

        TrainerRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("TrainerRequest", "id", requestId));

        if (!request.getTrainer().getId().equals(trainer.getId())) {
            throw new UnauthorizedException("You are not authorized to respond to this request.");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("This request has already been " + request.getStatus() +
                    " and cannot be modified.");
        }

        if (response.getStatus() != RequestStatus.APPROVED && response.getStatus() != RequestStatus.REJECTED) {
            throw new BadRequestException("Response status must be either APPROVED or REJECTED.");
        }

        request.setStatus(response.getStatus());
        request.setResponseNotes(response.getResponseNotes());

        if (response.getStatus() == RequestStatus.APPROVED) {
            handleApprovalSideEffects(request);
        }

        TrainerRequest saved = requestRepository.save(request);
        log.info("Trainer #{} responded to request #{} with status {}", trainer.getId(), requestId, response.getStatus());
        return mapToDto(saved);
    }

    // =========================================================================
    // 3. ADMIN / PUBLIC - VIEW TRAINERS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<TrainerProfileDto> getAvailableTrainers() {
        List<TrainerProfile> trainers = trainerProfileRepository.findByIsAvailableTrue();
        return trainers.stream()
                .map(this::mapToTrainerProfileDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TrainerProfileDto> getAllTrainers() {
        List<TrainerProfile> trainers = trainerProfileRepository.findAll();
        return trainers.stream()
                .map(this::mapToTrainerProfileDto)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // 4. TRAINER ASSIGNED STUDENTS
    // =========================================================================

    @Transactional(readOnly = true)
    public List<AssignedStudentDto> getAssignedStudents(UserPrincipal principal) {
        TrainerProfile trainer = getTrainerProfile(principal.getId());
        List<StudentProfile> students = studentProfileRepository.findByAssignedTrainerIdWithUser(trainer.getId());
        return students.stream().map(this::mapToAssignedStudentDto).collect(Collectors.toList());
    }

    // =========================================================================
    // 5. HELPER METHODS
    // =========================================================================

    private StudentProfile getStudentProfile(Long userId) {
        return studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
    }

    private TrainerProfile getTrainerProfile(Long userId) {
        return trainerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("TrainerProfile", "userId", userId));
    }

    private void handleApprovalSideEffects(TrainerRequest request) {
        switch (request.getRequestType()) {
            case TRAINER_ASSIGNMENT:
                assignTrainerToStudent(request.getStudent(), request.getTrainer());
                break;
            case WORKOUT_CHANGE:
            case SLOT_BOOKING:
                break;
        }
    }

    private void assignTrainerToStudent(StudentProfile student, TrainerProfile trainer) {
        long currentCount = studentProfileRepository.countByAssignedTrainerId(trainer.getId());
        if (currentCount >= trainer.getMaxStudentCapacity()) {
            throw new BadRequestException("Trainer has reached maximum student capacity (" +
                    trainer.getMaxStudentCapacity() + "). Cannot assign more students.");
        }
        student.setAssignedTrainer(trainer);
        studentProfileRepository.save(student);
        log.info("Student #{} assigned to trainer #{}", student.getId(), trainer.getId());
    }

    private TrainerRequestDto mapToDto(TrainerRequest request) {
        String studentName = (request.getStudent().getUser().getFirstName() + " " +
                request.getStudent().getUser().getLastName()).trim();
        String trainerName = (request.getTrainer().getUser().getFirstName() + " " +
                request.getTrainer().getUser().getLastName()).trim();

        return TrainerRequestDto.builder()
                .id(request.getId())
                .studentId(request.getStudent().getId())
                .studentName(studentName)
                .studentEmail(request.getStudent().getUser().getEmail())
                .trainerId(request.getTrainer().getId())
                .trainerName(trainerName)
                .trainerSpecialization(request.getTrainer().getSpecialization())
                .requestType(request.getRequestType())
                .status(request.getStatus())
                .requestNotes(request.getRequestNotes())
                .responseNotes(request.getResponseNotes())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }

    private TrainerProfileDto mapToTrainerProfileDto(TrainerProfile trainer) {
        String fullName = (trainer.getUser().getFirstName() + " " +
                trainer.getUser().getLastName()).trim();
        long currentCount = studentProfileRepository.countByAssignedTrainerId(trainer.getId());

        return TrainerProfileDto.builder()
                .id(trainer.getId())
                .userId(trainer.getUser().getId())
                .firstName(trainer.getUser().getFirstName())
                .lastName(trainer.getUser().getLastName())
                .fullName(fullName)
                .email(trainer.getUser().getEmail())
                .phone(trainer.getUser().getPhone())
                .specialization(trainer.getSpecialization())
                .experienceYears(trainer.getExperienceYears())
                .bio(trainer.getBio())
                .certification(trainer.getCertification())
                .maxStudentCapacity(trainer.getMaxStudentCapacity())
                .currentStudentCount(currentCount)
                .isAvailable(trainer.getIsAvailable())
                .build();
    }

    private AssignedStudentDto mapToAssignedStudentDto(StudentProfile student) {
        String fullName = (student.getUser().getFirstName() + " " +
                student.getUser().getLastName()).trim();

        return AssignedStudentDto.builder()
                .studentId(student.getId())
                .userId(student.getUser().getId())
                .firstName(student.getUser().getFirstName())
                .lastName(student.getUser().getLastName())
                .fullName(fullName)
                .email(student.getUser().getEmail())
                .phone(student.getUser().getPhone())
                .bloodGroup(student.getBloodGroup())
                .fitnessGoal(student.getFitnessGoal())
                .heightCm(student.getHeightCm())
                .weightKg(student.getWeightKg())
                .medicalNotes(student.getMedicalNotes())
                .emergencyContact(student.getEmergencyContact())
                .build();
    }
}
