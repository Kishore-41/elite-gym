package com.elitegym.dto.publicinfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestPassDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String passCode;
    private LocalDate validDate;
    private String status;
    private String message;
}
