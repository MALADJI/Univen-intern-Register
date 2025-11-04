package com.internregister.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Value("${mail.from.address:noreply@univen.ac.za}")
    private String fromAddress;
    
    @Value("${mail.enabled:false}")
    private boolean mailEnabled;
    
    public void sendVerificationCode(String toEmail, String code) {
        String subject = "Verification Code - Intern Register System";
        String body = String.format(
            "Hello,\n\n" +
            "Your verification code is: %s\n\n" +
            "This code will expire in 24 hours.\n\n" +
            "If you did not request this code, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Intern Register System",
            code
        );
        
        if (mailEnabled && mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                System.out.println("===========================================");
                System.out.println("✓ EMAIL SENT SUCCESSFULLY");
                System.out.println("  To: " + toEmail);
                System.out.println("  Code: " + code);
                System.out.println("===========================================");
            } catch (Exception e) {
                System.err.println("✗ FAILED TO SEND EMAIL: " + e.getMessage());
                System.out.println("===========================================");
                System.out.println("FALLING BACK TO CONSOLE OUTPUT");
                System.out.println("VERIFICATION CODE FOR: " + toEmail);
                System.out.println("CODE: " + code);
                System.out.println("===========================================");
            }
        } else {
            // Fallback to console if email is not configured
            System.out.println("===========================================");
            System.out.println("EMAIL NOT CONFIGURED - CODE DISPLAYED BELOW");
            System.out.println("To enable email, configure SMTP in application.properties");
            System.out.println("===========================================");
            System.out.println("VERIFICATION CODE FOR: " + toEmail);
            System.out.println("CODE: " + code);
            System.out.println("===========================================");
        }
    }
    
    public void sendPasswordResetCode(String toEmail, String code) {
        String subject = "Password Reset Code - Intern Register System";
        String body = String.format(
            "Hello,\n\n" +
            "You requested to reset your password.\n\n" +
            "Your verification code is: %s\n\n" +
            "This code will expire in 24 hours.\n\n" +
            "If you did not request a password reset, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Intern Register System",
            code
        );
        
        if (mailEnabled && mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                System.out.println("===========================================");
                System.out.println("✓ PASSWORD RESET EMAIL SENT SUCCESSFULLY");
                System.out.println("  To: " + toEmail);
                System.out.println("  Code: " + code);
                System.out.println("===========================================");
            } catch (Exception e) {
                System.err.println("✗ FAILED TO SEND EMAIL: " + e.getMessage());
                System.out.println("===========================================");
                System.out.println("FALLING BACK TO CONSOLE OUTPUT");
                System.out.println("PASSWORD RESET CODE FOR: " + toEmail);
                System.out.println("CODE: " + code);
                System.out.println("===========================================");
            }
        } else {
            // Fallback to console if email is not configured
            System.out.println("===========================================");
            System.out.println("EMAIL NOT CONFIGURED - CODE DISPLAYED BELOW");
            System.out.println("To enable email, configure SMTP in application.properties");
            System.out.println("===========================================");
            System.out.println("PASSWORD RESET CODE FOR: " + toEmail);
            System.out.println("CODE: " + code);
            System.out.println("===========================================");
        }
    }
}

