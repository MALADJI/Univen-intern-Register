# Fix: Password with Special Characters (@ symbols)

## 🔍 Issue

Your password `Kuli@982807@ac@za` contains multiple `@` symbols, which can sometimes cause issues with Spring Boot property parsing.

## ✅ Solution 1: Use Environment Variables (RECOMMENDED)

This is the **best and most secure** approach:

### Step 1: Set Environment Variable

**Windows PowerShell:**
```powershell
$env:MAIL_USERNAME="Kulani.baloyi@univen.ac.za"
$env:MAIL_PASSWORD="Kuli@982807@ac@za"
```

**Windows Command Prompt:**
```cmd
set MAIL_USERNAME=Kulani.baloyi@univen.ac.za
set MAIL_PASSWORD=Kuli@982807@ac@za
```

**Linux/Mac:**
```bash
export MAIL_USERNAME="Kulani.baloyi@univen.ac.za"
export MAIL_PASSWORD="Kuli@982807@ac@za"
```

### Step 2: Update application.properties

Update your `application.properties` to use environment variables:

```properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

**Note:** Remove the default values after the colon (`:`) so it only uses environment variables.

### Step 3: Restart Application

Restart your Spring Boot application. The environment variables will be used automatically.

---

## ✅ Solution 2: Keep in application.properties (If Environment Variables Don't Work)

Spring Boot should handle `@` symbols in properties files, but if you encounter issues:

### Option A: Use Quotes (Try This First)

```properties
spring.mail.password="Kuli@982807@ac@za"
```

### Option B: Keep As-Is (Usually Works)

```properties
spring.mail.password=Kuli@982807@ac@za
```

Spring Boot's property parser should handle this correctly.

### Option C: URL Encode (Last Resort)

If the above don't work, URL-encode the password:
- `@` becomes `%40`
- Password: `Kuli%40982807%40ac%40za`

```properties
spring.mail.password=Kuli%40982807%40ac%40za
```

**Note:** This is usually not necessary for Spring Boot properties.

---

## 🧪 Testing

### Test 1: Check Environment Variable is Set

**Windows PowerShell:**
```powershell
echo $env:MAIL_PASSWORD
```

**Windows Command Prompt:**
```cmd
echo %MAIL_PASSWORD%
```

**Expected Output:** `Kuli@982807@ac@za`

### Test 2: Check Application Startup

When you start the application, check the console for:

**✅ Success:**
```
===========================================
✓ SMTP CONFIGURED SUCCESSFULLY
  Host: smtp.office365.com
  Port: 587
  Username: Kulani.baloyi@univen.ac.za
  Mail Enabled: true
===========================================
```

**❌ If you see:**
```
⚠ SMTP NOT FULLY CONFIGURED
  Password Set: false
```

This means the password wasn't read correctly.

### Test 3: Send Test Email

Try sending a verification code:
```json
POST http://localhost:8082/api/auth/send-verification-code
{
  "email": "test@univen.ac.za"
}
```

Check console for:
- ✅ `✓ EMAIL SENT SUCCESSFULLY` - Password is correct
- ❌ `✗ FAILED TO SEND EMAIL: Authentication failed` - Password issue

---

## 🔒 Security Best Practices

### For Development:
- ✅ Using environment variables is better than hardcoding
- ⚠️ Still visible in process list, but better than in files

### For Production:
- ✅ Use secrets management (Azure Key Vault, AWS Secrets Manager, etc.)
- ✅ Never commit passwords to Git
- ✅ Use environment variables or encrypted properties
- ✅ Rotate passwords regularly

---

## 📋 Quick Fix Checklist

- [ ] Set `MAIL_PASSWORD` environment variable
- [ ] Update `application.properties` to use `${MAIL_PASSWORD}`
- [ ] Restart application
- [ ] Check console for "✓ SMTP CONFIGURED SUCCESSFULLY"
- [ ] Test sending email
- [ ] Verify email received

---

## 🐛 Troubleshooting

### Issue: Environment Variable Not Working

**Check:**
1. Variable is set in the same terminal/session where you start the app
2. No spaces around `=` sign: `$env:MAIL_PASSWORD="value"` ✅
3. Restart application after setting variable

**Solution:**
- Set variable, then start app in the same terminal
- Or set it system-wide (Windows: System Properties → Environment Variables)

### Issue: Password Still Not Working

**Try:**
1. Verify password is correct (try logging into Outlook web with same credentials)
2. Check if Office 365 requires App Password (if 2FA enabled)
3. Try different SMTP host: `smtp.univen.ac.za`

### Issue: "Authentication failed"

**Possible causes:**
1. Wrong password
2. Office 365 requires App Password
3. Account locked
4. Special characters not handled correctly

**Solutions:**
1. Use environment variables (Solution 1 above)
2. Generate App Password if 2FA is enabled
3. Verify password works by logging into Outlook web

---

## ✅ Recommended Approach

**For your password `Kuli@982807@ac@za`:**

1. **Use Environment Variables** (Best):
   ```powershell
   $env:MAIL_PASSWORD="Kuli@982807@ac@za"
   ```
   ```properties
   spring.mail.password=${MAIL_PASSWORD}
   ```

2. **If that doesn't work, try quotes in properties:**
   ```properties
   spring.mail.password="Kuli@982807@ac@za"
   ```

3. **Last resort - URL encode:**
   ```properties
   spring.mail.password=Kuli%40982807%40ac%40za
   ```

---

**Most likely, Solution 1 (Environment Variables) will work perfectly!**

