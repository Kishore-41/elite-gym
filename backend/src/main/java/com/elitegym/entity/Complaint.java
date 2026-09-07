package com.elitegym.entity;

import com.elitegym.enums.ComplaintCategory;
import com.elitegym.enums.ComplaintPriority;
import com.elitegym.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints", indexes = {
    @Index(name = "idx_complaints_student", columnList = "student_id"),
    @Index(name = "idx_complaints_user", columnList = "user_id"),
    @Index(name = "idx_complaints_status", columnList = "status"),
    @Index(name = "idx_complaints_category", columnList = "category"),
    @Index(name = "idx_complaints_target", columnList = "target_audience")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id", nullable = true, foreignKey = @ForeignKey(name = "fk_complaints_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "student_id", nullable = true, foreignKey = @ForeignKey(name = "fk_complaints_student"))
    private StudentProfile student;

    @Column(name = "submitter_name")
    private String submitterName;

    @Column(name = "submitter_email")
    private String submitterEmail;

    @Column(name = "target_audience", length = 50)
    @Builder.Default
    private String targetAudience = "OWNER_ONLY"; // OWNER_ONLY, GENERAL_MANAGER, HEAD_TRAINER

    @Column(nullable = false, length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ComplaintCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private ComplaintPriority priority = ComplaintPriority.MEDIUM;

    @Column(name = "is_anonymous", nullable = false)
    @Builder.Default
    private boolean isAnonymous = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "complaint_attachments", joinColumns = @JoinColumn(name = "complaint_id", foreignKey = @ForeignKey(name = "fk_complaint_attachments")))
    @Column(name = "attachment_url", length = 1000)
    @Builder.Default
    private List<String> attachmentUrls = new ArrayList<>();

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_id", foreignKey = @ForeignKey(name = "fk_complaints_resolved_by"))
    private User resolvedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_admin_id", foreignKey = @ForeignKey(name = "fk_complaints_admin"))
    private User resolvedByAdmin;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

