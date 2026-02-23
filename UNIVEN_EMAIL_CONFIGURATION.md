# Univen Email Configuration Guide

## ✅ Configuration Complete

The system has been configured to:
1. ✅ Use `Kulani.baloyi@univen.ac.za` as the SMTP sender email
2. ✅ Restrict registration to only `@univen.ac.za` email addresses
3. ✅ Validate email domain in all registration endpoints

---

## 📧 SMTP Configuration

### Current Settings

**File:** `src/main/resources/application.properties`

```properties
# From address (sender email address)
mail.from.address=Kulani.baloyi@univen.ac.za

# SMTP Server Configuration for Univen (Office 365)
spring.mail.host=smtp.office365.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME:Kulani.baloyi@univen.ac.za}
spring.mail.password=${MAIL_PASSWORD:your-password-here}
```

### Setup Steps

1. **Set Environment Variables (Recommended):**
   
   **Windows (PowerShell):**
   ```powershell
   $env:MAIL_USERNAME="Kulani.baloyi@univen.ac.za"
   $env:MAIL_PASSWORD="your-actual-password"
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   set MAIL_USERNAME=Kulani.baloyi@univen.ac.za
   set MAIL_PASSWORD=your-actual-password
   ```

2. **Or Update `application.properties` directly:**
   ```properties
   spring.mail.username=Kulani.baloyi@univen.ac.za
   spring.mail.password=your-actual-password
   ```

3. **If Office 365 doesn't work, try Univen's SMTP server:**
   ```properties
   spring.mail.host=smtp.univen.ac.za
   spring.mail.port=587
   ```
   *(Contact Univen IT department for correct SMTP settings)*

---

## 🔒 Email Domain Validation

### What's Implemented

The system now **only allows** `@univen.ac.za` email addresses for registration:

1. ✅ **Verification Code Endpoint** (`/api/auth/send-verification-code`)
   - Validates email domain before sending verification code
   - Returns error if email is not `@univen.ac.za`

2. ✅ **Registration Endpoint** (`/api/auth/register`)
   - Validates email domain before creating account
   - Returns error if email is not `@univen.ac.za`

3. ✅ **Check Email Endpoint** (`/api/auth/check-email`)
   - Validates email domain before checking availability
   - Returns error if email is not `@univen.ac.za`

### Error Messages

**Invalid Email Domain:**
```json
{
  "error": "Invalid email domain",
  "message": "Only University of Venda (@univen.ac.za) email addresses are allowed for registration. Please use your Univen staff email address."
}
```

**HTTP Status:** 403 (Forbidden)

---

## 🧪 Testing

### Test Email Domain Validation

1. **Try registering with non-Univen email:**
   ```json
   POST /api/auth/send-verification-code
   {
     "email": "test@gmail.com"
   }
   ```
   **Expected Response:**
   ```json
   {
     "error": "Invalid email domain",
     "message": "Only University of Venda (@univen.ac.za) email addresses are allowed..."
   }
   ```

2. **Try registering with Univen email:**
   ```json
   POST /api/auth/send-verification-code
   {
     "email": "test@univen.ac.za"
   }
   ```
   **Expected Response:**
   ```json
   {
     "message": "Verification code sent to test@univen.ac.za",
     "code": "123456"
   }
   ```

### Test SMTP Configuration

1. **Start the application**
2. **Check console output:**
   - If configured correctly:
     ```
     ✓ SMTP CONFIGURED SUCCESSFULLY
       Host: smtp.office365.com
       Port: 587
       Username: Kulani.baloyi@univen.ac.za
       Mail Enabled: true
     ```
   - If not configured:
     ```
     ⚠ SMTP NOT FULLY CONFIGURED
       Email will fallback to console output
     ```

3. **Send a test verification code:**
   - Use a valid `@univen.ac.za` email
   - Check if email is received (or check console for fallback)

---

## 📋 Configuration Properties

### Email Domain Restriction

**File:** `src/main/resources/application.properties`

```properties
# Allowed email domains for registration (comma-separated)
mail.allowed.domains=univen.ac.za
```

Currently hardcoded to `@univen.ac.za` in the code. To make it configurable, you can:

1. Read from `application.properties`:
   ```java
   @Value("${mail.allowed.domains:univen.ac.za}")
   private String allowedDomains;
   ```

2. Split and validate:
   ```java
   String[] domains = allowedDomains.split(",");
   boolean isValid = Arrays.stream(domains)
       .anyMatch(domain -> email.endsWith("@" + domain.trim()));
   ```

---

## 🔧 Troubleshooting

### SMTP Connection Issues

**Problem:** Cannot connect to SMTP server

**Solutions:**
1. **Verify SMTP host:**
   - Try `smtp.office365.com` (Office 365)
   - Try `smtp.univen.ac.za` (Univen's server)
   - Contact Univen IT for correct settings

2. **Check port:**
   - Port 587 (TLS/STARTTLS) - most common
   - Port 465 (SSL) - alternative
   - Port 25 - usually blocked by ISPs

3. **Verify credentials:**
   - Ensure email and password are correct
   - For Office 365, may need App Password if 2FA is enabled

4. **Check firewall:**
   - Ensure port 587 is not blocked
   - Some networks block SMTP ports

### Email Domain Validation Not Working

**Problem:** Non-Univen emails can still register

**Check:**
1. Ensure code changes are compiled and deployed
2. Check console logs for validation errors
3. Verify email is being converted to lowercase: `email.trim().toLowerCase()`
4. Test with different email formats:
   - `test@univen.ac.za` ✅
   - `test@UNIVEN.AC.ZA` ✅ (should work - converted to lowercase)
   - `test@gmail.com` ❌
   - `test@univen.co.za` ❌

---

## ✅ Summary

- ✅ **SMTP configured** for `Kulani.baloyi@univen.ac.za`
- ✅ **Email domain validation** implemented
- ✅ **Only `@univen.ac.za` emails** can register
- ✅ **Error messages** are user-friendly
- ✅ **All registration endpoints** protected

**Next Steps:**
1. Set `MAIL_PASSWORD` environment variable with your actual password
2. Test SMTP connection
3. If Office 365 doesn't work, contact Univen IT for SMTP server details
4. Test registration with both valid and invalid email domains

---

**Last Updated:** 2025-11-17

