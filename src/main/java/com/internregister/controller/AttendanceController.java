package com.internregister.controller;

import com.internregister.entity.Attendance;
import com.internregister.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/intern/{internId}")
    public List<Attendance> getAttendanceByIntern(@PathVariable Long internId) {
        return attendanceService.getAttendanceByIntern(internId);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody Map<String, Object> request) {
        try {
            Long internId = null;
            String location = null;
            
            // Handle both Integer and Long for internId (JSON numbers can be parsed as Integer)
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
            
            Object locationObj = request.get("location");
            if (locationObj != null) {
                location = locationObj.toString();
            }
            
            if (internId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "internId is required"));
            }
            
            Attendance attendance = attendanceService.signIn(internId, location);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/signout/{attendanceId}")
    public ResponseEntity<?> signOut(@PathVariable Long attendanceId) {
        try {
            Attendance attendance = attendanceService.signOut(attendanceId);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
