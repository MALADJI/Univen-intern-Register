# Quick Start Guide: Environment Variables

## ✅ You've Set the Variables Correctly!

Your PowerShell commands are correct:
```powershell
$env:MAIL_USERNAME="Kulani.baloyi@univen.ac.za"
$env:MAIL_PASSWORD="Kuli@982807@ac@za"
```

## 🚀 Next Steps

### Step 1: Verify Variables Are Set (Optional)

Check that the variables are set:
```powershell
echo $env:MAIL_USERNAME
echo $env:MAIL_PASSWORD
```

**Expected Output:**
```
Kulani.baloyi@univen.ac.za
Kuli@982807@ac@za
```

### Step 2: Start Your Application

**IMPORTANT:** Start the application in the **SAME PowerShell window** where you set the variables:

```powershell
# Make sure you're in the project directory
cd C:\Users\kulani.baloyi\Downloads\intern-register

# Start the application
mvn spring-boot:run
```

Or if you're using an IDE:
- Make sure the IDE is launched from the same terminal, OR
- Set the environment variables in your IDE's run configuration

### Step 3: Check Console Output

When the application starts, look for:

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

This means the environment variable wasn't read. Make sure:
1. Variables are set in the same terminal
2. Application is started in the same terminal
3. No typos in variable names

---

## 📝 Important Notes

### Session-Specific Variables

The `$env:` variables you set are **session-specific**:
- ✅ They work for the current PowerShell session
- ❌ They're lost when you close the terminal
- ✅ You need to set them again in a new terminal

### Setting Permanently (Optional)

If you want to set them permanently (so you don't have to set them every time):

**Option 1: User Environment Variables (Recommended)**
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Go to "Advanced" tab → "Environment Variables"
3. Under "User variables", click "New"
4. Add:
   - Variable name: `MAIL_USERNAME`
   - Variable value: `Kulani.baloyi@univen.ac.za`
5. Repeat for `MAIL_PASSWORD`
6. Restart your IDE/terminal

**Option 2: PowerShell Profile (For PowerShell Only)**
```powershell
# Add to your PowerShell profile
notepad $PROFILE

# Add these lines:
$env:MAIL_USERNAME="Kulani.baloyi@univen.ac.za"
$env:MAIL_PASSWORD="Kuli@982807@ac@za"
```

---

## 🧪 Quick Test

After starting the application:

1. **Send a test verification code:**
   ```json
   POST http://localhost:8082/api/auth/send-verification-code
   {
     "email": "test@univen.ac.za"
   }
   ```

2. **Check console for:**
   - `✓ EMAIL SENT SUCCESSFULLY` ✅
   - Or `✗ FAILED TO SEND EMAIL` ❌

3. **Check email inbox** for the verification code

---

## ✅ Summary

**What you did:** ✅ Correct!
```powershell
$env:MAIL_USERNAME="Kulani.baloyi@univen.ac.za"
$env:MAIL_PASSWORD="Kuli@982807@ac@za"
```

**What to do next:**
1. ✅ Keep the same PowerShell window open
2. ✅ Start your application in that same window
3. ✅ Check console for "✓ SMTP CONFIGURED SUCCESSFULLY"
4. ✅ Test sending an email

**You're all set!** Just start your application now. 🚀

