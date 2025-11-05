package com.internregister.controller;

import com.internregister.entity.LeaveRequest;
import com.internregister.service.LeaveRequestService;
import com.internregister.dto.LeaveRequestResponse;
import org.springframework.web.bind.annotation.*;
import java.util.List;
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

    @Autowired
    private FileStorageService fileStorageService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @GetMapping
    public ResponseEntity<?> getAllLeaveRequests(@RequestParam(required = false) String status) {
        try {
            System.out.println("=== Getting Leave Requests ===");
            System.out.println("Status filter: " + (status != null ? status : "none"));
            
            List<LeaveRequest> requests = new java.util.ArrayList<>();
            try {
                if (status != null && !status.isEmpty()) {
                    System.out.println("Filtering by status: " + status);
                    requests = leaveRequestService.getLeaveRequestsByStatus(status);
                } else {
                    System.out.println("Getting all leave requests");
                    requests = leaveRequestService.getAllLeaveRequests();
                }
            } catch (Exception e) {
                System.err.println("✗ Error getting leave requests from service: " + e.getMessage());
                e.printStackTrace();
                // Return empty list on service error
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            System.out.println("✓ Found " + requests.size() + " leave request(s)");
            
            // Convert to DTO to avoid circular reference issues
            List<LeaveRequestResponse> responses = new java.util.ArrayList<>();
            for (LeaveRequest request : requests) {
                try {
                    System.out.println("  Converting leave request ID: " + request.getRequestId());
                    LeaveRequestResponse response = LeaveRequestResponse.fromEntity(request);
                    System.out.println("  ✓ Converted successfully: " + response.getRequestId());
                    responses.add(response);
                } catch (Exception e) {
                    System.err.println("⚠️ Error converting leave request " + request.getRequestId() + ": " + e.getMessage());
                    e.printStackTrace();
                    // Skip this request and continue
                }
            }
            
            System.out.println("✓ Converted " + responses.size() + " leave request(s) to DTOs");
            System.out.println("  Total responses to return: " + responses.size());
            System.out.println("=== End Getting Leave Requests ===");
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.err.println("✗ FATAL ERROR getting leave requests:");
            System.err.println("  Message: " + e.getMessage());
            System.err.println("  Class: " + e.getClass().getName());
            e.printStackTrace();
            
            // Return empty array instead of error to prevent 500
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/intern/{internId}")
    public ResponseEntity<?> getLeaveRequestsByIntern(@PathVariable Long internId) {
        try {
            System.out.println("=== Getting Leave Requests for Intern ===");
            System.out.println("Intern ID: " + internId);
            
            List<LeaveRequest> requests = null;
            try {
                requests = leaveRequestService.getLeaveRequestsByIntern(internId);
                System.out.println("✓ Found " + requests.size() + " leave request(s) for intern " + internId);
            } catch (Exception e) {
                System.err.println("✗ Error getting leave requests from service: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "Failed to get leave requests: " + e.getMessage()));
            }
            
            // Convert to DTO to avoid circular reference issues
            List<LeaveRequestResponse> responses = new java.util.ArrayList<>();
            for (LeaveRequest request : requests) {
                try {
                    LeaveRequestResponse response = LeaveRequestResponse.fromEntity(request);
                    responses.add(response);
                } catch (Exception e) {
                    System.err.println("⚠️ Error converting leave request " + request.getRequestId() + ": " + e.getMessage());
                    // Skip this request and continue
                }
            }
            
            System.out.println("✓ Converted " + responses.size() + " leave request(s) to DTOs");
            System.out.println("=== End Getting Leave Requests for Intern ===");
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.err.println("✗ FATAL ERROR getting leave requests for intern:");
            System.err.println("  Message: " + e.getMessage());
            System.err.println("  Class: " + e.getClass().getName());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to get leave requests: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchLeaveRequests(@RequestParam(required = false) String status,
                                                  @RequestParam(required = false) Long internId,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        try {
            System.out.println("=== Searching Leave Requests ===");
            System.out.println("Status: " + (status != null ? status : "none"));
            System.out.println("Intern ID: " + (internId != null ? internId : "none"));
            System.out.println("Page: " + page + ", Size: " + size);
            
            Pageable pageable = PageRequest.of(page, size, Sort.by("fromDate").descending());
            
            Page<LeaveRequest> leaveRequestPage = null;
            try {
                leaveRequestPage = leaveRequestService.searchLeaveRequests(status, internId, pageable);
                System.out.println("✓ Found " + leaveRequestPage.getTotalElements() + " total leave request(s)");
                System.out.println("  Page " + (leaveRequestPage.getNumber() + 1) + " of " + leaveRequestPage.getTotalPages());
                System.out.println("  Content size: " + leaveRequestPage.getContent().size());
            } catch (Exception e) {
                System.err.println("✗ Error searching leave requests from service: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "Failed to search leave requests: " + e.getMessage()));
            }
            
            // Convert Page<LeaveRequest> to Page<LeaveRequestResponse>
            if (leaveRequestPage == null || leaveRequestPage.getContent() == null) {
                System.err.println("✗ Leave request page is null or has null content");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "No leave requests found"));
            }
            
            Page<LeaveRequestResponse> responsePage = leaveRequestPage.map(leaveRequest -> {
                try {
                    if (leaveRequest == null) {
                        System.err.println("⚠️ Null leave request found in page");
                        LeaveRequestResponse response = new LeaveRequestResponse();
                        return response;
                    }
                    return LeaveRequestResponse.fromEntity(leaveRequest);
                } catch (Exception e) {
                    System.err.println("⚠️ Error converting leave request " + (leaveRequest != null ? leaveRequest.getRequestId() : "null") + " to DTO: " + e.getMessage());
                    e.printStackTrace();
                    // Return minimal DTO
                    LeaveRequestResponse response = new LeaveRequestResponse();
                    if (leaveRequest != null) {
                        response.setRequestId(leaveRequest.getRequestId());
                    }
                    return response;
                }
            });
            
            System.out.println("✓ Converted " + responsePage.getContent().size() + " leave request(s) to DTOs");
            System.out.println("=== End Searching Leave Requests ===");
            
            return ResponseEntity.ok(responsePage);
        } catch (Exception e) {
            System.err.println("✗ FATAL ERROR searching leave requests:");
            System.err.println("  Message: " + e.getMessage());
            System.err.println("  Class: " + e.getClass().getName());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to search leave requests: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> submitLeaveRequest(@RequestBody java.util.Map<String, Object> request) {
        try {
            // Extract fields from request
            Long internId = null;
            Object internIdObj = request.get("internId");
            if (internIdObj != null) {
                if (internIdObj instanceof Integer) {
                    internId = ((Integer) internIdObj).longValue();
                } else if (internIdObj instanceof Long) {
                    internId = (Long) internIdObj;
                } else if (internIdObj instanceof Number) {
                    internId = ((Number) internIdObj).longValue();
                }
            }
            
            String fromDateStr = (String) request.get("fromDate");
            String toDateStr = (String) request.get("toDate");
            String leaveTypeStr = (String) request.get("leaveType");
            
            // Validate required fields
            if (internId == null) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "internId is required"));
            }
            if (fromDateStr == null || fromDateStr.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "fromDate is required"));
            }
            if (toDateStr == null || toDateStr.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "toDate is required"));
            }
            if (leaveTypeStr == null || leaveTypeStr.isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "leaveType is required"));
            }
            
            LeaveRequest leaveRequest = leaveRequestService.submitLeaveRequest(internId, fromDateStr, toDateStr, leaveTypeStr);
            return ResponseEntity.ok(leaveRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to submit leave request: " + e.getMessage()));
        }
    }

    @PostMapping(path = "/{id}/attachment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAttachment(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is required");
            }
            
            LeaveRequest leaveRequest = leaveRequestService.getLeaveRequestById(id);
            if (leaveRequest == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Leave request not found.");
            }
            String filename = fileStorageService.saveFile(file);
            leaveRequest.setAttachmentPath(filename);
            leaveRequestService.save(leaveRequest);
            return ResponseEntity.ok().body("File uploaded successfully. Filename: " + filename);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping("/attachment/{filename}")
    public ResponseEntity<?> downloadAttachment(@PathVariable String filename) {
        try {
            System.out.println("=== Downloading Leave Attachment ===");
            System.out.println("Filename: " + filename);
            
            if (filename == null || filename.isEmpty()) {
                System.err.println("✗ Filename is null or empty");
                return ResponseEntity.badRequest()
                        .body(java.util.Map.of("error", "Filename is required"));
            }
            
            Resource resource = fileStorageService.loadFile(filename);
            
            if (resource == null || !resource.exists()) {
                System.err.println("✗ File not found: " + filename);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(java.util.Map.of("error", "File not found: " + filename));
            }
            
            System.out.println("✓ File found, preparing download");
            System.out.println("=== End Downloading Leave Attachment ===");
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (RuntimeException e) {
            System.err.println("✗ Error loading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("error", "File not found: " + filename));
        } catch (Exception e) {
            System.err.println("✗ FATAL ERROR downloading attachment:");
            System.err.println("  Message: " + e.getMessage());
            System.err.println("  Class: " + e.getClass().getName());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to download file: " + e.getMessage()));
        }
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        try {
            System.out.println("=== Approving Leave Request ===");
            System.out.println("Request ID: " + id);
            
            LeaveRequest request = null;
            try {
                request = leaveRequestService.approveLeave(id);
                System.out.println("✓ Leave request approved successfully in service");
            } catch (RuntimeException e) {
                System.err.println("✗ Service error: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
            } catch (Exception e) {
                System.err.println("✗ Service fatal error: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "Service error: " + e.getMessage()));
            }
            
            if (request == null) {
                System.err.println("✗ Service returned null");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "Service returned null"));
            }
            
            System.out.println("  Converting to DTO...");
            LeaveRequestResponse response = null;
            try {
                response = LeaveRequestResponse.fromEntity(request);
                System.out.println("✓ Converted to DTO successfully");
            } catch (Exception e) {
                System.err.println("✗ Error converting to DTO: " + e.getMessage());
                e.printStackTrace();
                // Create minimal DTO as fallback
                System.out.println("  Creating minimal DTO as fallback");
                response = new LeaveRequestResponse();
                if (request != null) {
                    response.setRequestId(request.getRequestId());
                    response.setStatus(request.getStatus());
                    // Try to set other safe fields
                    try {
                        response.setLeaveType(request.getLeaveType());
                        response.setFromDate(request.getFromDate());
                        response.setToDate(request.getToDate());
                        response.setStatus(request.getStatus());
                    } catch (Exception ex) {
                        System.err.println("  Could not set all fields in fallback DTO: " + ex.getMessage());
                    }
                }
            }
            
            if (response == null) {
                System.err.println("✗ DTO conversion returned null, creating minimal DTO");
                response = new LeaveRequestResponse();
                if (request != null) {
                    response.setRequestId(request.getRequestId());
                    response.setStatus(request.getStatus());
                }
            }
            
            System.out.println("=== End Approving Leave Request ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("✗ FATAL ERROR in approve endpoint:");
            System.err.println("  Message: " + e.getMessage());
            System.err.println("  Class: " + e.getClass().getName());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to approve leave request: " + e.getMessage()));
        }
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        try {
            System.out.println("=== Rejecting Leave Request ===");
            System.out.println("Request ID: " + id);
            
            LeaveRequest request = null;
            try {
                request = leaveRequestService.rejectLeave(id);
                System.out.println("✓ Leave request rejected successfully in service");
            } catch (RuntimeException e) {
                System.err.println("✗ Service error: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
            } catch (Exception e) {
                System.err.println("✗ Service fatal error: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "Service error: " + e.getMessage()));
            }
            
            if (request == null) {
                System.err.println("✗ Service returned null");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(java.util.Map.of("error", "Service returned null"));
            }
            
            System.out.println("  Converting to DTO...");
            LeaveRequestResponse response = null;
            try {
                response = LeaveRequestResponse.fromEntity(request);
                System.out.println("✓ Converted to DTO successfully");
            } catch (Exception e) {
                System.err.println("✗ Error converting to DTO: " + e.getMessage());
                e.printStackTrace();
                // Create minimal DTO as fallback
                System.out.println("  Creating minimal DTO as fallback");
                response = new LeaveRequestResponse();
                if (request != null) {
                    response.setRequestId(request.getRequestId());
                    response.setStatus(request.getStatus());
                    // Try to set other safe fields
                    try {
                        response.setLeaveType(request.getLeaveType());
                        response.setFromDate(request.getFromDate());
                        response.setToDate(request.getToDate());
                        response.setStatus(request.getStatus());
                    } catch (Exception ex) {
                        System.err.println("  Could not set all fields in fallback DTO: " + ex.getMessage());
                    }
                }
            }
            
            if (response == null) {
                System.err.println("✗ DTO conversion returned null, creating minimal DTO");
                response = new LeaveRequestResponse();
                if (request != null) {
                    response.setRequestId(request.getRequestId());
                    response.setStatus(request.getStatus());
                }
            }
            
            System.out.println("=== End Rejecting Leave Request ===");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("✗ FATAL ERROR in reject endpoint:");
            System.err.println("  Message: " + e.getMessage());
            System.err.println("  Class: " + e.getClass().getName());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Failed to reject leave request: " + e.getMessage()));
        }
    }
}
