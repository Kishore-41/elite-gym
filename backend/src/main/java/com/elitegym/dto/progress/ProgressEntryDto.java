package com.elitegym.dto.progress;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressEntryDto {

    private Long id;
    private Long studentId;
    private LocalDate recordDate;
    private BigDecimal weightKg;
    private BigDecimal heightCm;
    private BigDecimal bodyFatPct;
    private BigDecimal muscleMassKg;
    private BigDecimal chestCm;
    private BigDecimal waistCm;
    private BigDecimal hipsCm;
    private BigDecimal armCm;
    private BigDecimal thighCm;
    private String notes;
    private List<ProgressPhotoDto> photos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
