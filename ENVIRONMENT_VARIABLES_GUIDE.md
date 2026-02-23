# Environment Variables Setup Guide

## 📧 Email Configuration for SMTP

To enable email functionality, you need to set environment variables **before** starting the Spring Boot application.

---

## 🚀 Quick Start (PowerShell)

### Option 1: Use the Script (Recommended)

1. **Run the setup script:**
   ```powershell
   .\SET_ENVIRONMENT_VARIABLES.ps1
   ```

2. **Then start the application:**
   ```powershell
   mvn spring-boot:run
   ```

### Option 2: Quick Start (All-in-One)

Run this single command to set variables and start the app:
```powershell
.\QUICK_START_WITH_EMAIL.ps1
```

### Option 3: Manual Setup

**Copy and paste these commands in PowerShell:**

```powershell
# Set Email Username
$env:MAIL_USERNAME = "Kulani.baloyi@univen.ac.za"

# Set Email Password
$env:MAIL_PASSWORD = "Kuli@982807@ac@za"

# Verify they're set
Write-Host "MAIL_USERNAME: $env:MAIL_USERNAME"
Write-Host "MAIL_PASSWORD: [HIDDEN]"

# Start the application


```

---

## ⚠️ Important Notes

### 1. **Session-Specific Variables**
- Environment variables set in PowerShell are **only valid for that session**
- If you close the PowerShell window, you need to set them again
- Each new terminal window needs the variables set

### 2. **Special Characters in Password**
If your password contains special characters (like `@`, `$`, `#`, etc.), wrap it in quotes:

```powershell
# ✅ Correct - with quotes
$env:MAIL_PASSWORD = "Kuli@982807@ac@za"

# ❌ Wrong - without quotes (will fail)
$env:MAIL_PASSWORD = Kuli@982807@ac@za
```

### 3. **Keep Terminal Open**
- **Keep the PowerShell window open** while the application is running
- If you close it, the environment variables are lost
- The application will continue running, but email won't work

---

## 🔍 Verify Variables Are Set

Check if variables are set correctly:

```powershell
# Check username
echo $env:MAIL_USERNAME

# Check password (will show the value - be careful!)
echo $env:MAIL_PASSWORD
```

**Expected Output:**
```
dzulani.monyayi@univen.ac.za
NdirendaPhindulo@545503
```

---

## ✅ Success Indicators

When the application starts, you should see in the console:

**If variables are set correctly:**
```
===========================================
✓ SMTP CONFIGURED SUCCESSFULLY
  Host: smtp.office365.com
  Port: 587
  Username: dzulani.monyayi@univen.ac.za
  Mail Enabled: true
===========================================
```

**If variables are NOT set:**
```
===========================================
⚠ SMTP NOT FULLY CONFIGURED
  Mail Enabled: true
  Username Set: true
  Password Set: false
  Email will fallback to console output
===========================================
```

---

## 🔧 Troubleshooting

### Problem: "Could not resolve placeholder 'MAIL_PASSWORD'"
**Solution:** You forgot to set the environment variable. Run the setup script again.

### Problem: Email not sending
**Solution:** 
1. Check if variables are set: `echo $env:MAIL_PASSWORD`
2. Verify password is correct (no typos)
3. Check application console for SMTP configuration status

### Problem: Password with special characters not working
**Solution:** Wrap the password in double quotes:
```powershell
$env:MAIL_PASSWORD = "Your@Password#Here"
```

### Problem: Variables lost after closing terminal
**Solution:** This is normal! Environment variables are session-specific. You need to:
1. Set them again in a new terminal
2. Or use the script: `.\SET_ENVIRONMENT_VARIABLES.ps1`

---

## 📝 Alternative: Permanent Setup (Optional)

If you want to set these permanently (not recommended for passwords):

### Windows System Environment Variables:
1. Open **System Properties** → **Environment Variables**
2. Add `MAIL_USERNAME` and `MAIL_PASSWORD` to **User variables**
3. Restart your terminal/IDE

**⚠️ Security Warning:** Storing passwords in system environment variables is less secure. Use session variables instead.

---

## 🎯 Current Configuration

Based on your `application.properties`:

- **SMTP Host:** `smtp.office365.com`
- **SMTP Port:** `587`
- **Email Address:** `dzulani.monyayi@univen.ac.za`
- **From Address:** `dzulani.monyayi@univen.ac.za`
- **Allowed Domains:** `@univen.ac.za` only

---

## 📚 Related Files

- `src/main/resources/application.properties` - Main configuration
- `SET_ENVIRONMENT_VARIABLES.ps1` - Setup script
- `QUICK_START_WITH_EMAIL.ps1` - All-in-one script

---

## ✅ Quick Reference

```powershell
# Set variables
$env:MAIL_USERNAME = "dzulani.monyayi@univen.ac.za"
$env:MAIL_PASSWORD = "NdirendaPhindulo@545503"

# Start app
mvn spring-boot:run
```

That's it! 🚀