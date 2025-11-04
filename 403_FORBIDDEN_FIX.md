# 403 Forbidden Error - Troubleshooting Guide

## ✅ SecurityConfig Updates

### Changes Made

1. **Added Exception Handlers**
   - `authenticationEntryPoint`: Handles 401 Unauthorized (when not authenticated)
   - `accessDeniedHandler`: Handles 403 Forbidden (when authenticated but not authorized)
   - Both handlers log detailed information for debugging

2. **Enhanced Logging**
   - Logs when authentication entry point is triggered
   - Logs when access denied handler is triggered
   - Shows authenticated user and authorities when 403 occurs

## 🔍 Understanding 403 vs 401

- **401 Unauthorized**: User is NOT authenticated (no valid token or token missing)
- **403 Forbidden**: User IS authenticated but doesn't have permission

## 🚨 Current Issue: 403 Forbidden

The 403 errors suggest:
1. ✅ Token is being sent (otherwise would be 401)
2. ✅ Token is being validated (authentication is set)
3. ❌ Authorization check is failing

## 🔧 Debugging Steps

### Step 1: Check Backend Logs

After restarting the server, when you make a request, you should see one of these:

**If authentication succeeds:**
```
✓ JWT Authentication successful:
  Username: intern@univen.ac.za
  Role: INTERN
  Endpoint: GET /api/interns
  ✓ Authentication set in SecurityContext: true
  ✓ User authenticated: intern@univen.ac.za (Role: INTERN)
```

**If 403 occurs, you should see:**
```
✗ Access denied handler triggered:
  Endpoint: GET /api/interns
  Reason: Access is denied
  Authenticated user: intern@univen.ac.za
  Authorities: [ROLE_INTERN]
```

### Step 2: Verify Token in Browser

1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Make a request (e.g., GET /api/interns)
4. Click on the request
5. Check **Request Headers**:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Check Token Validity

**In Browser Console:**
```javascript
// Get token from localStorage
const token = localStorage.getItem('token');
console.log('Token:', token);

// Check if token exists and is not empty
if (!token || token.trim() === '') {
    console.error('❌ Token is missing or empty');
} else {
    console.log('✅ Token exists');
    console.log('Token length:', token.length);
    console.log('Token starts with:', token.substring(0, 10));
}
```

### Step 4: Test with Postman/curl

**Test login:**
```http
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "intern@univen.ac.za",
  "password": "Intern123!"
}
```

**Test protected endpoint:**
```http
GET http://localhost:8082/api/interns
Authorization: Bearer {token_from_login}
```

## 🔍 Common Causes of 403

### Cause 1: Authentication Not Set Properly

**Symptoms:**
- Backend logs show "Access denied handler triggered"
- But no "JWT Authentication successful" message

**Solution:**
- Check if token is valid
- Check if token is being sent in Authorization header
- Verify token format: `Bearer <token>` (with space)

### Cause 2: SecurityContext Not Persisting

**Symptoms:**
- Authentication is set in filter but not available in controller

**Solution:**
- Ensure `auth.setAuthenticated(true)` is called (already added)
- Check if SecurityContext is being cleared somewhere
- Verify filter order is correct

### Cause 3: Token Expired

**Symptoms:**
- Token was valid before but now returns 403
- Backend logs show "JWT Token validation failed"

**Solution:**
- Login again to get a new token
- Check token expiration time (default: 24 hours)

### Cause 4: User Not Found in Database

**Symptoms:**
- Backend logs show "User not found in database"
- Authentication is not set

**Solution:**
- Verify user exists in database
- Check username/email matches exactly
- Verify user account is active

## 🛠️ Quick Fixes

### Fix 1: Clear and Re-login

1. **Clear browser storage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Login again:**
   - Go to login page
   - Enter credentials
   - Verify token is stored

3. **Test endpoint:**
   - Make a request to protected endpoint
   - Check backend logs

### Fix 2: Verify Token Format

**Check token in browser:**
```javascript
const token = localStorage.getItem('token');
console.log('Token format check:');
console.log('- Exists:', !!token);
console.log('- Not empty:', token && token.trim() !== '');
console.log('- Starts with eyJ:', token && token.startsWith('eyJ'));
console.log('- Length:', token ? token.length : 0);
```

**Expected:**
- Token exists: `true`
- Not empty: `true`
- Starts with eyJ: `true`
- Length: > 100 characters

### Fix 3: Check Backend Server Status

**Verify server is running:**
```bash
# Check if server is listening on port 8082
netstat -ano | findstr :8082
```

**Restart server:**
```powershell
# Stop server (Ctrl+C)
# Start server
mvn spring-boot:run
```

## 📋 Verification Checklist

After applying fixes, verify:

- [ ] Backend server is running on port 8082
- [ ] Token is stored in localStorage after login
- [ ] Token is sent in Authorization header
- [ ] Backend logs show "JWT Authentication successful"
- [ ] Backend logs show "Authentication set in SecurityContext: true"
- [ ] Protected endpoints return 200 OK (not 403)
- [ ] No "Access denied handler triggered" messages in logs

## 🔧 Advanced Debugging

### Enable More Detailed Logging

Add to `application.properties`:
```properties
logging.level.org.springframework.security=DEBUG
logging.level.com.internregister.security=DEBUG
```

### Check SecurityContext in Controller

Add this to any controller method:
```java
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
System.out.println("Controller - Authentication: " + auth);
System.out.println("Controller - Authenticated: " + (auth != null && auth.isAuthenticated()));
System.out.println("Controller - Principal: " + (auth != null ? auth.getPrincipal() : "null"));
System.out.println("Controller - Authorities: " + (auth != null ? auth.getAuthorities() : "null"));
```

### Test Authentication Directly

**Create a test endpoint:**
```java
@GetMapping("/api/test-auth")
public ResponseEntity<?> testAuth() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    Map<String, Object> info = new HashMap<>();
    info.put("authenticated", auth != null && auth.isAuthenticated());
    info.put("principal", auth != null ? auth.getPrincipal() : null);
    info.put("authorities", auth != null ? auth.getAuthorities().toString() : null);
    return ResponseEntity.ok(info);
}
```

## 🚀 Next Steps

1. **Restart the server** with updated SecurityConfig
2. **Clear browser storage** and login again
3. **Check backend logs** for authentication messages
4. **Verify token** is being sent in requests
5. **Test endpoints** and check for 403 errors

## 📝 Expected Backend Logs

**Successful Request:**
```
✓ JWT Authentication successful:
  Username: intern@univen.ac.za
  Role: INTERN
  Endpoint: GET /api/interns
  ✓ Authentication set in SecurityContext: true
  ✓ User authenticated: intern@univen.ac.za (Role: INTERN)
```

**Failed Request (403):**
```
✗ Access denied handler triggered:
  Endpoint: GET /api/interns
  Reason: Access is denied
  Authenticated user: intern@univen.ac.za
  Authorities: [ROLE_INTERN]
```

If you see the second log, it means authentication is working but authorization is failing. This shouldn't happen with `.anyRequest().authenticated()`, so there might be an issue with how Spring Security is recognizing the authentication.

## ⚠️ Important Notes

- The exception handlers will now log detailed information when 403 occurs
- Check backend logs immediately after making a request
- The logs will show exactly why the request was denied
- If authentication is set but 403 still occurs, there may be a Spring Security configuration issue

