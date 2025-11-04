package com.internregister.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDate;

@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long requestId;

    @Enumerated(EnumType.STRING)
    private LeaveType leaveType;
    private LocalDate fromDate;
    private LocalDate toDate;
    @Enumerated(EnumType.STRING)
    private LeaveStatus status;

    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }

    private String attachmentPath;

    @ManyToOne
    @JoinColumn(name = "intern_id")
    @ToString.Exclude
    @JsonBackReference
    private Intern intern;
}
