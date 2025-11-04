# Server Restart Instructions

## ⚠️ IMPORTANT: Restart Required

The security configuration has been updated to fix the 403 Forbidden errors. **You must restart the server** for the changes to take effect.

---

## 🔄 How to Restart the Server

### **Option 1: Using Terminal (Recommended)**

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal where the server is running
   - Or close the terminal window

2. **Start the server again:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. **Wait for startup:**
   - Look for "Started InternRegisterApplication" message
   - Server should be ready on `http://localhost:8082`

---

### **Option 2: Using IDE**

1. **Stop the server:**
   - Click the stop button in your IDE
   - Or right-click on the running application → Stop

2. **Start the server:**
   - Run `InternRegisterApplication.java`
   - Or click the play/run button

---

## ✅ After Restart

Once the server restarts, try your requests again:

```
GET http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN_HERE
```

The 403 error should be resolved!

---

## 🔍 Check Server Logs

After restarting, check the console logs when you make requests. You should see:

```
✓ JWT Authentication successful:
  Username: supervisor.test@univen.ac.za
  Role: SUPERVISOR
  Endpoint: /api/leave
  Authentication set in SecurityContext: true
```

If you see this, authentication is working correctly.

---

## ❌ If Still Getting 403

1. **Verify token is valid:**
   - Try logging in again to get a fresh token
   - Make sure token hasn't expired (24 hours)

2. **Check Authorization header:**
   - Format: `Authorization: Bearer YOUR_TOKEN`
   - No quotes around token
   - No extra spaces or newlines

3. **Check server console:**
   - Look for authentication logs
   - Check for any error messages

---

## 🚀 Quick Restart Command

```powershell
# Stop server (if running)
# Press Ctrl+C in terminal

# Start server
.\mvnw.cmd spring-boot:run
```

---

## 📝 What Changed

The security configuration now:
- ✅ Allows all authenticated users to access endpoints
- ✅ Better error handling and logging
- ✅ Improved authentication verification
- ✅ Enhanced debugging information

**All changes are in:** `src/main/java/com/internregister/security/SecurityConfig.java`

