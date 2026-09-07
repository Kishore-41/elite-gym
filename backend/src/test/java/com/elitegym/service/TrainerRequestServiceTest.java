package com.elitegym.service;

import com.elitegym.dto.trainer.*;
import com.elitegym.entity.*;
import com.elitegym.enums.RequestStatus;
import com.elitegym.enums.RequestType;
import com.elitegym.enums.RoleName;
import com.elitegym.exception.BadRequestException;
import com.elitegym.exception.ResourceNotFoundException;
import com.elitegym.exception.UnauthorizedException;
import com.elitegym.repository.StudentProfileRepository;
import com.elitegym.repository.TrainerProfileRepository;
import com.elitegym.repository.TrainerRequestRepository;
import com.elitegym.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrainerRequestServiceTest {

    @Mock
    private TrainerRequestRepository requestRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private TrainerProfileRepository trainerProfileRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private TrainerRequestService trainerRequestService;

    private User studentUser;
    private User trainerUser;
    private StudentProfile sampleStudent;
    private TrainerProfile sampleTrainer;
    private TrainerRequest sampleRequest;
    private UserPrincipal studentPrincipal;
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
                .build();

        trainerUser = User.builder()
                .id(2L)
                .email("trainer@elitegym.com")
                .username("jane_trainer")
                .firstName("Jane")
                .lastName("Smith")
                .role(RoleName.ROLE_TRAINER)
                .build();

        sampleStudent = StudentProfile.builder()
                .id(10L)
                .user(studentUser)
                .fitnessGoal("Muscle Gain")
                .build();

        sampleTrainer = TrainerProfile.builder()
                .id(20L)
                .user(trainerUser)
                .specialization("Strength Training")
                .experienceYears(5)
                .maxStudentCapacity(20)
                .isAvailable(true)
                .build();

        sampleRequest = TrainerRequest.builder()
                .id(100L)
                .student(sampleStudent)
                .trainer(sampleTrainer)
                .requestType(RequestType.TRAINER_ASSIGNMENT)
                .status(RequestStatus.PENDING)
                .requestNotes("Please assign me as your student.")
                .build();

        studentPrincipal = UserPrincipal.create(studentUser);
        trainerPrincipal = UserPrincipal.create(trainerUser);
    }

    @Test
    void createRequest_Success() {
        TrainerRequestCreateRequest request = TrainerRequestCreateRequest.builder()
                .trainerId(20L)
                .requestType(RequestType.TRAINER_ASSIGNMENT)
                .requestNotes("Want strength training guidance.")
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(trainerProfileRepository.findById(20L)).thenReturn(Optional.of(sampleTrainer));
        when(requestRepository.save(any(TrainerRequest.class))).thenAnswer(invocation -> {
            TrainerRequest r = invocation.getArgument(0);
            r.setId(101L);
            return r;
        });

        TrainerRequestDto created = trainerRequestService.createRequest(studentPrincipal, request);

        assertNotNull(created);
        assertEquals(101L, created.getId());
        assertEquals(RequestStatus.PENDING, created.getStatus());
        assertEquals(RequestType.TRAINER_ASSIGNMENT, created.getRequestType());
        assertEquals("John Doe", created.getStudentName());
        assertEquals("Jane Smith", created.getTrainerName());
    }

    @Test
    void createRequest_RejectUnavailableTrainer() {
        TrainerRequestCreateRequest request = TrainerRequestCreateRequest.builder()
                .trainerId(20L)
                .requestType(RequestType.TRAINER_ASSIGNMENT)
                .build();

        sampleTrainer.setIsAvailable(false);

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(trainerProfileRepository.findById(20L)).thenReturn(Optional.of(sampleTrainer));

        assertThrows(BadRequestException.class, () -> trainerRequestService.createRequest(studentPrincipal, request));
        verify(requestRepository, never()).save(any());
    }

    @Test
    void createRequest_TrainerNotFound() {
        TrainerRequestCreateRequest request = TrainerRequestCreateRequest.builder()
                .trainerId(999L)
                .requestType(RequestType.TRAINER_ASSIGNMENT)
                .build();

        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(trainerProfileRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> trainerRequestService.createRequest(studentPrincipal, request));
    }

    @Test
    void respondToRequest_Approve_Success() {
        TrainerRequestResponseRequest response = TrainerRequestResponseRequest.builder()
                .status(RequestStatus.APPROVED)
                .responseNotes("Happy to train you!")
                .build();

        when(trainerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(sampleTrainer));
        when(requestRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleRequest));
        when(studentProfileRepository.countByAssignedTrainerId(20L)).thenReturn(5L);
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(sampleStudent);
        when(requestRepository.save(any(TrainerRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrainerRequestDto result = trainerRequestService.respondToRequest(trainerPrincipal, 100L, response);

        assertNotNull(result);
        assertEquals(RequestStatus.APPROVED, result.getStatus());
        assertEquals("Happy to train you!", result.getResponseNotes());
        verify(studentProfileRepository, times(1)).save(any(StudentProfile.class));
    }

    @Test
    void respondToRequest_Reject_Success() {
        TrainerRequestResponseRequest response = TrainerRequestResponseRequest.builder()
                .status(RequestStatus.REJECTED)
                .responseNotes("I'm fully booked at the moment.")
                .build();

        when(trainerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(sampleTrainer));
        when(requestRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleRequest));
        when(requestRepository.save(any(TrainerRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TrainerRequestDto result = trainerRequestService.respondToRequest(trainerPrincipal, 100L, response);

        assertNotNull(result);
        assertEquals(RequestStatus.REJECTED, result.getStatus());
    }

    @Test
    void respondToRequest_RejectWrongTrainer() {
        User otherTrainerUser = User.builder().id(3L).role(RoleName.ROLE_TRAINER).build();
        TrainerProfile otherTrainer = TrainerProfile.builder().id(30L).user(otherTrainerUser).build();
        UserPrincipal otherTrainerPrincipal = UserPrincipal.create(otherTrainerUser);

        TrainerRequestResponseRequest response = TrainerRequestResponseRequest.builder()
                .status(RequestStatus.APPROVED)
                .build();

        when(trainerProfileRepository.findByUserId(3L)).thenReturn(Optional.of(otherTrainer));
        when(requestRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleRequest));

        assertThrows(UnauthorizedException.class, () ->
                trainerRequestService.respondToRequest(otherTrainerPrincipal, 100L, response));
        verify(requestRepository, never()).save(any());
    }

    @Test
    void respondToRequest_RejectAlreadyResolved() {
        sampleRequest.setStatus(RequestStatus.APPROVED);

        TrainerRequestResponseRequest response = TrainerRequestResponseRequest.builder()
                .status(RequestStatus.REJECTED)
                .build();

        when(trainerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(sampleTrainer));
        when(requestRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleRequest));

        assertThrows(BadRequestException.class, () ->
                trainerRequestService.respondToRequest(trainerPrincipal, 100L, response));
    }

    @Test
    void respondToRequest_RejectExceededCapacity() {
        TrainerRequestResponseRequest response = TrainerRequestResponseRequest.builder()
                .status(RequestStatus.APPROVED)
                .build();

        when(trainerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(sampleTrainer));
        when(requestRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleRequest));
        when(studentProfileRepository.countByAssignedTrainerId(20L)).thenReturn(20L);

        assertThrows(BadRequestException.class, () ->
                trainerRequestService.respondToRequest(trainerPrincipal, 100L, response));
    }

    @Test
    void getStudentRequests_Success() {
        when(studentProfileRepository.findByUserId(1L)).thenReturn(Optional.of(sampleStudent));
        when(requestRepository.findByStudentIdWithDetails(10L)).thenReturn(List.of(sampleRequest));

        List<TrainerRequestDto> requests = trainerRequestService.getStudentRequests(studentPrincipal, null);

        assertNotNull(requests);
        assertEquals(1, requests.size());
        assertEquals(100L, requests.get(0).getId());
    }

    @Test
    void getTrainerRequests_WithStatusFilter() {
        when(trainerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(sampleTrainer));
        when(requestRepository.findByTrainerIdAndStatus(20L, RequestStatus.PENDING)).thenReturn(List.of(sampleRequest));

        List<TrainerRequestDto> requests = trainerRequestService.getTrainerRequests(trainerPrincipal, RequestStatus.PENDING);

        assertNotNull(requests);
        assertEquals(1, requests.size());
    }

    @Test
    void getAssignedStudents_Success() {
        when(trainerProfileRepository.findByUserId(2L)).thenReturn(Optional.of(sampleTrainer));
        when(studentProfileRepository.findByAssignedTrainerIdWithUser(20L)).thenReturn(List.of(sampleStudent));

        List<AssignedStudentDto> students = trainerRequestService.getAssignedStudents(trainerPrincipal);

        assertNotNull(students);
        assertEquals(1, students.size());
        assertEquals("John Doe", students.get(0).getFullName());
        assertEquals(10L, students.get(0).getStudentId());
    }

    @Test
    void getAvailableTrainers_Success() {
        when(trainerProfileRepository.findByIsAvailableTrue()).thenReturn(List.of(sampleTrainer));
        when(studentProfileRepository.countByAssignedTrainerId(20L)).thenReturn(3L);

        List<TrainerProfileDto> trainers = trainerRequestService.getAvailableTrainers();

        assertNotNull(trainers);
        assertEquals(1, trainers.size());
        assertEquals("Jane Smith", trainers.get(0).getFullName());
        assertEquals("Strength Training", trainers.get(0).getSpecialization());
        assertEquals(3L, trainers.get(0).getCurrentStudentCount());
    }
}
