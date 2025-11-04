package com.internregister.controller;

import com.internregister.entity.Admin;
import com.internregister.service.AdminService;
import com.internregister.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admins")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final InternRepository internRepository;
    private final SupervisorRepository supervisorRepository;
    private final AdminRepository adminRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final VerificationCodeRepository verificationCodeRepository;

    public AdminController(
            AdminService adminService,
            UserRepository userRepository,
            InternRepository internRepository,
            SupervisorRepository supervisorRepository,
            AdminRepository adminRepository,
            AttendanceRepository attendanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            VerificationCodeRepository verificationCodeRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.internRepository = internRepository;
        this.supervisorRepository = supervisorRepository;
        this.adminRepository = adminRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.verificationCodeRepository = verificationCodeRepository;
    }

    @GetMapping
    public List<Admin> getAllAdmins() {
        return adminService.getAllAdmins();
    }

    @PostMapping
    public Admin createAdmin(@RequestBody Admin admin) {
        return adminService.saveAdmin(admin);
    }

    @DeleteMapping("/{id}")
    public void deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
    }

    /**
     * Reset all users and related data (for testing purposes)
     * WARNING: This will delete ALL users, interns, supervisors, admins, attendance, and leave requests
     */
    @PostMapping("/reset-database")
    @Transactional
    public Map<String, Object> resetDatabase() {
        try {
            long verificationCodeCount = verificationCodeRepository.count();
            long attendanceCount = attendanceRepository.count();
            long leaveRequestCount = leaveRequestRepository.count();
            long internCount = internRepository.count();
            long supervisorCount = supervisorRepository.count();
            long adminCount = adminRepository.count();
            long userCount = userRepository.count();

            // Delete in order to respect foreign key constraints
            verificationCodeRepository.deleteAll();
            attendanceRepository.deleteAll();
            leaveRequestRepository.deleteAll();
            internRepository.deleteAll();
            supervisorRepository.deleteAll();
            adminRepository.deleteAll();
            userRepository.deleteAll();

            return Map.of(
                "success", true,
                "message", "Database reset successfully",
                "deleted", Map.of(
                    "users", userCount,
                    "admins", adminCount,
                    "supervisors", supervisorCount,
                    "interns", internCount,
                    "attendance", attendanceCount,
                    "leaveRequests", leaveRequestCount,
                    "verificationCodes", verificationCodeCount
                ),
                "totalDeleted", userCount + adminCount + supervisorCount + internCount + 
                              attendanceCount + leaveRequestCount + verificationCodeCount
            );
        } catch (Exception e) {
            return Map.of(
                "success", false,
                "error", "Failed to reset database: " + e.getMessage()
            );
        }
    }
}
