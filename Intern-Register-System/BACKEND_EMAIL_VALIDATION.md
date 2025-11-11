# Backend Email Validation Implementation Guide

## Overview
This guide explains how to add email duplicate validation to the backend registration endpoint.

## Required Changes

### 1. Add Check Email Endpoint (Optional but Recommended)

Add this endpoint to your `AuthController.java`:

```java
@PostMapping("/check-email")
public ResponseEntity<?> checkEmailExists(@RequestBody Map<String, String> request) {
    String email = request.get("email");
    
    if (email == null || email.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Email is required"));
    }
    
    // Check if email exists in User table
    boolean exists = userRepository.existsByUsername(email) || 
                     userRepository.existsByEmail(email);
    
    if (exists) {
        return ResponseEntity.ok(Map.of("exists", true, "message", "Email already registered"));
    } else {
        return ResponseEntity.ok(Map.of("exists", false, "message", "Email is available"));
    }
}
```

### 2. Update Registration Endpoint to Validate Email

In your `AuthController.java`, update the registration endpoint to check for duplicate emails:

```java
@PostMapping("/register")
public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    // Validate verification code first
    if (!emailVerificationService.verifyCode(request.getUsername(), request.getVerificationCode(), true)) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Invalid or expired verification code"));
    }
    
    // Check if email/username already exists
    if (userRepository.existsByUsername(request.getUsername()) || 
        userRepository.existsByEmail(request.getUsername())) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(Map.of("error", "Email already registered", 
                        "message", "This email is already registered. Please use a different email or try logging in."));
    }
    
    // Proceed with registration...
    // (existing registration logic)
}
```

### 3. Add Repository Methods (if not exists)

In your `UserRepository.java`, add these methods:

```java
boolean existsByUsername(String username);
boolean existsByEmail(String email);
```

Or if using JPA, Spring Data JPA will automatically create these methods based on the method names.

## Error Response Format

The backend should return:
- **Status 409 (Conflict)** or **400 (Bad Request)** when email already exists
- **Status 200 (OK)** when email is available (for check-email endpoint)
- Error message in format: `{ "error": "Email already registered", "message": "..." }`

## Frontend Integration

The frontend is already configured to:
1. Check email before sending verification code (if `/api/auth/check-email` endpoint exists)
2. Handle duplicate email errors during registration
3. Show user-friendly error messages

## Testing

1. Try to register with an existing email
2. Verify that the frontend shows an error message
3. Verify that the backend returns appropriate status codes
4. Test the check-email endpoint separately if implemented

