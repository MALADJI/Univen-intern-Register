package com.internregister.controller;

import com.internregister.entity.LeaveRequest;
import com.internregister.service.LeaveRequestService;
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
    public List<LeaveRequest> getAllLeaveRequests(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return leaveRequestService.getLeaveRequestsByStatus(status);
        }
        // By default, return ALL requests (APPROVED, PENDING, REJECTED)
        return leaveRequestService.getAllLeaveRequests();
    }

    @GetMapping("/intern/{internId}")
    public List<LeaveRequest> getLeaveRequestsByIntern(@PathVariable Long internId) {
        return leaveRequestService.getLeaveRequestsByIntern(internId);
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
