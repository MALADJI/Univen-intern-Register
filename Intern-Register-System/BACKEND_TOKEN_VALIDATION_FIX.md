# Backend Token Validation Fix

## Problem
Frontend is sending tokens correctly (we can see "🔐 Sending request with token" in console), but backend is returning 401 Unauthorized.

## Root Cause
The backend JWT filter might not be properly validating tokens, or Spring Security is rejecting requests before the JWT filter runs.

## Solution: Check Backend Logs

When you make a request after login, check the backend console for these messages:

### ✅ If Token is Valid:
```
✓ JWT Authentication successful:
  Username: user@example.com
  Role: ADMIN
  Endpoint: GET /api/settings/profile
  ✓ Authentication set in SecurityContext: true
  ✓ User authenticated: user@example.com (Role: ADMIN)
```

### ❌ If Token is Invalid:
```
✗ Token validation failed: Invalid signature - ...
  This usually means the token was signed with a different secret key
```

### ⚠️ If Token is Not Received:
```
⚠ No Authorization header found:
  Endpoint: GET /api/settings/profile
  This request will be rejected if endpoint requires authentication
```

## Most Likely Issues

### 1. Backend JWT Filter Not Running
**Check**: Look for ANY JWT-related messages in backend console when making requests.

**If no messages appear**, the JWT filter might not be running. Check:
- Is the filter registered in SecurityConfig?
- Is the filter running before Spring Security checks?

### 2. Token Signature Mismatch
**Symptom**: Backend shows "Invalid signature" error

**Cause**: Token was signed with a different secret key than what backend is using

**Fix**: 
- Restart backend server
- Clear browser localStorage and login again
- Ensure JWT secret key is static (not regenerated)

### 3. Spring Security Rejecting Before JWT Filter
**Symptom**: No JWT filter messages, just 401 errors

**Fix**: Check SecurityConfig - ensure JWT filter runs before Spring Security authorization check

## Quick Test

1. **Login** and check browser console for token
2. **Make a request** (navigate to dashboard)
3. **Check backend console** immediately for JWT messages
4. **Share backend logs** if issue persists

## Expected Backend Log Flow

```
✓ JWT Authentication successful:
  Username: admin@univen.ac.za
  Role: ADMIN
  Endpoint: GET /api/settings/profile
  ✓ Authentication set in SecurityContext: true
  ✓ User authenticated: admin@univen.ac.za (Role: ADMIN)
```

If you see this, the token is valid and authentication is set. The 401 might be coming from Spring Security after the JWT filter runs.

## If Backend Shows No JWT Messages

The JWT filter might not be running. Check:
1. Is the filter registered in SecurityConfig?
2. Is the filter order correct?
3. Is Spring Security configured correctly?

## Next Steps

1. **Check backend console** when making requests
2. **Share backend logs** showing JWT authentication attempts
3. **Verify backend is running** and accessible
4. **Test with a simple request** like `/api/auth/me` to see if token works

