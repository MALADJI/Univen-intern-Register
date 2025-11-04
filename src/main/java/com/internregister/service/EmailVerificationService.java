package com.internregister.service;

import com.internregister.entity.VerificationCode;
import com.internregister.repository.VerificationCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class EmailVerificationService {
    
    @Autowired
    private VerificationCodeRepository verificationCodeRepository;
    
    @Autowired
    private EmailService emailService;
    
    private final Random random = new Random();
    
    // Store verification code for email in database
    @Transactional
    public String generateAndStoreCode(String email) {
        return generateAndStoreCode(email, false);
    }
    
    // Store verification code for email in database (with option for password reset)
    @Transactional
    public String generateAndStoreCode(String email, boolean isPasswordReset) {
        // Delete existing code for this email if any
        verificationCodeRepository.deleteByEmail(email);
        
        // Generate 6-digit code
        String code = String.format("%06d", random.nextInt(1000000));
        
        // Create and save verification code entity
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setExpiresAt(LocalDateTime.now().plusHours(24)); // Expires in 24 hours
        
        verificationCodeRepository.save(verificationCode);
        
        // Send email with verification code
        if (isPasswordReset) {
            emailService.sendPasswordResetCode(email, code);
        } else {
            emailService.sendVerificationCode(email, code);
        }
        
        return code;
    }
    
    // Verify code from database
    @Transactional
    public boolean verifyCode(String email, String code) {
        return verifyCode(email, code, true); // Default: delete after verification
    }
    
    // Verify code from database (with option to keep code for reuse)
    @Transactional
    public boolean verifyCode(String email, String code, boolean deleteAfterVerification) {
        System.out.println("===========================================");
        System.out.println("VERIFYING CODE FOR: " + email);
        System.out.println("CODE PROVIDED: " + code);
        
        Optional<VerificationCode> verificationCodeOpt = verificationCodeRepository.findByEmailAndCode(email, code);
        
        if (verificationCodeOpt.isEmpty()) {
            System.out.println("✗ CODE VERIFICATION FAILED: No code found for email: " + email);
            System.out.println("  Possible reasons:");
            System.out.println("  1. Code was never sent - call /api/auth/send-verification-code first");
            System.out.println("  2. Code doesn't match");
            System.out.println("  3. Email doesn't match");
            System.out.println("  4. Code was already used (if one-time use)");
            System.out.println("===========================================");
            return false;
        }
        
        VerificationCode verificationCode = verificationCodeOpt.get();
        
        // Check if code is expired
        if (verificationCode.isExpired()) {
            System.out.println("✗ CODE VERIFICATION FAILED: Code expired for email: " + email);
            System.out.println("  Expired at: " + verificationCode.getExpiresAt());
            System.out.println("  Current time: " + LocalDateTime.now());
            verificationCodeRepository.delete(verificationCode);
            System.out.println("===========================================");
            return false;
        }
        
        // Code is valid
        System.out.println("✓ CODE VERIFICATION SUCCESSFUL for email: " + email);
        if (deleteAfterVerification) {
            verificationCodeRepository.delete(verificationCode);
            System.out.println("  Code deleted (one-time use)");
        } else {
            System.out.println("  Code kept for reuse (valid for 24 hours)");
        }
        System.out.println("===========================================");
        return true;
    }
    
    // Remove expired codes (cleanup job - runs every hour)
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredCodes() {
        verificationCodeRepository.deleteExpiredCodes(LocalDateTime.now());
    }
    
    // Remove code for specific email
    @Transactional
    public void removeCode(String email) {
        verificationCodeRepository.deleteByEmail(email);
    }
}

