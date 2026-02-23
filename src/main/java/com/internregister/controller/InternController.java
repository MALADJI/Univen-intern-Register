package com.internregister.controller;

import com.internregister.entity.Intern;
import com.internregister.entity.Location;
import com.internregister.entity.User;
import com.internregister.entity.Admin;
import com.internregister.service.InternService;
import com.internregister.dto.InternRequest;
import com.internregister.dto.InternResponse;
import com.internregister.service.WebSocketService;
import com.internregister.util.SecurityUtil;
import com.internregister.repository.AdminRepository;
import com.internregister.repository.LocationRepository;
import com.internregister.repository.SupervisorRepository;
import com.internregister.entity.Supervisor;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Base64;

@RestController
@RequestMapping("/api/interns")
@CrossOrigin(origins = "*")
public class InternController {

    private final InternService internService;
    private final SecurityUtil securityUtil;
    private final AdminRepository adminRepository;
    private final LocationRepository locationRepository;
    private final WebSocketService webSocketService;
    private final SupervisorRepository supervisorRepository;

    public InternController(InternService internService,
            SecurityUtil securityUtil,
            AdminRepository adminRepository,
            LocationRepository locationRepository,
            WebSocketService webSocketService,
            SupervisorRepository supervisorRepository) {
        this.internService = internService;
        this.securityUtil = securityUtil;
        this.adminRepository = adminRepository;
        this.locationRepository = locationRepository;
        this.webSocketService = webSocketService;
        this.supervisorRepository = supervisorRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllInterns() {
        try {
            // Get current authenticated user
            Optional<User> currentUserOpt = securityUtil.getCurrentUser();
            if (currentUserOpt.isEmpty()) {
                // If not authenticated, return all interns (for backward compatibility)
                return ResponseEntity.ok(internService.getAllInterns());
            }

            User currentUser = currentUserOpt.get();
            List<InternResponse> allInterns = internService.getAllInterns();

            // If user is ADMIN, filter by their department
            if (currentUser.getRole() == User.Role.ADMIN) {
                Optional<Admin> adminOpt = adminRepository.findByEmail(currentUser.getEmail());
                if (adminOpt.isPresent() && adminOpt.get().getDepartment() != null) {
                    Long adminDepartmentId = adminOpt.get().getDepartment().getDepartmentId();
                    // Filter interns by admin's department
                    List<InternResponse> filteredInterns = allInterns.stream()
                            .filter(intern -> intern.getDepartmentId() != null &&
                                    intern.getDepartmentId().equals(adminDepartmentId))
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(filteredInterns);
                }
            }

            // If user is SUPERVISOR, filter by their department/assignment
            if (currentUser.getRole() == User.Role.SUPERVISOR) {
                Optional<Supervisor> supervisorOpt = supervisorRepository.findByEmail(currentUser.getEmail());
                if (supervisorOpt.isPresent()) {
                    Supervisor supervisor = supervisorOpt.get();
                    Long deptId = supervisor.getDepartment() != null ? supervisor.getDepartment().getDepartmentId()
                            : null;

                    // Filter interns:
                    // 1. Must be in same department
                    // 2. OR Must be explicitly assigned to this supervisor
                    List<InternResponse> filteredInterns = allInterns.stream()
                            .filter(intern -> {
                                boolean sameDept = deptId != null && intern.getDepartmentId() != null
                                        && intern.getDepartmentId().equals(deptId);
                                boolean assigned = intern.getSupervisorId() != null
                                        && intern.getSupervisorId().equals(supervisor.getSupervisorId());
                                return sameDept || assigned;
                            })
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(filteredInterns);
                }
            }

            // For SUPER_ADMIN - return all interns
            return ResponseEntity.ok(allInterns);
        } catch (Exception e) {
            e.printStackTrace();
            // On error, return all interns (for backward compatibility)
            return ResponseEntity.ok(internService.getAllInterns());
        }
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

        // Broadcast real-time update
        webSocketService.broadcastInternUpdate("CREATED", response);

        return response;
    }

    @PutMapping("/{id}")
    public InternResponse updateIntern(@PathVariable Long id, @Valid @RequestBody InternRequest request) {
        InternResponse response = internService.updateIntern(id, request);

        // Broadcast real-time update
        webSocketService.broadcastInternUpdate("UPDATED", response);

        return response;
    }

    @DeleteMapping("/{id}")
    public void deleteIntern(@PathVariable Long id) {
        internService.deleteIntern(id);

        // Broadcast real-time update
        webSocketService.broadcastInternUpdate("DELETED", Map.of("internId", id));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateIntern(@PathVariable Long id) {
        Optional<Intern> internOpt = internService.getInternById(id);
        if (internOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // Activation logic - for now just return success
        // In production, you might want to add an 'active' field to Intern entity
        return ResponseEntity.ok(Map.of("message", "Intern activated successfully"));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateIntern(@PathVariable Long id) {
        Optional<Intern> internOpt = internService.getInternById(id);
        if (internOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        // Deactivation logic - for now just return success
        // In production, you might want to add an 'active' field to Intern entity
        return ResponseEntity.ok(Map.of("message", "Intern deactivated successfully"));
    }

    /**
     * Save intern signature (Base64 string → byte[])
     * POST /api/interns/{id}/signature
     */
    @PutMapping("/{id}/signature")
    public ResponseEntity<?> saveInternSignature(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Optional<Intern> internOpt = internService.getInternById(id);
            if (internOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Intern not found"));
            }

            Intern intern = internOpt.get();
            String signatureBase64 = body.get("signature");

            if (signatureBase64 == null || signatureBase64.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Signature is required"));
            }

            // Remove data URL prefix if present (e.g., "data:image/png;base64,")
            String base64Data = signatureBase64;
            if (base64Data.contains(",")) {
                base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
            }

            // Convert Base64 string to byte[]
            try {
                byte[] signatureBytes = Base64.getDecoder().decode(base64Data);
                intern.setSignature(signatureBytes);
                internService.updateInternSignature(intern);

                System.out.println(
                        "✅ Signature saved for intern ID: " + id + " (Size: " + signatureBytes.length + " bytes)");

                Map<String, Object> result = Map.of(
                        "message", "Signature saved successfully",
                        "hasSignature", true,
                        "size", signatureBytes.length,
                        "internId", id);

                // Broadcast real-time update
                webSocketService.broadcastInternUpdate("SIGNATURE_UPDATED", result);

                return ResponseEntity.ok(result);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid Base64 signature format"));
            }
        } catch (Exception e) {
            System.err.println("❌ Error saving intern signature: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save signature: " + e.getMessage()));
        }
    }

    /**
     * Get intern signature (byte[] → Base64)
     * GET /api/interns/{id}/signature
     */
    @GetMapping("/{id}/signature")
    public ResponseEntity<?> getInternSignature(@PathVariable Long id) {
        try {
            Optional<Intern> internOpt = internService.getInternById(id);
            if (internOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Intern not found"));
            }

            Intern intern = internOpt.get();
            if (intern.getSignature() == null || intern.getSignature().length == 0) {
                return ResponseEntity.ok(Map.of(
                        "hasSignature", false,
                        "signature", ""));
            }

            // Convert byte[] to Base64 string
            String signatureBase64 = Base64.getEncoder().encodeToString(intern.getSignature());

            return ResponseEntity.ok(Map.of(
                    "hasSignature", true,
                    "signature", "data:image/png;base64," + signatureBase64));
        } catch (Exception e) {
            System.err.println("❌ Error retrieving intern signature: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to retrieve signature: " + e.getMessage()));
        }
    }

    /**
     * Get intern signature as binary image (for direct image display)
     * GET /api/interns/{id}/signature/image
     */
    @GetMapping("/{id}/signature/image")
    public ResponseEntity<byte[]> getInternSignatureImage(@PathVariable Long id) {
        try {
            Optional<Intern> internOpt = internService.getInternById(id);
            if (internOpt.isEmpty()) {
                return ResponseEntity.status(404).build();
            }

            Intern intern = internOpt.get();
            if (intern.getSignature() == null || intern.getSignature().length == 0) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(intern.getSignature().length);
            headers.set("Content-Disposition", "inline; filename=\"signature.png\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(intern.getSignature());
        } catch (Exception e) {
            System.err.println("❌ Error retrieving intern signature image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Assign location to intern
     * PUT /api/interns/{id}/location
     */
    @PutMapping("/{id}/location")
    public ResponseEntity<?> assignLocationToIntern(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Optional<Intern> internOpt = internService.getInternById(id);
            if (internOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Intern not found"));
            }

            Object locationIdObj = body.get("locationId");
            Long locationId = null;

            if (locationIdObj != null) {
                if (locationIdObj instanceof Number) {
                    locationId = ((Number) locationIdObj).longValue();
                } else if (locationIdObj instanceof String) {
                    try {
                        locationId = Long.parseLong((String) locationIdObj);
                    } catch (NumberFormatException e) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Invalid locationId format"));
                    }
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Invalid locationId format"));
                }

                // Verify location exists if locationId is provided
                Optional<Location> locationOpt = locationRepository.findById(locationId);
                if (locationOpt.isEmpty()) {
                    return ResponseEntity.status(404).body(Map.of("error", "Location not found"));
                }
            }

            // Assign location using service method
            InternResponse response = internService.assignLocationToIntern(id, locationId);

            System.out.println("✅ Location assigned to intern ID: " + id +
                    (locationId != null ? " (Location ID: " + locationId + ")" : " (Location removed)"));

            Map<String, Object> result = Map.of(
                    "message", locationId != null ? "Location assigned successfully" : "Location removed successfully",
                    "intern", response);

            // Broadcast real-time update
            webSocketService.broadcastInternUpdate("LOCATION_ASSIGNED", result);

            return ResponseEntity.ok(result);
        } catch (com.internregister.service.NotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Error assigning location to intern: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to assign location: " + e.getMessage()));
        }
    }
}
