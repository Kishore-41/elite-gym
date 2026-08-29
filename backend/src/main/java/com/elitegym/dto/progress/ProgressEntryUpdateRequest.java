package com.elitegym.dto.progress;

import com.elitegym.enums.ProgressPhotoType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressEntryUpdateRequest {

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;

    @DecimalMin(value = "20.0", message = "Weight must be at least 20 kg")
    @DecimalMax(value = "500.0", message = "Weight must be at most 500 kg")
    private BigDecimal weightKg;

    @DecimalMin(value = "100.0", message = "Height must be at least 100 cm")
    @DecimalMax(value = "250.0", message = "Height must be at most 250 cm")
    private BigDecimal heightCm;

    @DecimalMin(value = "2.0", message = "Body fat % must be at least 2")
    @DecimalMax(value = "70.0", message = "Body fat % must be at most 70")
    private BigDecimal bodyFatPct;

    @DecimalMin(value = "10.0", message = "Muscle mass must be at least 10 kg")
    @DecimalMax(value = "300.0", message = "Muscle mass must be at most 300 kg")
    private BigDecimal muscleMassKg;

    @DecimalMin(value = "30.0", message = "Chest must be at least 30 cm")
    @DecimalMax(value = "300.0", message = "Chest must be at most 300 cm")
    private BigDecimal chestCm;

    @DecimalMin(value = "30.0", message = "Waist must be at least 30 cm")
    @DecimalMax(value = "300.0", message = "Waist must be at most 300 cm")
    private BigDecimal waistCm;

    @DecimalMin(value = "30.0", message = "Hips must be at least 30 cm")
    @DecimalMax(value = "300.0", message = "Hips must be at most 300 cm")
    private BigDecimal hipsCm;

    @DecimalMin(value = "10.0", message = "Arm must be at least 10 cm")
    @DecimalMax(value = "150.0", message = "Arm must be at most 150 cm")
    private BigDecimal armCm;

    @DecimalMin(value = "20.0", message = "Thigh must be at least 20 cm")
    @DecimalMax(value = "200.0", message = "Thigh must be at most 200 cm")
    private BigDecimal thighCm;

    @Size(max = 2000, message = "Notes must be at most 2000 characters")
    private String notes;

    @Valid
    private List<ProgressEntryCreateRequest.PhotoItem> photos;
}
