package com.elitegym.dto.trainer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignedStudentDto {

    private Long studentId;
    private Long userId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String bloodGroup;
    private String fitnessGoal;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private String medicalNotes;
    private String emergencyContact;
}
