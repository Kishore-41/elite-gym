package com.elitegym.dto.publicinfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacilityDto {
    private Long id;
    private String name;
    private String category;
    private String description;
    private String rules;
    private Integer capacity;
    private String imageUrl;
    private String operationalHours;
    private boolean active;
}
