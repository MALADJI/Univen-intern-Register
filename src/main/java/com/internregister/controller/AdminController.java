package com.internregister.controller;

import com.internregister.entity.Admin;
import com.internregister.entity.User;
import com.internregister.entity.Intern;
import com.internregister.service.AdminService;
import com.internregister.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Optional;
import java.util.stream.Collectors;

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
     * Get all intern users with their login credentials
     * Returns username/email for login purposes
     */
    @GetMapping("/intern-users")
    public ResponseEntity<?> getAllInternUsers() {
        try {
            List<User> internUsers = userRepository.findByRole(User.Role.INTERN);
            
            List<Map<String, Object>> internUserList = new ArrayList<>();
            
            for (User user : internUsers) {
                // Try to find associated intern profile
                Optional<Intern> internOpt = internRepository.findByEmail(user.getUsername());
                
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userId", user.getId());
                userInfo.put("username", user.getUsername());
                userInfo.put("email", user.getEmail() != null ? user.getEmail() : user.getUsername());
                userInfo.put("role", user.getRole().name());
                userInfo.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "N/A");
                userInfo.put("hasProfile", internOpt.isPresent());
                userInfo.put("internName", internOpt.map(Intern::getName).orElse("No profile"));
                userInfo.put("internId", internOpt.map(i -> i.getInternId().toString()).orElse("N/A"));
                
                internUserList.add(userInfo);
            }
            
            System.out.println("✓ Retrieved " + internUserList.size() + " intern user(s)");
            
            return ResponseEntity.ok(Map.of(
                "count", internUserList.size(),
                "internUsers", internUserList
            ));
        } catch (Exception e) {
            System.err.println("Error retrieving intern users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to retrieve intern users: " + e.getMessage()
            ));
        }
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
