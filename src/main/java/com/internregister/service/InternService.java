package com.internregister.service;

import com.internregister.dto.InternRequest;
import com.internregister.dto.InternResponse;
import com.internregister.entity.Department;
import com.internregister.entity.Intern;
import com.internregister.entity.Supervisor;
import com.internregister.repository.DepartmentRepository;
import com.internregister.repository.InternRepository;
import com.internregister.repository.SupervisorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InternService {

    private final InternRepository internRepository;
    private final DepartmentRepository departmentRepository;
    private final SupervisorRepository supervisorRepository;

    public InternService(InternRepository internRepository,
                         DepartmentRepository departmentRepository,
                         SupervisorRepository supervisorRepository) {
        this.internRepository = internRepository;
        this.departmentRepository = departmentRepository;
        this.supervisorRepository = supervisorRepository;
    }

    public List<InternResponse> getAllInterns() {
        return internRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Optional<Intern> getInternById(Long id) {
        return internRepository.findById(id);
    }

    public InternResponse createIntern(InternRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found: " + request.getDepartmentId()));
        Supervisor supervisor = supervisorRepository.findById(request.getSupervisorId())
                .orElseThrow(() -> new NotFoundException("Supervisor not found: " + request.getSupervisorId()));

        Intern intern = new Intern();
        intern.setName(request.getName());
        intern.setEmail(request.getEmail());
        intern.setDepartment(department);
        intern.setSupervisor(supervisor);
        
        Intern saved = internRepository.save(intern);
        
        System.out.println("✓ Intern saved to database with ID: " + saved.getInternId());
        System.out.println("  Name: " + saved.getName());
        System.out.println("  Email: " + saved.getEmail());
        System.out.println("  Created At: " + saved.getCreatedAt());
        
        return toResponse(saved);
    }

    public InternResponse updateIntern(Long id, InternRequest request) {
        Intern intern = internRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Intern not found with id: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found: " + request.getDepartmentId()));
        Supervisor supervisor = supervisorRepository.findById(request.getSupervisorId())
                .orElseThrow(() -> new NotFoundException("Supervisor not found: " + request.getSupervisorId()));

        intern.setName(request.getName());
        intern.setEmail(request.getEmail());
        intern.setDepartment(department);
        intern.setSupervisor(supervisor);
        Intern saved = internRepository.save(intern);
        return toResponse(saved);
    }

    public void deleteIntern(Long id) {
        internRepository.deleteById(id);
    }

    public Page<InternResponse> searchInterns(String name, Pageable pageable) {
        Page<Intern> result;
        if (name != null && !name.isBlank()) {
            result = internRepository.findByNameContainingIgnoreCase(name, pageable);
        } else {
            result = internRepository.findAll(pageable);
        }
        return result.map(this::toResponse);
    }

    private InternResponse toResponse(Intern intern) {
        InternResponse res = new InternResponse();
        res.setId(intern.getInternId());
        res.setName(intern.getName());
        res.setEmail(intern.getEmail());
        if (intern.getDepartment() != null) {
            res.setDepartmentId(intern.getDepartment().getDepartmentId());
            res.setDepartmentName(intern.getDepartment().getName());
        }
        if (intern.getSupervisor() != null) {
            res.setSupervisorId(intern.getSupervisor().getSupervisorId());
            res.setSupervisorName(intern.getSupervisor().getName());
        }
        return res;
    }
}
