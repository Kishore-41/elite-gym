package com.elitegym.dto.publicinfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementDto {
    private Long id;
    private String title;
    private String description;
    private Integer yearAwarded;
    private String organization;
    private String badgeIconUrl;
}
