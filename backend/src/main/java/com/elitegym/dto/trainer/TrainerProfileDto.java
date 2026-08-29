package com.elitegym.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerProfileDto {

    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private Integer experienceYears;
    private String bio;
    private String certification;
    private Integer maxStudentCapacity;
    private Long currentStudentCount;
    private Boolean isAvailable;
}
