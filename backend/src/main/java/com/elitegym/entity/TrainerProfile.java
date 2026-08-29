package com.elitegym.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "trainer_profiles", uniqueConstraints = {
    @UniqueConstraint(name = "uk_trainer_profiles_user_id", columnNames = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_trainer_profiles_user"))
    private User user;

    @Column(nullable = false, length = 100)
    private String specialization;

    @Column(name = "experience_years", nullable = false)
    @Builder.Default
    private Integer experienceYears = 1;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 150)
    private String certification;

    @Column(name = "max_student_capacity", nullable = false)
    @Builder.Default
    private Integer maxStudentCapacity = 20;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
