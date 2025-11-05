package com.internregister.controller;

import com.internregister.entity.Supervisor;
import com.internregister.service.SupervisorService;
import com.internregister.dto.SupervisorRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/supervisors")
@CrossOrigin(origins = "*")
public class SupervisorController {

    private final SupervisorService supervisorService;

    public SupervisorController(SupervisorService supervisorService) {
        this.supervisorService = supervisorService;
    }

    @GetMapping
    public List<Supervisor> getAllSupervisors() {
        return supervisorService.getAllSupervisors();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supervisor> getSupervisorById(@PathVariable Long id) {
        return supervisorService.getSupervisorById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createSupervisor(@Valid @RequestBody SupervisorRequest request) {
        try {
            Supervisor supervisor = supervisorService.createSupervisor(request);
            return ResponseEntity.ok(supervisor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSupervisor(@PathVariable Long id, @Valid @RequestBody SupervisorRequest request) {
        try {
            Supervisor supervisor = supervisorService.updateSupervisor(id, request);
            return ResponseEntity.ok(supervisor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSupervisor(@PathVariable Long id) {
        try {
            supervisorService.deleteSupervisor(id);
            return ResponseEntity.ok().body(java.util.Map.of("message", "Supervisor deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
