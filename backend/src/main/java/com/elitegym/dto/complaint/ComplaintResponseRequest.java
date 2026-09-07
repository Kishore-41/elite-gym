package com.elitegym.dto.complaint;

import com.elitegym.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponseRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    private String adminResponse;
    private String resolutionNotes;
}
