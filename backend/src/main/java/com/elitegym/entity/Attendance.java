package com.elitegym.entity;

import com.elitegym.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendances", uniqueConstraints = {
    @UniqueConstraint(name = "uk_attendances_student_date", columnNames = {"student_id", "date"})
}, indexes = {
    @Index(name = "idx_attendances_date", columnList = "date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_attendances_student"))
    private StudentProfile student;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "check_in_time", nullable = false)
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by_admin_id",
            foreignKey = @ForeignKey(name = "fk_attendances_admin"))
    private User markedByAdmin;

    @Column(length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
