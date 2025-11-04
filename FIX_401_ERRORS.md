# 🚨 Fix 401 Unauthorized Errors - Step by Step

## ⚡ Quick Fix (Do This First!)

### Step 1: Open Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab

### Step 2: Clear Storage and Check Token
**Copy and paste this into the console:**

```javascript
// Clear all stored data
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage cleared!');

// Verify it's cleared
console.log('localStorage items:', localStorage.length);
console.log('sessionStorage items:', sessionStorage.length);

// Reload the page
console.log('🔄 Reloading page...');
window.location.reload();
```

### Step 3: Login Again
1. After the page reloads, go to login page
2. Enter your credentials
3. Click **Login**

### Step 4: Verify Token is Stored
**After login, run this in the console:**

```javascript
// Check if token is stored
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token found!');
  console.log('Token length:', token.length);
  console.log('Token preview:', token.substring(0, 50) + '...');
} else {
  console.log('❌ Token NOT found in localStorage!');
  console.log('All localStorage items:', {...localStorage});
}
```

### Step 5: Check if Token is Being Sent
1. Open **Network** tab in DevTools (F12)
2. Navigate to dashboard or make any API request
3. Click on a request (e.g., `/api/interns`)
4. Go to **Headers** tab
5. Look for **Request Headers** → `Authorization: Bearer ...`

**If you see the Authorization header:** ✅ Token is being sent  
**If you don't see it:** ❌ Frontend is not sending the token

## 🔍 Debugging Steps

### Check 1: Backend Logs
Check your backend console for these messages:

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

### Check 2: Network Tab Details
1. Open **Network** tab
2. Click on a failed request (401 error)
3. Check:
   - **Headers** → **Request Headers** → Is `Authorization` present?
   - **Response** → What's the error message?
   - **Preview** → What does the response body say?

### Check 3: Token Format
**In Console, check token format:**

```javascript
const token = localStorage.getItem('token');
if (token) {
  // Token should NOT have "Bearer " prefix
  if (token.startsWith('Bearer ')) {
    console.log('⚠️ WARNING: Token has "Bearer " prefix - this is wrong!');
    console.log('Token should NOT include "Bearer " - frontend adds it automatically');
  } else {
    console.log('✅ Token format looks correct (no "Bearer " prefix)');
  }
  
  // Check token structure (JWT has 3 parts separated by dots)
  const parts = token.split('.');
  console.log('Token parts:', parts.length, '(should be 3)');
  
  if (parts.length === 3) {
    console.log('✅ Token structure looks correct');
  } else {
    console.log('❌ Token structure is wrong!');
  }
}
```

## 🛠️ Common Issues and Fixes

### Issue 1: Token Not Stored After Login

**Symptoms:**
- Login succeeds but `localStorage.getItem('token')` returns `null`
- All requests return 401

**Fix:**
Check frontend login handler. After successful login, it should:
```typescript
localStorage.setItem('token', response.token);
```

**Verify:**
```javascript
// After login, check if token is stored
console.log('Token:', localStorage.getItem('token'));
```

### Issue 2: Token Not Sent in Requests

**Symptoms:**
- Token is stored but not sent in requests
- Backend logs show "No Authorization header found"

**Fix:**
Check frontend HTTP interceptor. It should add the token to all requests:
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

**Verify:**
1. Open Network tab
2. Make a request
3. Check Request Headers for `Authorization: Bearer ...`

### Issue 3: Old Token (Invalid)

**Symptoms:**
- Token was created before JWT secret key fix
- Backend logs show "Invalid signature" or "Invalid or expired token"

**Fix:**
1. Clear browser storage
2. Login again to get a new token (signed with fixed secret key)

**Verify:**
```javascript
// Clear and login again
localStorage.clear();
// Then login to get a fresh token
```

### Issue 4: Token Expired

**Symptoms:**
- Token was valid but expired (after 24 hours)
- Backend logs show "Token expired"

**Fix:**
1. Login again to get a new token
2. Or implement token refresh in frontend

**Verify:**
```javascript
// Check token expiration (decode JWT)
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiration = new Date(payload.exp * 1000);
  const now = new Date();
  console.log('Token expires:', expiration);
  console.log('Current time:', now);
  console.log('Token expired?', expiration < now);
}
```

## ✅ Complete Fix Process

1. **Stop frontend** (if running) - Not necessary, but helps
2. **Clear browser storage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
3. **Verify backend is running** with fixed JWT secret:
   ```powershell
   netstat -ano | findstr :8082
   ```
4. **Refresh the page** (F5)
5. **Login again** to get a new token
6. **Verify token is stored:**
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   ```
7. **Check Network tab** - Verify Authorization header is sent
8. **Check backend logs** - Verify "JWT Authentication successful"
9. **Test API requests** - Should return 200 OK (not 401)

## 🎯 Expected Result

After clearing storage and logging in:

✅ **Browser Console:**
```
✅ Storage cleared!
✅ Token found!
Token length: 200+
Token preview: eyJhbGciOiJIUzI1NiJ9...
✅ Token format looks correct
```

✅ **Network Tab:**
```
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
  
Response:
  Status: 200 OK
  Body: {...}
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

## 📋 Quick Checklist

- [ ] Cleared browser storage (`localStorage.clear()`)
- [ ] Refreshed the page
- [ ] Logged in again
- [ ] Token stored in localStorage (verified in console)
- [ ] Token sent in Authorization header (verified in Network tab)
- [ ] Backend running on port 8082
- [ ] Backend logs show "JWT Authentication successful"
- [ ] API requests return 200 OK (not 401)
- [ ] No "Invalid or expired token" errors

---

**The main issue is old tokens are invalid after the JWT secret key fix. Clear storage and login again to get a new valid token!**

