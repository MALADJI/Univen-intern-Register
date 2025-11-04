package com.internregister.service;

import com.internregister.entity.Attendance;
import com.internregister.entity.AttendanceStatus;
import com.internregister.entity.Intern;
import com.internregister.repository.AttendanceRepository;
import com.internregister.repository.InternRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final InternRepository internRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, InternRepository internRepository) {
        this.attendanceRepository = attendanceRepository;
        this.internRepository = internRepository;
    }

    public List<Attendance> getAttendanceByIntern(Long internId) {
        return attendanceRepository.findByInternInternId(internId);
    }

    public Attendance signIn(Long internId, String location) {
        // Find the intern
        Intern intern = internRepository.findById(internId)
                .orElseThrow(() -> new RuntimeException("Intern not found with id: " + internId));
        
        // Create new attendance record
        Attendance attendance = new Attendance();
        attendance.setIntern(intern);
        attendance.setDate(LocalDateTime.now());
        attendance.setTimeIn(LocalDateTime.now());
        attendance.setStatus(AttendanceStatus.SIGNED_IN);
        attendance.setLocation(location);
        
        return attendanceRepository.save(attendance);
    }

    public Attendance signOut(Long attendanceId) {
        Attendance record = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found with id: " + attendanceId));
        record.setTimeOut(LocalDateTime.now());
        record.setStatus(AttendanceStatus.SIGNED_OUT);
        return attendanceRepository.save(record);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
}
