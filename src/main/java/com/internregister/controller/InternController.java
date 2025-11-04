package com.internregister.controller;

import com.internregister.entity.Intern;
import com.internregister.service.InternService;
import com.internregister.dto.InternRequest;
import com.internregister.dto.InternResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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

    public InternController(InternService internService) {
        this.internService = internService;
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
    public InternResponse updateIntern(@PathVariable Long id, @Valid @RequestBody InternRequest request) {
        return internService.updateIntern(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteIntern(@PathVariable Long id) {
        internService.deleteIntern(id);
    }
}
