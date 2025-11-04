# Backend Security Configuration & Testing Guide

## ✅ SecurityConfig Updates

### Changes Made

1. **Enhanced JWT Authentication Filter**
   - Added detailed logging for authentication success/failure
   - Added exception handling for token validation errors
   - Added logging for missing Authorization headers
   - Improved debugging information for troubleshooting

2. **Authentication Logging**
   - ✓ Success: Logs username, role, and endpoint
   - ✗ Failure: Logs reason for validation failure
   - ⚠ Warning: Logs missing Authorization headers for protected endpoints

### Security Features

- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration for cross-origin requests
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- ✅ Rate limiting on login attempts
- ✅ Stateless session management

## 🧪 Testing Steps

### Step 1: Clear Browser LocalStorage

**In Browser Console (F12):**
```javascript
// Clear all stored data
localStorage.clear();
sessionStorage.clear();

// Verify it's cleared
console.log('localStorage:', localStorage);
console.log('sessionStorage:', sessionStorage);
```

**Or manually:**
1. Open Browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → Your domain
4. Right-click → **Clear** or delete individual items
5. Repeat for **Session Storage**

### Step 2: Restart Backend Server

**Stop the server:**
- Press `Ctrl+C` in the terminal where server is running
- Or close the terminal window

**Start the server:**
```powershell
cd C:\Users\kulani.baloyi\Downloads\intern-register
mvn spring-boot:run
```

**Wait for startup:**
- Look for "Started InternRegisterApplication" message
- Server should be ready on `http://localhost:8082`

### Step 3: Log In Again

**Using Frontend:**
1. Go to your frontend application
2. Navigate to login page
3. Enter credentials:
   - **Username/Email:** `intern@univen.ac.za` (or your test user)
   - **Password:** `Intern123!` (or your test password)
4. Click **Login**

**Using API (Postman/curl):**
```http
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "intern@univen.ac.za",
  "password": "Intern123!"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "INTERN",
  "username": "intern@univen.ac.za",
  "email": "intern@univen.ac.za"
}
```

### Step 4: Verify Token in Browser

**Check Network Tab:**
1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Make a request to a protected endpoint (e.g., submit leave request)
4. Click on the request
5. Go to **Headers** tab
6. Look for **Request Headers** section
7. Verify **Authorization** header exists:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**Check Application/Storage Tab:**
1. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Check **Local Storage** → Your domain
3. Look for token storage (might be under key like `token`, `authToken`, `jwt`, etc.)
4. Verify token is stored and not expired

**In Browser Console:**
```javascript
// Check if token is stored
console.log('Token in localStorage:', localStorage.getItem('token'));
console.log('Token in sessionStorage:', sessionStorage.getItem('token'));

// Check all localStorage items
console.log('All localStorage:', {...localStorage});
```

### Step 5: Check Backend Logs

**Successful Authentication:**
```
✓ JWT Authentication successful:
  Username: intern@univen.ac.za
  Role: INTERN
  Endpoint: POST /api/leave
  Authentication set in SecurityContext: true
```

**Failed Authentication (Invalid Token):**
```
✗ JWT Token validation failed:
  Endpoint: POST /api/leave
  Reason: Invalid or expired token
```

**Missing Authorization Header:**
```
⚠ No Authorization header found:
  Endpoint: POST /api/leave
  This request will be rejected if endpoint requires authentication
```

**User Not Found:**
```
⚠ User not found in database for username: user@example.com
```

## 🔍 Verification Checklist

### ✅ Token Storage
- [ ] Token is stored in localStorage/sessionStorage after login
- [ ] Token is not null or empty
- [ ] Token starts with `eyJ` (JWT token format)

### ✅ Token in Requests
- [ ] Authorization header is present in network requests
- [ ] Header format: `Authorization: Bearer <token>`
- [ ] Token is sent with every protected endpoint request
- [ ] No extra spaces or newlines in token

### ✅ Backend Logs
- [ ] Authentication success messages appear in logs
- [ ] Username and role are logged correctly
- [ ] Endpoint paths are logged correctly
- [ ] No authentication errors in logs

### ✅ API Responses
- [ ] Protected endpoints return 200 OK (not 401 Unauthorized)
- [ ] Data is returned correctly
- [ ] No "Not authenticated" errors

