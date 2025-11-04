package com.internregister.service;

import com.internregister.entity.LeaveRequest;
import com.internregister.entity.LeaveStatus;
import com.internregister.entity.LeaveType;
import com.internregister.entity.Intern;
import com.internregister.repository.LeaveRequestRepository;
import com.internregister.repository.InternRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final InternRepository internRepository;

    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository, InternRepository internRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.internRepository = internRepository;
    }

    public List<LeaveRequest> getLeaveRequestsByIntern(Long internId) {
        return leaveRequestRepository.findByIntern_InternId(internId);
    }

    public LeaveRequest submitLeaveRequest(LeaveRequest leaveRequest) {
        leaveRequest.setStatus(LeaveStatus.PENDING);
        return leaveRequestRepository.save(leaveRequest);
    }
    
    public LeaveRequest submitLeaveRequest(Long internId, String fromDateStr, String toDateStr, String leaveTypeStr) {
        // Find the intern
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found with id: " + internId));
        
        // Parse dates
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate;
        LocalDate toDate;
        try {
            fromDate = LocalDate.parse(fromDateStr, formatter);
            toDate = LocalDate.parse(toDateStr, formatter);
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format. Expected format: yyyy-MM-dd", e);
        }
        
        // Validate dates
        if (toDate.isBefore(fromDate)) {
            throw new RuntimeException("toDate cannot be before fromDate");
        }
        
        // Parse leave type
        LeaveType leaveType;
        try {
            leaveType = LeaveType.valueOf(leaveTypeStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid leaveType. Must be one of: ANNUAL, SICK, CASUAL, EMERGENCY, OTHER, UNPAID, STUDY", e);
        }
        
        // Create leave request
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setIntern(intern);
        leaveRequest.setFromDate(fromDate);
        leaveRequest.setToDate(toDate);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStatus(LeaveStatus.PENDING);
        
        return leaveRequestRepository.save(leaveRequest);
    }

    public LeaveRequest approveLeave(Long requestId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        request.setStatus(LeaveStatus.APPROVED);
        return leaveRequestRepository.save(request);
    }

    public LeaveRequest rejectLeave(Long requestId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        request.setStatus(LeaveStatus.REJECTED);
        return leaveRequestRepository.save(request);
    }

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }
    
    public List<LeaveRequest> getLeaveRequestsByStatus(String status) {
        return leaveRequestRepository.findAll().stream()
                .filter(lr -> lr.getStatus().name().equals(status))
                .toList();
    }

    public Page<LeaveRequest> searchLeaveRequests(String status, Long internId, Pageable pageable) {
        if (status != null && internId != null) {
            return leaveRequestRepository.findByStatusAndIntern_InternId(status, internId, pageable);
        } else if (status != null) {
            return leaveRequestRepository.findByStatus(status, pageable);
        } else if (internId != null) {
            return leaveRequestRepository.findByIntern_InternId(internId, pageable);
        } else {
            return leaveRequestRepository.findAll(pageable);
        }
    }

    public LeaveRequest getLeaveRequestById(Long id) {
        return leaveRequestRepository.findById(id).orElse(null);
    }
    public LeaveRequest save(LeaveRequest leaveRequest) {
        return leaveRequestRepository.save(leaveRequest);
    }
}
