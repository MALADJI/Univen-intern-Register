package com.internregister.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InternRequest {
    private String name;
    private String email;
    private Long departmentId;
    private Long supervisorId;
    private Long locationId;
    private String field;
    private String employer;
    private String idNumber;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
}

