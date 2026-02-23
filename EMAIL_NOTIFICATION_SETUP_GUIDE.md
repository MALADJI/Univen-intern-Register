# Email Notification Setup Guide

## ✅ What Has Been Implemented

### 1. Email Notification Service
- ✅ Extended `EmailService` with notification methods
- ✅ Created `NotificationService` to handle email notifications
- ✅ Integrated notifications into `LeaveRequestController`

### 2. Notification Types

#### Leave Request Notifications:
1. **Leave Request Submitted** - Sent to intern when they submit a leave request
2. **Leave Request Approved** - Sent to intern when their request is approved
3. **Leave Request Rejected** - Sent to intern when their request is rejected
4. **New Leave Request** - Sent to supervisor when a new leave request is submitted

#### Attendance Notifications:
5. **Attendance Alert** - Can be used for attendance-related alerts (optional)

### 3. Notification Preferences
- ✅ Respects user notification preferences from database
- ✅ Checks `emailLeaveUpdates` and `emailAttendanceAlerts` flags
- ✅ Only sends emails if user has enabled notifications

---

## 📧 Email Configuration

### Step 1: Configure SMTP in `application.properties`

Update these settings in `src/main/resources/application.properties`:

```properties
# Email Configuration
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
```

### Step 2: Gmail Setup (if using Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Intern Register System"
   - Copy the 16-character password
   - Use this password in `spring.mail.password`

### Step 3: Other SMTP Providers

#### Outlook/Office 365:
```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

#### Custom SMTP:
```properties
spring.mail.host=your-smtp-server.com
spring.mail.port=587
spring.mail.username=your-email@domain.com
spring.mail.password=your-password
```

---

## 🔔 How It Works

### Automatic Notifications

1. **When Intern Submits Leave Request:**
   - ✅ Email sent to intern (confirmation)
   - ✅ Email sent to supervisor (notification of new request)

2. **When Supervisor/Admin Approves Leave Request:**
   - ✅ Email sent to intern (approval notification)

3. **When Supervisor/Admin Rejects Leave Request:**
   - ✅ Email sent to intern (rejection notification with reason)

### Notification Preferences

Users can control notifications via:
- `GET /api/settings/notifications` - Get preferences
- `PUT /api/settings/notifications` - Update preferences

**Settings:**
- `emailLeaveUpdates` - Enable/disable leave request notifications
- `emailAttendanceAlerts` - Enable/disable attendance alerts
- `frequency` - INSTANT, DAILY, or WEEKLY (currently all are INSTANT)

---

## 🧪 Testing

### Test Email Configuration

1. **Start the server** with email enabled
2. **Submit a leave request** as an intern
3. **Check console logs** for email sending status
4. **Check email inbox** for notification

### Test Without SMTP

If email is not configured (`mail.enabled=false`), notifications will:
- ✅ Still work (non-fatal)
- ✅ Display in console logs
- ✅ Not block the main operation

### Manual Test Endpoint (Optional)

You can create a test endpoint to send test emails:

```java
@PostMapping("/test-email")
public ResponseEntity<?> testEmail(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    emailService.sendLeaveRequestSubmitted(email, "Test Intern", "2024-12-01", "2024-12-05", "ANNUAL");
    return ResponseEntity.ok(Map.of("message", "Test email sent"));
}
```

---

## 📋 Email Templates

### Leave Request Submitted
```
Subject: Leave Request Submitted - Intern Register System

Hello [Intern Name],

Your leave request has been submitted successfully.

Details:
- From Date: [Date]
- To Date: [Date]
- Leave Type: [Type]
- Status: PENDING

Your supervisor will review your request and you will be notified once a decision is made.

Best regards,
Intern Register System
```

### Leave Request Approved
```
Subject: Leave Request Approved - Intern Register System

Hello [Intern Name],

Your leave request has been APPROVED.

Details:
- From Date: [Date]
- To Date: [Date]
- Leave Type: [Type]
- Approved By: [Supervisor Name]
- Status: APPROVED

Please ensure you have completed all necessary arrangements before your leave period.

Best regards,
Intern Register System
```

### Leave Request Rejected
```
Subject: Leave Request Rejected - Intern Register System

Hello [Intern Name],

Your leave request has been REJECTED.

Details:
- From Date: [Date]
- To Date: [Date]
- Leave Type: [Type]
- Rejected By: [Supervisor Name]
- Status: REJECTED
- Reason: [Reason]

If you have any questions or concerns, please contact your supervisor.

Best regards,
Intern Register System
```

---

## ✅ Status

- ✅ Email service extended with notification methods
- ✅ Notification service created
- ✅ Integrated into leave request controller
- ✅ Respects user preferences
- ✅ Non-fatal (won't break if email fails)
- ✅ Console fallback when email not configured

---

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check `mail.enabled=true`** in application.properties
2. **Verify SMTP credentials** are correct
3. **Check console logs** for error messages
4. **Test SMTP connection** using a simple email client
5. **Check firewall** isn't blocking port 587

### Common Errors

**"Authentication failed":**
- Check username/password
- For Gmail, use App Password (not regular password)
- Enable "Less secure app access" (if not using App Password)

**"Connection timeout":**
- Check SMTP host and port
- Verify firewall settings
- Check network connectivity

**"Email sent but not received":**
- Check spam folder
- Verify recipient email address
- Check email server logs

---

## 📝 Next Steps

1. **Configure SMTP** in application.properties
2. **Set `mail.enabled=true`**
3. **Test by submitting a leave request**
4. **Check email inbox** for notifications
5. **Adjust email templates** if needed

---

**Email notifications are now fully integrated and ready to use!** ✅

