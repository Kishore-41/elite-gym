package com.elitegym.dto.publicinfo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityRequest {
    @NotBlank(message = "Facility name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category;

    private String description;
    private String rules;

    @NotNull(message = "Capacity is required")
    private Integer capacity;

    private String imageUrl;
    private String operationalHours;
    private Boolean active;
}
