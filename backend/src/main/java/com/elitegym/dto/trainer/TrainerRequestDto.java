package com.elitegym.dto.trainer;

import com.elitegym.enums.RequestStatus;
import com.elitegym.enums.RequestType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerRequestDto {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long trainerId;
    private String trainerName;
    private String trainerSpecialization;
    private RequestType requestType;
    private RequestStatus status;
    private String requestNotes;
    private String responseNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
