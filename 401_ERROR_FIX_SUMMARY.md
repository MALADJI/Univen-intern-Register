# 🔧 401 Unauthorized Error - Complete Fix Guide

## 🎯 The Problem

You're getting **401 Unauthorized** errors on all API requests after login:
- `:8082/api/interns:1 Failed to load resource: the server responded with a status of 401 ()`
- `:8082/api/settings/profile:1 Failed to load resource: the server responded with a status of 401 ()`
- `Access denied to interns endpoint`

## 🔍 Root Cause

**Old tokens are invalid!** After we fixed the JWT secret key (to use a fixed secret instead of a random one), all tokens created before the fix became invalid. Your browser still has an old token stored, which is why all requests are failing.

## ✅ The Solution (3 Simple Steps)

### Step 1: Clear Browser Storage

**Open Browser Console (Press F12) and run:**

```javascript
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

This will:
- Clear all stored tokens
- Clear all session data
- Reload the page

### Step 2: Login Again

1. After the page reloads, go to the login page
2. Enter your credentials
3. Click **Login**
4. You should get a **new, valid token**

### Step 3: Verify It's Working

**After login, check in Console:**

```javascript
// Check if token is stored
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Found!' : 'NOT found');
```

**Then check Network tab:**
1. Open DevTools (F12) → **Network** tab
2. Make a request (e.g., go to dashboard)
3. Click on a request (e.g., `/api/interns`)
4. Check **Headers** → **Request Headers**
5. Look for: `Authorization: Bearer <token>`

If you see the Authorization header, **it's working!** ✅

## 🧪 Detailed Verification

### Verify Token is Stored

```javascript
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token found!');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
} else {
  console.log('❌ Token NOT found!');
  console.log('→ Frontend is not storing token after login');
}
```

### Verify Token is Being Sent

1. Open **Network** tab in DevTools
2. Click on a failed request (401 error)
3. Go to **Headers** tab
4. Check **Request Headers**:
   - ✅ **If you see `Authorization: Bearer ...`**: Token is being sent
   - ❌ **If you don't see it**: Frontend is not sending the token

### Verify Backend is Receiving Token

Check your backend console logs. You should see:

**If token is valid:**
```
✓ JWT Authentication successful:
  Username: your-email@univen.ac.za
  Role: INTERN
  Endpoint: GET /api/interns
  ✓ Authentication set in SecurityContext: true
```

**If token is invalid:**
```
✗ JWT Token validation failed:
  Endpoint: GET /api/interns
  Reason: Invalid or expired token
```

**If no token sent:**
```
⚠ No Authorization header found:
  Endpoint: GET /api/interns
  This request will be rejected if endpoint requires authentication
```

## 🚨 Common Issues

### Issue 1: Token Not Stored After Login

**Symptoms:**
- Login succeeds but `localStorage.getItem('token')` returns `null`
- All requests return 401

**Cause:**
- Frontend is not storing the token after login
- Login response handler is not saving the token

**Fix:**
Check frontend login handler. It should store the token:
```typescript
localStorage.setItem('token', response.token);
```

### Issue 2: Token Not Sent in Requests

**Symptoms:**
- Token is stored but not sent in requests
- Backend logs show "No Authorization header found"

**Cause:**
- Frontend HTTP interceptor is not adding the token to requests
- Token is stored but not retrieved for requests

**Fix:**
Check frontend HTTP interceptor. It should add the token:
```typescript
const token = localStorage.getItem('token');
if (token) {
  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}
```

### Issue 3: Old Token (Invalid)

**Symptoms:**
- Token was created before JWT secret key fix
- Backend logs show "Invalid signature" or "Invalid or expired token"

**Cause:**
- Token was signed with the old (random) secret key
- New backend uses a fixed secret key
- Tokens don't match

**Fix:**
1. Clear browser storage
2. Login again to get a new token (signed with fixed secret key)

### Issue 4: Token Expired

**Symptoms:**
- Token was valid but expired (after 24 hours)
- Backend logs show "Token expired"

**Fix:**
1. Login again to get a new token
2. Or implement token refresh in frontend

## 📋 Complete Fix Checklist

- [ ] Cleared browser storage (`localStorage.clear()`)
- [ ] Refreshed the page
- [ ] Logged in again
- [ ] Token stored in localStorage (verified in console)
- [ ] Token sent in Authorization header (verified in Network tab)
- [ ] Backend running on port 8082
- [ ] Backend logs show "JWT Authentication successful"
- [ ] API requests return 200 OK (not 401)
- [ ] No "Invalid or expired token" errors

## 🎯 Expected Result

After clearing storage and logging in:

✅ **Browser Console:**
```
✅ Storage cleared!
✅ Token found!
Token length: 200+
```

✅ **Network Tab:**
```
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
  
Response:
  Status: 200 OK
```

✅ **Backend Logs:**
```
✓ JWT Authentication successful:
  Username: your-email@univen.ac.za
  Role: INTERN
  Endpoint: GET /api/interns
  ✓ Authentication set in SecurityContext: true
```

## 🆘 Still Getting 401?

If you're still getting 401 errors after all these steps:

1. **Check backend logs** - What error message appears?
2. **Check browser Network tab** - Is Authorization header present?
3. **Check browser Console** - Is token stored in localStorage?
4. **Verify backend is running** - Is server listening on port 8082?
5. **Try login again** - Clear storage and get a fresh token
6. **Check frontend code** - Is HTTP interceptor adding the token?

## 📝 Quick Reference

### Clear Storage (Browser Console)
```javascript
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

### Check Token (Browser Console)
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token ? 'Found!' : 'NOT found');
```

### Check Backend Status (PowerShell)
```powershell
netstat -ano | findstr :8082
```

### Check Backend Logs
Look for:
- `✓ JWT Authentication successful` (token is valid)
- `✗ JWT Token validation failed` (token is invalid)
- `⚠ No Authorization header found` (token not sent)

---

## 🎯 Summary

**The main issue is old tokens are invalid after the JWT secret key fix. Clear storage and login again to get a new valid token!**

1. **Clear storage**: `localStorage.clear(); sessionStorage.clear();`
2. **Refresh page**: `window.location.reload();`
3. **Login again**: Enter credentials and click Login
4. **Verify token**: Check `localStorage.getItem('token')`
5. **Test requests**: Check Network tab for Authorization header

**That's it!** Your 401 errors should be fixed. ✅

