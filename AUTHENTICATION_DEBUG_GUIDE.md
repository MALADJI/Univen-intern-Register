# Authentication Debug Guide

## 🔍 Debugging "Authentication Required" Error

I've added detailed debug logging to help diagnose the issue. The server needs to be restarted for the debug logs to appear.

---

## ⚠️ Important: Restart Server

The debug logging won't work until you restart the server.

### **Restart Steps:**

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal where it's running
   - Or close the terminal

2. **Start the server again:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. **Wait for startup** (about 15-20 seconds)

---

## 🔍 Check Server Logs

After restarting, when you make a request, check the server console. You should see:

```
=== JWT Filter Debug ===
Request URI: /api/leave
Authorization header present: true
Header length: 200
Header starts with Bearer: true
Header preview: Bearer eyJhbGciOiJIUzI1NiJ9...
Token extracted, length: 180
Validating token...
Token validation result: true/false
```

---

## 📋 What the Logs Tell You

### **If Authorization header is missing:**
```
Authorization header present: false
```
**Problem:** Header not being sent by Postman
**Solution:** Check Postman Headers tab - make sure header is enabled

### **If header doesn't start with "Bearer":**
```
Header starts with Bearer: false
```
**Problem:** Header format is incorrect
**Solution:** Format should be `Bearer YOUR_TOKEN` (with space)

### **If token validation fails:**
```
Token validation result: false
```
**Problem:** Token is expired or invalid
**Solution:** Login again to get a fresh token

### **If user not found:**
```
✗ JWT Token valid but user not found: supervisor.test@univen.ac.za
```
**Problem:** User doesn't exist in database
**Solution:** Register the user first

---

## 🧪 Test Sequence

1. **Restart server** with new debug logging
2. **Make your request** in Postman
3. **Check server console** for debug messages
4. **Identify the issue** from the logs
5. **Fix the issue** based on what the logs show

---

## ✅ Expected Successful Logs

When everything works correctly, you should see:

```
=== JWT Filter Debug ===
Request URI: /api/leave
Authorization header present: true
Header length: 200
Header starts with Bearer: true
Header preview: Bearer eyJhbGciOiJIUzI1NiJ9...
Token extracted, length: 180
Validating token...
Token validation result: true
✓ JWT Authentication successful:
  Username: supervisor.test@univen.ac.za
  Role: SUPERVISOR
  Endpoint: /api/leave
  Authentication set in SecurityContext: true
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: Header Not Being Sent**
**Log:** `Authorization header present: false`
**Fix:** 
- Check Postman Headers tab
- Make sure header is enabled (checkbox checked)
- Verify header name is exactly `Authorization`

### **Issue 2: Wrong Header Format**
**Log:** `Header starts with Bearer: false`
**Fix:**
- Format should be: `Bearer YOUR_TOKEN`
- Not just: `YOUR_TOKEN`
- Make sure there's a space after "Bearer"

### **Issue 3: Token Expired**
**Log:** `Token validation result: false`
**Fix:**
- Login again to get a fresh token
- Tokens expire after 24 hours

### **Issue 4: User Not Found**
**Log:** `JWT Token valid but user not found`
**Fix:**
- Register the user first
- Or check if username/email matches

---

## 🚀 Quick Fix Steps

1. ✅ **Restart server** → `.\mvnw.cmd spring-boot:run`
2. ✅ **Make request** in Postman
3. ✅ **Check server console** for debug logs
4. ✅ **Identify issue** from logs
5. ✅ **Fix based on logs**

---

## 📝 What to Share

If you're still having issues, share:
1. The debug logs from server console
2. The exact error message
3. The request headers you're sending

This will help identify the exact problem!

