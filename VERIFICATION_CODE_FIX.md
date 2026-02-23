# Verification Code Expiration Fix ✅

## Issue Fixed

**Problem:** Verification codes were expiring in **24 hours**, but the frontend expects them to expire in **15 minutes (900 seconds)**.

**Fix Applied:** Changed verification code expiration from 24 hours to 15 minutes.

## Changes Made

### 1. EmailVerificationService.java
```java
// BEFORE:
verificationCode.setExpiresAt(LocalDateTime.now().plusHours(24)); // Expires in 24 hours

// AFTER:
verificationCode.setExpiresAt(LocalDateTime.now().plusMinutes(15)); // Expires in 15 minutes (900 seconds)
```

### 2. VerificationCode.java
```java
// BEFORE:
if (expiresAt == null) {
    expiresAt = LocalDateTime.now().plusHours(24);
}

// AFTER:
if (expiresAt == null) {
    expiresAt = LocalDateTime.now().plusMinutes(15);
}
```

## Affected Endpoints

These endpoints now use 15-minute expiration:

1. ✅ `POST /api/auth/send-verification-code` - Email verification
2. ✅ `POST /api/auth/forgot-password` - Password reset code
3. ✅ `POST /api/auth/reset-password` - Validates code (must be within 15 minutes)

## Testing

After restarting the backend:

1. **Request verification code:**
   ```
   POST /api/auth/send-verification-code
   { "email": "user@example.com" }
   ```

2. **Code expires in 15 minutes:**
   - Code is valid for exactly 15 minutes
   - After 15 minutes, code is rejected as expired

3. **Verify code works:**
   ```
   POST /api/auth/register
   {
     "email": "user@example.com",
     "verificationCode": "123456",
     ...
   }
   ```

## Status

✅ **Fixed** - Verification codes now expire in 15 minutes, matching frontend expectations.

---

**Next Step:** Restart backend for changes to take effect.

