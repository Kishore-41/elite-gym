package com.elitegym.dto.progress;

import com.elitegym.enums.ProgressPhotoType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressPhotoDto {

    private Long id;
    private String photoUrl;
    private String caption;
    private ProgressPhotoType photoType;
    private LocalDateTime createdAt;
}