## 🚨 Common Issues & Solutions

### Issue 1: Token Not Stored

**Symptoms:**
- Login succeeds but token is not in localStorage
- Requests fail with 401 Unauthorized

**Solution:**
1. Check frontend code that handles login response
2. Verify token is being saved to localStorage:
   ```javascript
   localStorage.setItem('token', response.token);
   ```
3. Check for errors in browser console
4. Verify response contains token field

### Issue 2: Token Not Sent in Requests

**Symptoms:**
- Token is stored but not sent in requests
- Backend logs show "No Authorization header found"

**Solution:**
1. Check frontend HTTP interceptor/service
2. Verify token is added to request headers:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```
3. Check for CORS issues
4. Verify token is retrieved from storage before each request

### Issue 3: Token Expired

**Symptoms:**
- Backend logs show "Invalid or expired token"
- Requests fail with 401 Unauthorized after some time

**Solution:**
1. Check token expiration time (default: 24 hours)
2. Implement token refresh mechanism
3. Handle 401 responses and redirect to login
4. Clear expired token from storage

### Issue 4: Invalid Token Format

**Symptoms:**
- Token validation fails
- Backend logs show authentication errors

**Solution:**
1. Verify token format: `Bearer <token>`
2. Check for extra spaces or newlines
3. Ensure token is trimmed before sending
4. Verify token is not corrupted during storage/retrieval

### Issue 5: User Not Found

**Symptoms:**
- Backend logs show "User not found in database"
- Authentication fails even with valid token

**Solution:**
1. Verify user exists in database
2. Check username/email matches exactly
3. Verify user account is active
4. Check database connection

## 📋 Testing Scenarios

### Test 1: Successful Login & Token Storage
1. Clear localStorage
2. Login with valid credentials
3. Verify token is stored
4. Verify token is sent in next request
5. Check backend logs for success message

### Test 2: Protected Endpoint Access
1. Login and get token
2. Make request to protected endpoint (e.g., `/api/leave`)
3. Verify request includes Authorization header
4. Verify response is 200 OK
5. Check backend logs for authentication success

### Test 3: Expired Token Handling
1. Wait for token to expire (or manually expire it)
2. Make request with expired token
3. Verify backend logs show token validation failure
4. Verify frontend handles 401 response
5. Verify user is redirected to login

### Test 4: Missing Token
1. Clear localStorage
2. Try to access protected endpoint
3. Verify request doesn't include Authorization header
4. Verify backend logs show missing header warning
5. Verify response is 401 Unauthorized

### Test 5: Invalid Token
1. Login and get token
2. Modify token (add/remove characters)
3. Make request with invalid token
4. Verify backend logs show validation failure
5. Verify response is 401 Unauthorized

## 🔧 Frontend Integration

### Axios Interceptor Example

```javascript
import axios from 'axios';

// Add token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Fetch API Example

```javascript
// Function to make authenticated requests
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Clear token and redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }
  
  return response;
}
```

## 📊 Backend Log Examples

### Successful Authentication
```
✓ JWT Authentication successful:
  Username: intern@univen.ac.za
  Role: INTERN
  Endpoint: POST /api/leave
  Authentication set in SecurityContext: true
```

### Failed Authentication
```
✗ JWT Token validation failed:
  Endpoint: POST /api/leave
  Reason: Invalid or expired token
```

### Missing Header
```
⚠ No Authorization header found:
  Endpoint: POST /api/leave
  This request will be rejected if endpoint requires authentication
```

## ✅ Verification Summary

After completing all steps, you should see:

1. ✅ Token stored in browser localStorage
2. ✅ Token sent in Authorization header for all protected requests
3. ✅ Backend logs show successful authentication
4. ✅ Protected endpoints return 200 OK responses
5. ✅ No authentication errors in browser console or backend logs

## 🚀 Next Steps

1. **Test all endpoints** with authentication
2. **Monitor backend logs** for authentication issues
3. **Implement token refresh** if needed
4. **Add error handling** in frontend for 401 responses
5. **Test token expiration** handling

## 📝 Notes

- Tokens expire after 24 hours by default
- Tokens are stored in JWT format (starts with `eyJ`)
- Authorization header format: `Bearer <token>`
- All protected endpoints require valid token
- Public endpoints: `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`

