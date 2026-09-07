package com.elitegym.dto.publicinfo;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private Integer yearAwarded;
    private String organization;
    private String badgeIconUrl;
}
