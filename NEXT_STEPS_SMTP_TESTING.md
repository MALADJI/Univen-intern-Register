# Next Steps: Testing SMTP Configuration

## ✅ Configuration Complete

You've set:
- ✅ Email: `Kulani.baloyi@univen.ac.za`
- ✅ Password: Set in `application.properties`
- ✅ SMTP Host: `smtp.office365.com`
- ✅ Port: `587`
- ✅ Email Domain Validation: Only `@univen.ac.za` emails allowed

---

## 🚀 Step 1: Start the Application

1. **Restart your Spring Boot application** to load the new SMTP settings

2. **Check the console output** when the application starts. You should see:

   **✅ If configured correctly:**
   ```
   ===========================================
   ✓ SMTP CONFIGURED SUCCESSFULLY
     Host: smtp.office365.com
     Port: 587
     Username: Kulani.baloyi@univen.ac.za
     Mail Enabled: true
   ===========================================
   ```

   **⚠️ If there's an issue:**
   ```
   ===========================================
   ⚠ SMTP NOT FULLY CONFIGURED
     Mail Enabled: true
     Username Set: true
     Password Set: true
     Email will fallback to console output
   ===========================================
   ```

---

## 🧪 Step 2: Test Email Sending

### Option A: Test via User Registration (Recommended)

1. **Open your frontend** (or use Postman/API client)

2. **Send a verification code:**
   ```json
   POST http://localhost:8082/api/auth/send-verification-code
   Content-Type: application/json
   
   {
     "email": "test@univen.ac.za"
   }
   ```

3. **Check the console** for email sending status:
   - ✅ Success: `✓ EMAIL SENT SUCCESSFULLY`
   - ❌ Error: `✗ FAILED TO SEND EMAIL: [error message]`

4. **Check the email inbox** (`test@univen.ac.za`) for the verification code

### Option B: Test via Leave Request (If you have users)

1. Have an intern submit a leave request
2. Check supervisor's email for notification
3. Check intern's email for confirmation

---

## 🔍 Step 3: Verify Email Domain Validation

Test that only `@univen.ac.za` emails work:

### ✅ Test Valid Email:
```json
POST http://localhost:8082/api/auth/send-verification-code
{
  "email": "test@univen.ac.za"
}
```
**Expected:** 200 OK with verification code

### ❌ Test Invalid Email:
```json
POST http://localhost:8082/api/auth/send-verification-code
{
  "email": "test@gmail.com"
}
```
**Expected:** 403 Forbidden with error message:
```json
{
  "error": "Invalid email domain",
  "message": "Only University of Venda (@univen.ac.za) email addresses are allowed..."
}
```

---

## 🐛 Troubleshooting

### Issue: "SMTP NOT FULLY CONFIGURED"

**Possible causes:**
1. Password contains special characters that need escaping
2. Environment variables overriding properties
3. Application didn't restart

**Solutions:**
1. **Use Environment Variables (Recommended for passwords with special characters):**
   ```powershell
   # Windows PowerShell
   $env:MAIL_PASSWORD="Kuli@982807@ac@za"
   ```
   Then in `application.properties`, use:
   ```properties
   spring.mail.password=${MAIL_PASSWORD}
   ```
   This avoids special character parsing issues.

2. **Or Escape Special Characters in application.properties:**
   - Spring Boot usually handles `@` in properties, but if issues occur:
   - Try wrapping in quotes: `spring.mail.password="Kuli@982807@ac@za"`
   - Or use the value as-is (Spring Boot should handle it)

3. Remove environment variables if set: `$env:MAIL_PASSWORD=$null`
4. Restart the application

### Issue: "Authentication failed" or "Login failed"

**Possible causes:**
1. Wrong password
2. Office 365 requires App Password (if 2FA enabled)
3. Account locked or needs password reset

**Solutions:**
1. Verify password is correct
2. If 2FA is enabled on Office 365, generate an App Password
3. Try logging into Outlook web with the same credentials

### Issue: "Connection timeout"

**Possible causes:**
1. Wrong SMTP host
2. Firewall blocking port 587
3. Network issues

**Solutions:**
1. Try `smtp.univen.ac.za` instead of `smtp.office365.com`
2. Contact Univen IT for correct SMTP settings
3. Check if port 587 is open

### Issue: Emails go to Spam

**Solutions:**
1. Check spam/junk folder
2. Add `Kulani.baloyi@univen.ac.za` to contacts
3. Mark as "Not Spam"

---

## 📋 Quick Test Checklist

- [ ] Application started successfully
- [ ] Console shows "✓ SMTP CONFIGURED SUCCESSFULLY"
- [ ] Test email sent to `test@univen.ac.za` ✅
- [ ] Verification code received in email ✅
- [ ] Invalid email (`@gmail.com`) rejected ✅
- [ ] Valid email (`@univen.ac.za`) accepted ✅

---

## 🎯 What to Test Next

Once SMTP is working:

1. **User Registration Flow:**
   - Send verification code → Check email
   - Verify code → Register user
   - Check all emails are sent correctly

2. **Password Reset Flow:**
   - Request password reset → Check email
   - Verify code → Reset password
   - Check email notifications

3. **Leave Request Notifications:**
   - Submit leave request → Check intern email
   - Check supervisor email for notification
   - Approve/reject → Check intern email

4. **Admin Invitations:**
   - Send admin invite → Check email
   - Create admin account → Check credentials email

---

## 🔒 Security Note

**For Production:**
- ⚠️ **Don't commit passwords to Git**
- ✅ Use environment variables instead:
  ```powershell
  $env:MAIL_PASSWORD="your-password"
  ```
- ✅ Add `application.properties` to `.gitignore` if it contains passwords
- ✅ Use secrets management for production deployments

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Console shows "✓ SMTP CONFIGURED SUCCESSFULLY"
2. ✅ Console shows "✓ EMAIL SENT SUCCESSFULLY" when sending emails
3. ✅ Emails are received in inbox (not just console)
4. ✅ Only `@univen.ac.za` emails can register
5. ✅ All email notifications work (verification, leave requests, etc.)

---

**Ready to test?** Start your application and check the console output!

