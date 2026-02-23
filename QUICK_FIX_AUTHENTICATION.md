# Quick Fix: Authentication Failed Error

## 🔴 Problem
You're seeing: **"Authentication failed. The backend is rejecting your login token."**

This happens when:
- Your token was created with an **old JWT secret key**
- The backend was restarted and your token is no longer valid
- Token format doesn't match what the backend expects

## ✅ Solution (2 Steps)

### Step 1: Restart Backend
**The backend MUST be running with the latest code.**

1. **Stop the backend:**
   - Press `Ctrl+C` in the terminal where backend is running
   - Or close the terminal

2. **Start the backend:**
   ```powershell
   cd C:\Users\kulani.baloyi\Downloads\intern-register
   .\mvnw.cmd spring-boot:run
   ```

3. **Wait for:** `Started InternRegisterApplication` message

### Step 2: Clear Storage & Login Again

**Option A: Using Browser Console (Fastest)**
1. Open DevTools (F12)
2. Go to Console tab
3. Run:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```
4. Login again with your credentials

**Option B: Manual Clear**
1. Open DevTools (F12)
2. Go to Application tab → Storage
3. Click "Clear site data"
4. Refresh page
5. Login again

## 🧪 Verify It's Fixed

After logging in again:
1. Check browser console - should see: `✓ Login successful`
2. Check Network tab - API requests should return **200 OK** (not 401)
3. Data should load in the dashboard

## ❌ If Still Not Working

### Check Backend Logs
When you make a request, you should see in backend console:
```
=== JWT FILTER ===
  Token valid: true
✓ Authentication set in SecurityContext: true
```

If you see `Token valid: false`, the token is still invalid.

### Common Issues:

**Issue 1: Backend not restarted**
- Solution: Restart backend (Step 1 above)

**Issue 2: Old token still in storage**
- Solution: Clear storage completely (Step 2 above)

**Issue 3: Token format issue**
- Solution: Clear storage and login again to get fresh token

## 📝 Summary

**The fix is always the same:**
1. ✅ Restart backend
2. ✅ Clear browser storage  
3. ✅ Login again

This gets you a fresh token that matches the current backend configuration.

