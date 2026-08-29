package com.elitegym.dto.trainer;

import com.elitegym.enums.RequestType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerRequestCreateRequest {

    @NotNull(message = "Trainer ID is required")
    private Long trainerId;

    @NotNull(message = "Request type is required")
    private RequestType requestType;

    private String requestNotes;
}
