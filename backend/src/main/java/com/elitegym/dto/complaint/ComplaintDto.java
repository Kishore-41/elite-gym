package com.elitegym.dto.complaint;

import com.elitegym.enums.ComplaintCategory;
import com.elitegym.enums.ComplaintPriority;
import com.elitegym.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintDto {

    private Long id;
    private Long studentId;
    private Long userId;
    private String studentName;
    private String studentEmail;
    private String submitterName;
    private String submitterEmail;
    private String targetAudience;
    private boolean isAnonymous;
    private String subject;
    private String description;
    private ComplaintCategory category;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private java.util.List<String> attachmentUrls;
    private String resolutionNotes;
    private String adminResponse;
    private Long resolvedByAdminId;
    private String resolvedByAdminName;
    private Long resolvedById;
    private String resolvedByName;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
