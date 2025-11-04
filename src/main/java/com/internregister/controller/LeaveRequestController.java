package com.internregister.controller;

import com.internregister.entity.LeaveRequest;
import com.internregister.entity.User;
import com.internregister.entity.Intern;
import com.internregister.service.LeaveRequestService;
import com.internregister.repository.UserRepository;
import com.internregister.repository.InternRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import com.internregister.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;
    private final UserRepository userRepository;
    private final InternRepository internRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public LeaveRequestController(LeaveRequestService leaveRequestService,
                                 UserRepository userRepository,
                                 InternRepository internRepository) {
        this.leaveRequestService = leaveRequestService;
        this.userRepository = userRepository;
        this.internRepository = internRepository;
    }

    @GetMapping
    public List<LeaveRequest> getAllLeaveRequests(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return leaveRequestService.getLeaveRequestsByStatus(status);
        }
        // By default, return ALL requests (APPROVED, PENDING, REJECTED)
        return leaveRequestService.getAllLeaveRequests();
    }

    @GetMapping("/intern/{internId}")
    public ResponseEntity<?> getLeaveRequestsByIntern(@PathVariable Long internId) {
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

        // For INTERN role, they can only view their own leave requests
        if ("INTERN".equals(role)) {
            Optional<Intern> internOpt = internRepository.findByEmail(username);
            if (internOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "Intern profile not found"));
            }
            Intern intern = internOpt.get();
            // Ensure they're requesting their own leave requests
            if (!intern.getInternId().equals(internId)) {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized", "message", "You can only view your own leave requests"));
            }
        }
        // Admins and supervisors can view any intern's leave requests

        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByIntern(internId));
    }
    
    @GetMapping("/my-leave")
    public ResponseEntity<?> getMyLeaveRequests() {
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

        // Only interns can use this endpoint
        if (!"INTERN".equals(role)) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized", "message", "This endpoint is only available for interns"));
        }

        Optional<Intern> internOpt = internRepository.findByEmail(username);
        if (internOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Intern profile not found", "message", "Your intern profile was not found. Please contact an administrator."));
        }

        Intern intern = internOpt.get();
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByIntern(intern.getInternId()));
    }

    @GetMapping("/search")
    public Page<LeaveRequest> searchLeaveRequests(@RequestParam(required = false) String status,
                                                  @RequestParam(required = false) Long internId,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fromDate").descending());
        return leaveRequestService.searchLeaveRequests(status, internId, pageable);
    }

    @PostMapping
    public ResponseEntity<?> submitLeaveRequest(@RequestBody java.util.Map<String, Object> request) {
        try {
            // Check authentication
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated", "message", "Please log in to submit a leave request"));
            }

            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found", "message", "User account not found"));
            }

            User user = userOpt.get();
            String role = user.getRole().name();

            // Get intern profile for the authenticated user
            Optional<Intern> internOpt = internRepository.findByEmail(username);
            
            // For INTERN role, use their own intern profile
            if ("INTERN".equals(role)) {
                if (internOpt.isEmpty()) {
                    return ResponseEntity.status(404).body(Map.of(
                        "error", "Intern profile not found",
                        "message", "Your intern profile was not found. Please contact an administrator."
                    ));
                }
            } else if ("ADMIN".equals(role) || "SUPERVISOR".equals(role)) {
                // Admins and supervisors can submit on behalf of interns
                // Try to get internId from request, or use their own if they have an intern profile
                Long internId = null;
                Object internIdObj = request.get("internId");
                if (internIdObj != null) {
                    if (internIdObj instanceof Integer) {
                        internId = ((Integer) internIdObj).longValue();
                    } else if (internIdObj instanceof Long) {
                        internId = (Long) internIdObj;
                    } else if (internIdObj instanceof Number) {
                        internId = ((Number) internIdObj).longValue();
                    } else if (internIdObj instanceof String) {
                        try {
                            internId = Long.parseLong((String) internIdObj);
                        } catch (NumberFormatException e) {
                            return ResponseEntity.badRequest().body(Map.of("error", "Invalid internId format"));
                        }
                    }
                }
                
                if (internId != null) {
                    internOpt = internRepository.findById(internId);
                    if (internOpt.isEmpty()) {
                        return ResponseEntity.status(404).body(Map.of("error", "Intern not found", "message", "The specified intern does not exist"));
                    }
                } else if (internOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "internId is required", "message", "Please specify the intern ID for the leave request"));
                }
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "Unauthorized", "message", "Only interns, supervisors, and admins can submit leave requests"));
            }

            Intern intern = internOpt.get();
            
            // Extract other fields from request
            String fromDateStr = (String) request.get("fromDate");
            String toDateStr = (String) request.get("toDate");
            String leaveTypeStr = (String) request.get("leaveType");
            
            // Validate required fields
            if (fromDateStr == null || fromDateStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "fromDate is required", "message", "Please provide the start date of your leave"));
            }
            if (toDateStr == null || toDateStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "toDate is required", "message", "Please provide the end date of your leave"));
            }
            if (leaveTypeStr == null || leaveTypeStr.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "leaveType is required", "message", "Please specify the type of leave"));
            }
            
            LeaveRequest leaveRequest = leaveRequestService.submitLeaveRequest(intern.getInternId(), fromDateStr, toDateStr, leaveTypeStr);
            return ResponseEntity.ok(leaveRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to submit leave request: " + e.getMessage(), "message", "An error occurred while submitting your leave request. Please try again."));
        }
    }

    @PostMapping(path = "/{id}/attachment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAttachment(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== UPLOAD ATTACHMENT REQUEST ===");
            System.out.println("Leave Request ID: " + id);
            System.out.println("File name: " + (file != null ? file.getOriginalFilename() : "null"));
            System.out.println("File size: " + (file != null ? file.getSize() : "null"));
            
            if (file == null || file.isEmpty()) {
                System.out.println("✗ File is null or empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("error", "File is required"));
            }
            
            LeaveRequest leaveRequest = leaveRequestService.getLeaveRequestById(id);
            if (leaveRequest == null) {
                System.out.println("✗ Leave request not found with ID: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of("error", "Leave request not found"));
            }
            
            System.out.println("✓ Leave request found");
            String filename = fileStorageService.saveFile(file);
            System.out.println("✓ File saved: " + filename);
            
            leaveRequest.setAttachmentPath(filename);
            leaveRequestService.save(leaveRequest);
            System.out.println("✓ Attachment path updated in database");
            System.out.println("=== UPLOAD SUCCESS ===");
            
            return ResponseEntity.ok().body(java.util.Map.of(
                "message", "File uploaded successfully",
                "filename", filename
            ));
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("✗ Error uploading file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(java.util.Map.of("error", "Error uploading file: " + e.getMessage()));
        }
    }

    @GetMapping("/attachment/{filename}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String filename) {
        try {
            Resource resource = fileStorageService.loadFile(filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/approve/{id}")
    public LeaveRequest approveLeave(@PathVariable Long id) {
        return leaveRequestService.approveLeave(id);
    }

    @PutMapping("/reject/{id}")
    public LeaveRequest rejectLeave(@PathVariable Long id) {
        return leaveRequestService.rejectLeave(id);
    }
}
