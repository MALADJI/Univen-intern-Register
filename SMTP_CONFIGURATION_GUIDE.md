# SMTP Configuration Guide

## ✅ Current Status

**SMTP is configured but needs actual credentials to work.**

The system is set up with:
- ✅ Spring Mail dependency in `pom.xml`
- ✅ `MailConfig.java` configuration class
- ✅ `EmailService.java` with all email methods
- ✅ `application.properties` with SMTP settings
- ⚠️ **Placeholder credentials need to be replaced**

---

## 🔧 Configuration Steps

### Step 1: Choose Your SMTP Provider

#### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Intern Register System"
   - Copy the 16-character password

3. **Update `application.properties`:**
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-16-char-app-password
   mail.enabled=true
   mail.from.address=your-email@gmail.com
   ```

#### Option B: Outlook/Office 365

1. **Update `application.properties`:**
   ```properties
   spring.mail.host=smtp.office365.com
   spring.mail.port=587
   spring.mail.username=your-email@outlook.com
   spring.mail.password=your-password
   mail.enabled=true
   mail.from.address=your-email@outlook.com
   ```

#### Option C: Custom SMTP Server

1. **Update `application.properties`:**
   ```properties
   spring.mail.host=smtp.yourdomain.com
   spring.mail.port=587  # or 465 for SSL
   spring.mail.username=your-email@yourdomain.com
   spring.mail.password=your-password
   mail.enabled=true
   mail.from.address=your-email@yourdomain.com
   ```

---

### Step 2: Use Environment Variables (Recommended for Production)

For security, use environment variables instead of hardcoding credentials:

**Windows (PowerShell):**
```powershell
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="your-app-password"
```

**Windows (Command Prompt):**
```cmd
set MAIL_USERNAME=your-email@gmail.com
set MAIL_PASSWORD=your-app-password
```

**Linux/Mac:**
```bash
export MAIL_USERNAME="your-email@gmail.com"
export MAIL_PASSWORD="your-app-password"
```

The `application.properties` already supports this:
```properties
spring.mail.username=${MAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${MAIL_PASSWORD:your-app-password}
```

This will:
- Use `MAIL_USERNAME` environment variable if set
- Fall back to `your-email@gmail.com` if not set

---

### Step 3: Test Email Configuration

1. **Start the application**
2. **Check console output:**
   - If configured correctly, you'll see:
     ```
     ✓ SMTP CONFIGURED SUCCESSFULLY
       Host: smtp.gmail.com
       Port: 587
       Username: your-email@gmail.com
       Mail Enabled: true
     ```
   - If not configured, you'll see:
     ```
     ⚠ SMTP NOT FULLY CONFIGURED
       Email will fallback to console output
     ```

3. **Test by:**
   - Signing up a new user (verification email)
   - Resetting password (reset code email)
   - Submitting a leave request (notification email)

---

## 📧 Email Features Enabled

Once configured, the system will send emails for:

1. ✅ **User Sign-Up Verification** - Verification code
2. ✅ **Password Reset** - Reset code
3. ✅ **Leave Request Submitted** - Notification to intern
4. ✅ **Leave Request Pending** - Notification to supervisor
5. ✅ **Leave Request Approved** - Notification to intern
6. ✅ **Leave Request Rejected** - Notification to intern
7. ✅ **Early Sign-Out Alert** - Notification to supervisor
8. ✅ **Admin Invitation** - Invitation email to admin
9. ✅ **Admin Account Created** - Credentials email to admin
10. ✅ **Supervisor Invitation** - Invitation email to supervisor

---

## 🔒 Security Best Practices

1. **Never commit credentials to Git:**
   - Use environment variables
   - Add `application.properties` to `.gitignore` if it contains credentials
   - Use `application.properties.template` for documentation

2. **Use App Passwords:**
   - For Gmail, use App Passwords (not your main password)
   - For other providers, use dedicated email accounts for system emails

3. **Production Deployment:**
   - Use environment variables or secrets management
   - Consider using services like AWS SES, SendGrid, or Mailgun for production

---

## 🐛 Troubleshooting

### Email Not Sending

1. **Check console logs:**
   - Look for "✓ EMAIL SENT SUCCESSFULLY" or error messages

2. **Verify credentials:**
   - Ensure username and password are correct
   - For Gmail, ensure you're using an App Password (not regular password)

3. **Check firewall/network:**
   - Ensure port 587 (or 465) is not blocked
   - Some networks block SMTP ports

4. **Test SMTP connection:**
   - Try sending a test email manually using the same credentials
   - Use tools like `telnet` or `openssl` to test SMTP connection

### Common Errors

**"Authentication failed":**
- Wrong username/password
- For Gmail, need App Password (not regular password)
- 2FA not enabled (for Gmail)

**"Connection timeout":**
- Firewall blocking port 587
- Wrong SMTP host/port
- Network connectivity issues

**"Mail not enabled":**
- Set `mail.enabled=true` in `application.properties`
- Restart the application

---

## 📝 Configuration File Location

- **Main config:** `src/main/resources/application.properties`
- **Template:** `src/main/resources/application.properties.template`
- **Java config:** `src/main/java/com/internregister/config/MailConfig.java`

---

## ✅ Quick Setup Checklist

- [ ] Choose SMTP provider (Gmail/Outlook/Custom)
- [ ] Get credentials (username + password/app password)
- [ ] Update `application.properties` with credentials
- [ ] Set `mail.enabled=true`
- [ ] Set `mail.from.address` to your email
- [ ] Restart application
- [ ] Check console for "✓ SMTP CONFIGURED SUCCESSFULLY"
- [ ] Test by signing up a new user
- [ ] Verify email received

---

## 📞 Support

If you encounter issues:
1. Check console logs for error messages
2. Verify SMTP credentials are correct
3. Test SMTP connection manually
4. Check firewall/network settings
5. Review this guide for common issues

---

**Last Updated:** 2025-11-17

