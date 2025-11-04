package com.internregister.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Getter;
import lombok.Setter;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.util.List;

@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "interns")
public class Intern {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long internId;

    private String name;
    private String email;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "supervisor_id")
    private Supervisor supervisor;

    @OneToMany(mappedBy = "intern", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonManagedReference
    private List<Attendance> attendanceRecords;

    @OneToMany(mappedBy = "intern", cascade = CascadeType.ALL)
    @ToString.Exclude
    @JsonManagedReference
    private List<LeaveRequest> leaveRequests;

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
}
