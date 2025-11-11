# 401 Unauthorized Error Debugging Guide

## Problem
After successful login, all API requests return 401 Unauthorized errors.

## Possible Causes

### 1. Token Not Being Sent
- Check browser DevTools → Network tab
- Look for `Authorization: Bearer <token>` header in request headers
- If missing, the interceptor might not be working

### 2. Token Format Issues
- Token might have whitespace or newlines
- Token might be corrupted in localStorage
- **Solution**: Token is now trimmed in both storage and retrieval

### 3. Backend JWT Validation Failing
- Check backend console logs for token validation messages
- Look for: "✗ Token validation failed" messages
- Common issues:
  - Invalid signature (secret key mismatch)
  - Token expired (unlikely immediately after login)
  - Malformed token

### 4. CORS Issues
- CORS might be blocking the Authorization header
- Check browser console for CORS errors
- **Solution**: Backend CORS config should allow Authorization header

### 5. Backend Server Restart
- If backend was restarted, check if JWT secret key changed
- **Current**: Secret key is static, so this shouldn't be an issue

## Debugging Steps

### Step 1: Check Token Storage
Open browser console and run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('Token length:', localStorage.getItem('token')?.length);
```

### Step 2: Check Request Headers
1. Open DevTools → Network tab
2. Make a request (e.g., navigate to dashboard)
3. Click on the failed request
4. Check "Headers" tab
5. Look for `Authorization: Bearer <token>` in Request Headers

### Step 3: Check Backend Logs
Look for these messages in backend console:
- `✓ JWT Authentication successful:` - Token is valid
- `✗ Token validation failed:` - Token is invalid
- `⚠ No Authorization header found:` - Token not sent

### Step 4: Verify Backend is Running
- Check if backend is running on `http://localhost:8082`
- Try accessing: `http://localhost:8082/api/auth/me` (should return 401 if no token, or user data if token is valid)

## Fixes Applied

### Frontend
1. ✅ Token trimming on storage and retrieval
2. ✅ Enhanced interceptor with debugging logs
3. ✅ Better error handling (doesn't clear token on first 401)
4. ✅ Skip interceptor for auth endpoints

### Backend
1. ✅ Static JWT secret key (doesn't change on restart)
2. ✅ Enhanced token validation logging
3. ✅ Explicit authentication marking
4. ✅ Better error messages

## Quick Fixes to Try

### 1. Clear Browser Storage and Re-login
```javascript
// In browser console
localStorage.clear();
// Then refresh and login again
```

### 2. Check Backend Logs
After login, check backend console for:
- Token creation messages
- Token validation messages on subsequent requests

### 3. Verify Token Format
The token should:
- Start with `eyJ` (base64 encoded JWT)
- Be a long string (usually 100+ characters)
- Not have any whitespace or newlines

### 4. Test Token Manually
```javascript
// In browser console after login
const token = localStorage.getItem('token');
console.log('Token:', token);
console.log('Has token:', !!token);
console.log('Token length:', token?.length);
```

## Expected Behavior

After login:
1. ✅ Token stored in localStorage
2. ✅ Console shows: "✅ Login successful" with token preview
3. ✅ Subsequent requests show: "🔐 Sending request with token"
4. ✅ Backend shows: "✓ JWT Authentication successful"
5. ✅ API requests succeed (200 OK)

## If Still Getting 401

1. **Check backend console** - Look for token validation errors
2. **Check browser Network tab** - Verify Authorization header is sent
3. **Restart backend** - Sometimes helps if there's a state issue
4. **Clear browser cache** - Old tokens might be cached
5. **Check CORS configuration** - Make sure Authorization header is allowed

## Next Steps

If the issue persists:
1. Share backend console logs (token validation messages)
2. Share browser Network tab screenshot (showing request headers)
3. Check if backend SecurityConfig is properly configured
4. Verify the JWT secret key matches between token creation and validation

