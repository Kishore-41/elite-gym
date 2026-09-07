package com.elitegym.dto.publicinfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialDto {
    private Long id;
    private String memberName;
    private String roleOrPlan;
    private Integer rating;
    private String reviewText;
    private String avatarUrl;
    private boolean approved;
}
