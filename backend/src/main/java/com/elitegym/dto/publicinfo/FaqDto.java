package com.elitegym.dto.publicinfo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqDto {
    private Long id;
    private String question;
    private String answer;
    private String category;
    private Integer displayOrder;
    private boolean active;
}
