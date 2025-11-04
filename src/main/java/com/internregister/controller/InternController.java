package com.internregister.controller;

import com.internregister.entity.Intern;
import com.internregister.entity.User;
import com.internregister.entity.Supervisor;
import com.internregister.service.InternService;
import com.internregister.dto.InternRequest;
import com.internregister.dto.InternResponse;
import com.internregister.repository.UserRepository;
import com.internregister.repository.InternRepository;
import com.internregister.repository.SupervisorRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/interns")
@CrossOrigin(origins = "*")
public class InternController {

    private final InternService internService;
    private final UserRepository userRepository;
    private final InternRepository internRepository;
    private final SupervisorRepository supervisorRepository;

    public InternController(InternService internService,
                           UserRepository userRepository,
                           InternRepository internRepository,
                           SupervisorRepository supervisorRepository) {
        this.internService = internService;
        this.userRepository = userRepository;
        this.internRepository = internRepository;
        this.supervisorRepository = supervisorRepository;
    }

    @GetMapping
    public List<InternResponse> getAllInterns() {
        return internService.getAllInterns();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Intern> getInternById(@PathVariable Long id) {
        return internService.getInternById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public Page<InternResponse> searchInterns(@RequestParam(required = false) String name,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return internService.searchInterns(name, pageable);
    }

    @PostMapping
    public InternResponse createIntern(@Valid @RequestBody InternRequest request) {
        System.out.println("✓ Creating new intern:");
        System.out.println("  Name: " + request.getName());
        System.out.println("  Email: " + request.getEmail());
        System.out.println("  Department ID: " + request.getDepartmentId());
        System.out.println("  Supervisor ID: " + request.getSupervisorId());
        
        InternResponse response = internService.createIntern(request);
        
        System.out.println("✓ Intern created and saved to database:");
        System.out.println("  Intern ID: " + response.getId());
        System.out.println("  Name: " + response.getName());
        System.out.println("  Department: " + response.getDepartmentName());
        
        return response;
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIntern(@PathVariable Long id, @Valid @RequestBody InternRequest request) {
        // Check authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        String role = user.getRole().name();

        // Check if intern exists
        Optional<Intern> internOpt = internRepository.findById(id);
        if (internOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Intern not found"));
        }

        Intern intern = internOpt.get();

        // Authorization: Admins can edit any intern, Supervisors can only edit their assigned interns
        if ("SUPERVISOR".equals(role)) {
            // Check if the supervisor is assigned to this intern
            Optional<Supervisor> supervisorOpt = supervisorRepository.findByEmail(username);
            if (supervisorOpt.isEmpty()) {
                return ResponseEntity.status(403).body(Map.of("error", "Supervisor profile not found"));
            }

            Supervisor supervisor = supervisorOpt.get();
            if (intern.getSupervisor() == null || !intern.getSupervisor().getSupervisorId().equals(supervisor.getSupervisorId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only edit interns assigned to you"));
            }
        } else if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Only admins and supervisors can update interns"));
        }

        try {
            InternResponse updated = internService.updateIntern(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update intern: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public void deleteIntern(@PathVariable Long id) {
        internService.deleteIntern(id);
    }
}
