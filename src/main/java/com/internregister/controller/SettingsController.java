package com.internregister.controller;

import com.internregister.entity.NotificationPreference;
import com.internregister.entity.User;
import com.internregister.service.TermsAcceptanceService;
import com.internregister.repository.UserRepository;
import com.internregister.service.AuthHelperService;
import com.internregister.service.NotificationPreferenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SettingsController {

    private final AuthHelperService authHelperService;
    private final NotificationPreferenceService notificationPreferenceService;
    private final TermsAcceptanceService termsAcceptanceService;
    private final UserRepository userRepository;

    public SettingsController(AuthHelperService authHelperService, NotificationPreferenceService notificationPreferenceService, TermsAcceptanceService termsAcceptanceService, UserRepository userRepository) {
        this.authHelperService = authHelperService;
        this.notificationPreferenceService = notificationPreferenceService;
        this.termsAcceptanceService = termsAcceptanceService;
        this.userRepository = userRepository;
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotificationPreferences() {
        var userOpt = authHelperService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        User user = userOpt.get();
        NotificationPreference pref = notificationPreferenceService.getOrCreateFor(user);
        return ResponseEntity.ok(Map.of(
                "emailLeaveUpdates", pref.isEmailLeaveUpdates(),
                "emailAttendanceAlerts", pref.isEmailAttendanceAlerts(),
                "frequency", pref.getFrequency().name()
        ));
    }

    @PutMapping("/notifications")
    public ResponseEntity<?> updateNotificationPreferences(@RequestBody Map<String, Object> body) {
        var userOpt = authHelperService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        User user = userOpt.get();

        NotificationPreference updated = new NotificationPreference();
        if (body.containsKey("emailLeaveUpdates")) {
            updated.setEmailLeaveUpdates(Boolean.TRUE.equals(body.get("emailLeaveUpdates")) || Boolean.TRUE.equals(Boolean.valueOf(String.valueOf(body.get("emailLeaveUpdates")))));
        }
        if (body.containsKey("emailAttendanceAlerts")) {
            updated.setEmailAttendanceAlerts(Boolean.TRUE.equals(body.get("emailAttendanceAlerts")) || Boolean.TRUE.equals(Boolean.valueOf(String.valueOf(body.get("emailAttendanceAlerts")))));
        }
        if (body.containsKey("frequency")) {
            try {
                updated.setFrequency(NotificationPreference.Frequency.valueOf(String.valueOf(body.get("frequency")).toUpperCase()));
            } catch (Exception ignored) {}
        }

        NotificationPreference saved = notificationPreferenceService.update(user, updated);
        return ResponseEntity.ok(Map.of(
                "emailLeaveUpdates", saved.isEmailLeaveUpdates(),
                "emailAttendanceAlerts", saved.isEmailAttendanceAlerts(),
                "frequency", saved.getFrequency().name()
        ));
    }

    @GetMapping("/terms")
    public ResponseEntity<?> getTermsStatus() {
        var userOpt = authHelperService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        var ta = termsAcceptanceService.getOrCreate(userOpt.get());
        return ResponseEntity.ok(Map.of(
                "accepted", ta.isAccepted(),
                "acceptedAt", ta.getAcceptedAt(),
                "version", ta.getVersion()
        ));
    }

    @PutMapping("/terms")
    public ResponseEntity<?> acceptTerms(@RequestBody Map<String, String> body, @RequestHeader(value = "X-Forwarded-For", required = false) String xff, @RequestHeader(value = "X-Real-IP", required = false) String xri) {
        var userOpt = authHelperService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        String version = body != null ? body.getOrDefault("version", "v1") : "v1";
        String ip = xff != null && !xff.isBlank() ? xff.split(",")[0].trim() : (xri != null ? xri : null);
        var saved = termsAcceptanceService.accept(userOpt.get(), version, ip);
        return ResponseEntity.ok(Map.of(
                "accepted", saved.isAccepted(),
                "acceptedAt", saved.getAcceptedAt(),
                "version", saved.getVersion()
        ));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        var userOpt = authHelperService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        User u = userOpt.get();
        return ResponseEntity.ok(Map.of(
                "username", u.getUsername(),
                "email", u.getEmail(),
                "name", u.getName(),
                "phone", u.getPhone(),
                "avatarUrl", u.getAvatarUrl()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        var userOpt = authHelperService.getCurrentUser();
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        }
        User u = userOpt.get();
        if (body.containsKey("name")) u.setName(body.get("name"));
        if (body.containsKey("phone")) u.setPhone(body.get("phone"));
        if (body.containsKey("avatarUrl")) u.setAvatarUrl(body.get("avatarUrl"));
        userRepository.save(u);
        return ResponseEntity.ok(Map.of(
                "username", u.getUsername(),
                "email", u.getEmail(),
                "name", u.getName(),
                "phone", u.getPhone(),
                "avatarUrl", u.getAvatarUrl()
        ));
    }
}


