# Fix 401 Unauthorized Errors - Complete Guide

## 🔍 Problem
You're getting 401 Unauthorized errors even though:
- ✅ Token is being sent in requests
- ✅ Token exists in browser storage
- ✅ Frontend shows user is logged in

## 🎯 Root Cause
The token was likely created **before** the backend was updated with the fixed JWT secret key. When the backend restarts or the secret key changes, old tokens become invalid.

## ✅ Solution (3 Steps)

### Step 1: Restart Backend Server
The backend must be running with the latest code that has the fixed JWT secret key.

**Stop the backend:**
- Press `Ctrl+C` in the terminal where the backend is running
- Or close the terminal window

**Start the backend:**
```powershell
cd C:\Users\kulani.baloyi\Downloads\intern-register
.\mvnw.cmd spring-boot:run
```

Wait for: `Started InternRegisterApplication` message

### Step 2: Clear Browser Storage
Old tokens won't work with the new backend configuration.

**In Browser Console (F12):**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Or manually:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear storage" or manually delete:
   - `authToken`
   - `currentUser`

### Step 3: Login Again
After clearing storage and restarting backend:
1. Go to login page
2. Enter your credentials
3. You'll get a **new token** that works with the current backend

## 🔄 Automatic Fix (Frontend)
The frontend has been updated to automatically:
- Detect 401 errors when a token exists
- Clear storage automatically
- Redirect to login page

**This means:** If you get a 401 error, the app will automatically log you out and redirect to login. Just log in again!

## 🧪 Verify It's Working

After logging in again, check the browser console. You should see:
```
✓ JWT Token validated:
  Username: your-username
  Role: ADMIN
  Authentication set in SecurityContext: true
```

And in the Network tab, requests should return **200 OK** instead of **401 Unauthorized**.

## ❌ If Still Getting 401

1. **Check backend is running:**
   ```powershell
   netstat -ano | findstr :8082
   ```
   Should show port 8082 is LISTENING

2. **Check backend logs:**
   Look for JWT filter logs:
   ```
   === JWT FILTER ===
   Token valid: true
   ✓ Authentication set in SecurityContext: true
   ```

3. **Verify token is fresh:**
   - Clear browser storage
   - Login again
   - Use the new token immediately

4. **Check token format:**
   - Should be ~200+ characters long
   - Should start with `eyJhbGciOiJIUzI1NiJ9`
   - Should have 3 parts separated by dots (header.payload.signature)

## 📝 Summary

**The fix is simple:**
1. ✅ Restart backend (to ensure latest code is running)
2. ✅ Clear browser storage (to remove old tokens)
3. ✅ Login again (to get a fresh token)

The frontend will now automatically handle 401 errors by clearing storage and redirecting to login, so you won't get stuck in a loop.
