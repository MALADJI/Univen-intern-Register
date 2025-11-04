package com.internregister.security;

import org.springframework.stereotype.Component;

/**
 * Password validation utility
 * Enforces strong password requirements
 */
@Component
public class PasswordValidator {
    
    /**
     * Validate password strength
     * @param password The password to validate
     * @return Validation result with error message if invalid
     */
    public PasswordValidationResult validate(String password) {
        if (password == null || password.trim().isEmpty()) {
            return PasswordValidationResult.invalid("Password is required");
        }
        
        if (password.length() < 8) {
            return PasswordValidationResult.invalid("Password must be at least 8 characters long");
        }
        
        if (!password.matches(".*[a-z].*")) {
            return PasswordValidationResult.invalid("Password must contain at least one lowercase letter");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            return PasswordValidationResult.invalid("Password must contain at least one uppercase letter");
        }
        
        if (!password.matches(".*\\d.*")) {
            return PasswordValidationResult.invalid("Password must contain at least one digit");
        }
        
        if (!password.matches(".*[@$!%*?&].*")) {
            return PasswordValidationResult.invalid("Password must contain at least one special character (@$!%*?&)");
        }
        
        return PasswordValidationResult.valid();
    }
    
    /**
     * Validation result class
     */
    public static class PasswordValidationResult {
        private final boolean valid;
        private final String errorMessage;
        
        private PasswordValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }
        
        public static PasswordValidationResult valid() {
            return new PasswordValidationResult(true, null);
        }
        
        public static PasswordValidationResult invalid(String errorMessage) {
            return new PasswordValidationResult(false, errorMessage);
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
    }
}

