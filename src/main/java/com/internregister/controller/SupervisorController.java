package com.internregister.controller;

import com.internregister.entity.Supervisor;
import com.internregister.service.SupervisorService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

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
    public Optional<Supervisor> getSupervisorById(@PathVariable Long id) {
        return supervisorService.getSupervisorById(id);
    }

    @PostMapping
    public Supervisor createSupervisor(@RequestBody Supervisor supervisor) {
        return supervisorService.saveSupervisor(supervisor);
    }

    @DeleteMapping("/{id}")
    public void deleteSupervisor(@PathVariable Long id) {
        supervisorService.deleteSupervisor(id);
    }
}
