package com.internregister.service;

import com.internregister.dto.SupervisorRequest;
import com.internregister.entity.Supervisor;
import com.internregister.entity.Department;
import com.internregister.repository.SupervisorRepository;
import com.internregister.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupervisorService {

    private final SupervisorRepository supervisorRepository;
    private final DepartmentRepository departmentRepository;

    public SupervisorService(SupervisorRepository supervisorRepository, 
                           DepartmentRepository departmentRepository) {
        this.supervisorRepository = supervisorRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<Supervisor> getAllSupervisors() {
        return supervisorRepository.findAll();
    }

    public Optional<Supervisor> getSupervisorById(Long id) {
        return supervisorRepository.findById(id);
    }

    public Supervisor saveSupervisor(Supervisor supervisor) {
        return supervisorRepository.save(supervisor);
    }

    public Supervisor updateSupervisor(Long id, SupervisorRequest request) {
        Supervisor supervisor = supervisorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Supervisor not found with id: " + id));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found: " + request.getDepartmentId()));

        supervisor.setName(request.getName());
        supervisor.setEmail(request.getEmail());
        supervisor.setDepartment(department);
        
        return supervisorRepository.save(supervisor);
    }

    public void deleteSupervisor(Long id) {
        supervisorRepository.deleteById(id);
    }
}
