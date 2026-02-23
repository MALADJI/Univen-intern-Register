package com.internregister.service;

import com.internregister.dto.InternRequest;
import com.internregister.dto.InternResponse;
import com.internregister.entity.Department;
import com.internregister.entity.Intern;
import com.internregister.entity.Location;
import com.internregister.entity.Supervisor;
import com.internregister.repository.DepartmentRepository;
import com.internregister.repository.InternRepository;
import com.internregister.repository.LocationRepository;
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
    private final LocationRepository locationRepository;

    public InternService(InternRepository internRepository,
                         DepartmentRepository departmentRepository,
                         SupervisorRepository supervisorRepository,
                         LocationRepository locationRepository) {
        this.internRepository = internRepository;
        this.departmentRepository = departmentRepository;
        this.supervisorRepository = supervisorRepository;
        this.locationRepository = locationRepository;
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
        
        // ✅ AUTOMATIC SUPERVISOR ASSIGNMENT
        Supervisor supervisor;
        if (request.getSupervisorId() != null) {
            // If supervisorId is provided, use it
            supervisor = supervisorRepository.findById(request.getSupervisorId())
                    .orElseThrow(() -> new NotFoundException("Supervisor not found: " + request.getSupervisorId()));
            System.out.println("✓ Using provided supervisor: " + supervisor.getName());
        } else {
            // Auto-assign supervisor based on department
            Optional<Supervisor> supervisorOpt = supervisorRepository.findFirstByDepartmentId(department.getDepartmentId());
            if (supervisorOpt.isPresent()) {
                supervisor = supervisorOpt.get();
                System.out.println("✓ Auto-assigned supervisor: " + supervisor.getName() + " (Department: " + department.getName() + ")");
            } else {
                // Create default supervisor if none exists
                Supervisor defaultSupervisor = new Supervisor();
                defaultSupervisor.setName("Default Supervisor - " + department.getName());
                String deptNameLower = department.getName().toLowerCase().replace(" ", "").replace("-", "");
                defaultSupervisor.setEmail("supervisor@" + deptNameLower + ".univen.ac.za");
                defaultSupervisor.setDepartment(department);
                supervisor = supervisorRepository.save(defaultSupervisor);
                System.out.println("✓ Created and assigned default supervisor: " + supervisor.getName() + " (Department: " + department.getName() + ")");
            }
        }

        Intern intern = new Intern();
        intern.setName(request.getName());
        intern.setEmail(request.getEmail());
        intern.setDepartment(department);
        intern.setSupervisor(supervisor);
        
        // Set field if provided
        if (request.getField() != null && !request.getField().trim().isEmpty()) {
            intern.setField(request.getField().trim());
            System.out.println("✓ Assigned field: " + intern.getField());
        }
        
        // Set employer if provided
        if (request.getEmployer() != null && !request.getEmployer().trim().isEmpty()) {
            intern.setEmployer(request.getEmployer().trim());
            System.out.println("✓ Assigned employer: " + intern.getEmployer());
        }
        
        // Set ID number if provided
        if (request.getIdNumber() != null && !request.getIdNumber().trim().isEmpty()) {
            intern.setIdNumber(request.getIdNumber().trim());
            System.out.println("✓ Assigned ID number: " + intern.getIdNumber());
        }
        
        // Set start date if provided
        if (request.getStartDate() != null) {
            intern.setStartDate(request.getStartDate());
            System.out.println("✓ Assigned start date: " + intern.getStartDate());
        }
        
        // Set end date if provided
        if (request.getEndDate() != null) {
            intern.setEndDate(request.getEndDate());
            System.out.println("✓ Assigned end date: " + intern.getEndDate());
        }
        
        // Handle location assignment if provided
        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new NotFoundException("Location not found: " + request.getLocationId()));
            intern.setLocation(location);
            System.out.println("✓ Assigned location: " + location.getName());
        }
        
        Intern saved = internRepository.save(intern);
        
        System.out.println("✓ Intern saved to database with ID: " + saved.getInternId());
        System.out.println("  Name: " + saved.getName());
        System.out.println("  Email: " + saved.getEmail());
        System.out.println("  Department: " + department.getName());
        System.out.println("  Supervisor: " + supervisor.getName());
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
        
        // Set field if provided
        if (request.getField() != null && !request.getField().trim().isEmpty()) {
            intern.setField(request.getField().trim());
        } else {
            // If field is null or empty, set to null
            intern.setField(null);
        }
        
        // Set employer if provided
        if (request.getEmployer() != null && !request.getEmployer().trim().isEmpty()) {
            intern.setEmployer(request.getEmployer().trim());
        } else {
            // If employer is null or empty, set to null
            intern.setEmployer(null);
        }
        
        // Set ID number if provided
        if (request.getIdNumber() != null && !request.getIdNumber().trim().isEmpty()) {
            intern.setIdNumber(request.getIdNumber().trim());
        } else {
            intern.setIdNumber(null);
        }
        
        // Set start date if provided
        if (request.getStartDate() != null) {
            intern.setStartDate(request.getStartDate());
        } else {
            intern.setStartDate(null);
        }
        
        // Set end date if provided
        if (request.getEndDate() != null) {
            intern.setEndDate(request.getEndDate());
        } else {
            intern.setEndDate(null);
        }
        
        // Handle location assignment
        if (request.getLocationId() != null) {
            Location location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new NotFoundException("Location not found: " + request.getLocationId()));
            intern.setLocation(location);
        } else {
            // If locationId is null, remove location assignment
            intern.setLocation(null);
        }
        
        Intern saved = internRepository.save(intern);
        return toResponse(saved);
    }

    public void deleteIntern(Long id) {
        internRepository.deleteById(id);
    }

    public void updateInternSignature(Intern intern) {
        internRepository.save(intern);
    }

    public InternResponse assignLocationToIntern(Long internId, Long locationId) {
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new NotFoundException("Intern not found with id: " + internId));
        
        if (locationId != null) {
            Location location = locationRepository.findById(locationId)
                    .orElseThrow(() -> new NotFoundException("Location not found: " + locationId));
            intern.setLocation(location);
        } else {
            intern.setLocation(null);
        }
        
        Intern saved = internRepository.save(intern);
        return toResponse(saved);
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
        if (intern.getLocation() != null) {
            res.setLocationId(intern.getLocation().getLocationId());
            res.setLocationName(intern.getLocation().getName());
        }
        // Include field and employer from intern entity
        res.setField(intern.getField());
        res.setEmployer(intern.getEmployer());
        res.setIdNumber(intern.getIdNumber());
        res.setStartDate(intern.getStartDate());
        res.setEndDate(intern.getEndDate());
        return res;
    }
}
