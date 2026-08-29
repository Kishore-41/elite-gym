package com.elitegym.dto.trainer;

import com.elitegym.enums.RequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerRequestResponseRequest {

    @NotNull(message = "Status is required")
    private RequestStatus status;

    private String responseNotes;
}
