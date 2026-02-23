# Complete Email Functionality Guide

## ✅ All Email Features Implemented

### 1. Admin Invitation Email
- **Endpoint:** `POST /api/super-admin/admins/send-invite`
- **Purpose:** Send invitation email to admin before creating account
- **Authorization:** Only SUPER_ADMIN
- **Request:**
  ```json
  {
    "email": "admin@example.com",
    "name": "Admin Name" // optional
  }
  ```
- **Response:**
  ```json
  {
    "message": "Invitation email sent successfully",
    "email": "admin@example.com"
  }
  ```

### 2. Admin Account Creation Email
- **Automatic:** Sent when Super Admin creates a new admin account
- **Contains:** Login credentials (email, password), system URL
- **Triggered:** Automatically in `POST /api/super-admin/admins`

### 3. Email Verification (Sign Up)
- **Send Code:** `POST /api/auth/send-verification-code`
  - Request: `{ "email": "user@example.com" }`
  - Sends 6-digit verification code
  - Code expires in 2 minutes (configurable)
  
- **Verify Code:** `POST /api/auth/verify-code`
  - Request: `{ "email": "user@example.com", "code": "123456" }`
  - Validates code and marks as used
  
- **Register:** `POST /api/auth/register`
  - Requires verified code
  - Creates user account after verification

### 4. Password Reset Email
- **Request Reset:** `POST /api/auth/forgot-password`
  - Request: `{ "email": "user@example.com" }`
  - Sends 6-digit verification code
  - Code expires in 2 minutes
  
- **Reset Password:** `POST /api/auth/reset-password`
  - Request: `{ "email": "user@example.com", "code": "123456", "newPassword": "newpass123" }`
  - Validates code and updates password

### 5. Leave Request Notifications
- **Submitted:** Sent to intern when they submit leave request
- **Approved:** Sent to intern when request is approved
- **Rejected:** Sent to intern when request is rejected
- **To Supervisor:** Sent to supervisor when new leave request is submitted

### 6. Attendance Alerts
- **Optional:** Can be used for attendance-related notifications

---

## 📧 Email Configuration

### Step 1: Update `application.properties`

```properties
# Email Configuration (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# Email Settings
mail.from.address=noreply@univen.ac.za
mail.enabled=true

# System URL (for email links)
app.system.url=http://localhost:4200
```

### Step 2: Enable Email

Set `mail.enabled=true` in `application.properties` to enable email sending.

If `mail.enabled=false`, emails will be logged to console instead.

### Step 3: Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Intern Register System"
   - Copy the 16-character password
   - Use this in `spring.mail.password`

### Step 4: Test Email

1. Restart the Spring Boot application
2. Check console logs for email sending status
3. If email is not configured, codes will be displayed in console

---

## 🔧 Frontend Integration

### Send Admin Invite

```typescript
// In super-admin-dashboard.component.ts
sendAdminInvite(email: string, name?: string): void {
  this.loading = true;
  this.superAdminService.sendAdminInvite(email, name).subscribe({
    next: () => {
      this.snackBar.open('Invitation email sent successfully', 'Close', { duration: 3000 });
      this.loading = false;
    },
    error: (error) => {
      console.error('Error sending invite:', error);
      const errorMessage = error.error?.message || 'Failed to send invitation';
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      this.loading = false;
    }
  });
}
```

### Email Verification (Sign Up)

```typescript
// Send verification code
sendVerificationCode(email: string): Observable<any> {
  return this.apiService.post('auth/send-verification-code', { email });
}

// Verify code
verifyCode(email: string, code: string): Observable<any> {
  return this.apiService.post('auth/verify-code', { email, code });
}

// Register
register(userData: any): Observable<any> {
  return this.apiService.post('auth/register', userData);
}
```

### Password Reset

```typescript
// Request password reset
forgotPassword(email: string): Observable<any> {
  return this.apiService.post('auth/forgot-password', { email });
}

// Reset password
resetPassword(email: string, code: string, newPassword: string): Observable<any> {
  return this.apiService.post('auth/reset-password', {
    email,
    code,
    newPassword
  });
}
```

---

## 📋 Email Flow Summary

### Admin Invitation Flow:
1. Super Admin clicks "Send Invite" → `POST /api/super-admin/admins/send-invite`
2. Invitation email sent to admin
3. Super Admin creates account → `POST /api/super-admin/admins`
4. Account creation email sent with credentials

### Sign Up Flow:
1. User enters email → `POST /api/auth/send-verification-code`
2. Verification code sent via email
3. User enters code → `POST /api/auth/verify-code`
4. User registers → `POST /api/auth/register` (requires verified code)

### Password Reset Flow:
1. User enters email → `POST /api/auth/forgot-password`
2. Reset code sent via email
3. User enters code and new password → `POST /api/auth/reset-password`
4. Password updated

---

## ✅ Testing Checklist

- [ ] Admin invitation email sent successfully
- [ ] Admin account creation email sent with credentials
- [ ] Verification code email sent for sign up
- [ ] Code verification works correctly
- [ ] Registration requires verified code
- [ ] Password reset code email sent
- [ ] Password reset works with valid code
- [ ] Leave request notifications sent
- [ ] All emails respect notification preferences

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check `mail.enabled`:** Must be `true` in `application.properties`
2. **Check SMTP settings:** Verify host, port, username, password
3. **Check console logs:** Look for email sending errors
4. **Gmail App Password:** Must use App Password, not regular password
5. **Firewall/Network:** Ensure SMTP port (587) is not blocked

### Codes Not Received

1. **Check console:** Codes are always logged to console
2. **Check spam folder:** Emails might be in spam
3. **Verify email address:** Ensure correct email in request
4. **Check expiration:** Codes expire in 2 minutes (configurable)

### Email Configuration Not Working

1. **Restart application:** After changing `application.properties`
2. **Check logs:** Look for SMTP connection errors
3. **Test with different provider:** Try Outlook or custom SMTP
4. **Verify credentials:** Double-check username and password

---

## 📝 Notes

- All emails fall back to console output if email is not configured
- Verification codes are always displayed in console for testing
- Email sending is non-blocking (won't fail requests if email fails)
- Notification preferences are respected for leave/attendance emails
- Admin invitation and account creation emails are always sent (regardless of preferences)

