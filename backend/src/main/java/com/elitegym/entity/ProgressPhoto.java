package com.elitegym.entity;

import com.elitegym.enums.ProgressPhotoType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "progress_photos", indexes = {
    @Index(name = "idx_progress_photos_entry", columnList = "progress_entry_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "progress_entry_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_progress_photos_entry"))
    private ProgressEntry progressEntry;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl;

    @Column(length = 200)
    private String caption;

    @Enumerated(EnumType.STRING)
    @Column(name = "photo_type", nullable = false, length = 15)
    @Builder.Default
    private ProgressPhotoType photoType = ProgressPhotoType.PROGRESS;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
