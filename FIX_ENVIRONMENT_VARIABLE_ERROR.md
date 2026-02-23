# Fix: Environment Variable Not Set Error

## 🔍 Error

```
Caused by: org.springframework.util.PlaceholderResolutionException: 
Could not resolve placeholder 'MAIL_PASSWORD' in value "${MAIL_PASSWORD}"
```

## 🔍 What This Means

Spring Boot is trying to read the `MAIL_PASSWORD` environment variable, but it's not set, and there's no default value provided.

## ✅ Solution Applied

I've updated `application.properties` to include a default empty value:

**Before:**
```properties
spring.mail.password=${MAIL_PASSWORD}
```

**After:**
```properties
spring.mail.password=${MAIL_PASSWORD:}
```

The `:}` at the end means: "Use `MAIL_PASSWORD` if set, otherwise use empty string".

## 🚀 How It Works Now

1. **If environment variable is set:**
   - Uses the value from `$env:MAIL_PASSWORD`
   - SMTP will be configured

2. **If environment variable is NOT set:**
   - Uses empty string as default
   - Application starts successfully
   - `MailConfig` detects empty password and shows warning
   - Email falls back to console output

## 📋 Next Steps

### Step 1: Set Environment Variables

**In PowerShell (before starting application):**
```powershell
$env:MAIL_USERNAME="Kulani.baloyi@univen.ac.za"
$env:MAIL_PASSWORD="Kuli@982807@ac@za"
```

### Step 2: Start Application

**In the SAME PowerShell window:**
```powershell
mvn spring-boot:run
```

### Step 3: Check Console Output

**✅ If environment variables are set:**
```
===========================================
✓ SMTP CONFIGURED SUCCESSFULLY
  Host: smtp.office365.com
  Port: 587
  Username: Kulani.baloyi@univen.ac.za
  Mail Enabled: true
===========================================
```

**⚠️ If environment variables are NOT set:**
```
===========================================
⚠ SMTP NOT FULLY CONFIGURED
  Mail Enabled: true
  Username Set: true
  Password Set: false
  Email will fallback to console output
===========================================
```

## ✅ Summary

- ✅ **Fixed:** Application can now start even if `MAIL_PASSWORD` is not set
- ✅ **Default:** Empty string if environment variable is missing
- ✅ **Behavior:** `MailConfig` gracefully handles missing password
- ✅ **Result:** Application starts, email falls back to console if password not set

**The application should now start successfully!** Just make sure to set the environment variables in the same terminal before starting the app.

