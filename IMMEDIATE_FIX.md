# 🚨 IMMEDIATE FIX: Authentication Failed

## The Problem
Your token was created with an **old JWT secret key** and is now invalid. The backend is correctly rejecting it.

## ✅ Fix Right Now (3 Steps)

### Step 1: Restart Backend
**CRITICAL:** The backend must be restarted to ensure it's using the fixed JWT secret.

```powershell
# Stop the backend (Ctrl+C in the terminal where it's running)
# Then restart:
cd C:\Users\kulani.baloyi\Downloads\intern-register
.\mvnw.cmd spring-boot:run
```

**Wait for:** `Started InternRegisterApplication`

### Step 2: Clear Browser Storage
**Open Browser Console (F12) and run:**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 3: Login Again
After the page reloads, login with your credentials. You'll get a **fresh token** that works.

## ✅ Verify It's Fixed

After logging in:
- ✅ Dashboard should load data
- ✅ No more "Authentication failed" error
- ✅ Network tab shows 200 OK (not 401)

## 🔍 Why This Happens

The JWT secret key was changed from random (new key on each restart) to fixed. Old tokens created with the random key are now invalid.

**Solution:** Always get a fresh token after backend restarts or JWT secret changes.

## 📝 Quick Reference

**Every time you see 401 errors:**
1. Restart backend
2. Clear storage (`localStorage.clear()`)
3. Login again

That's it! 🎯

