# 401 Unauthorized Error - Token Fix Guide

## 🔍 Problem

After login, all API requests are returning **401 Unauthorized** errors. This is happening because:

1. **Old tokens are invalid** - We fixed the JWT secret key, so all tokens created before the fix are now invalid
2. **Token not being sent** - The frontend might not be sending the token in requests
3. **Token storage issue** - Token might not be stored correctly after login

## ✅ Solution: Clear Storage and Re-Login

### Step 1: Clear Browser Storage

**Open Browser Console (F12) and run:**
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
3. Click **Local Storage** → Your domain (`http://localhost:4200`)
4. Right-click → **Clear** or delete all items
5. Repeat for **Session Storage**

### Step 2: Verify Backend is Running

```powershell
netstat -ano | findstr :8082
```

Should show the backend is listening on port 8082.

### Step 3: Restart Backend Server (if needed)

The backend needs to be running with the **fixed JWT secret key**:

```powershell
cd C:\Users\kulani.baloyi\Downloads\intern-register
mvn spring-boot:run
```

### Step 4: Login Again

1. **Go to login page** in your frontend
2. **Enter credentials:**
   - Username: `intern@univen.ac.za` (or your test user)
   - Password: `Intern123!` (or your test password)
3. **Click Login**

### Step 5: Verify Token is Stored

**In Browser Console (F12):**
```javascript
// Check if token is stored
const token = localStorage.getItem('token');
console.log('Token stored:', !!token);
console.log('Token value:', token ? token.substring(0, 50) + '...' : 'null');

// Check all localStorage items
console.log('All localStorage:', {...localStorage});
```

### Step 6: Verify Token is Sent in Requests

1. Open **Network** tab in DevTools (F12)
2. Make a request (e.g., go to dashboard)
3. Click on a request (e.g., `/api/interns`)
4. Go to **Headers** tab
5. Check **Request Headers** section
6. Look for: `Authorization: Bearer <token>`

**If Authorization header is missing:**
- The frontend is not sending the token
- Check frontend HTTP interceptor/service
- Verify token is being added to request headers

## 🔧 Frontend Token Handling

### Check Frontend Code

The frontend should:

1. **Store token after login:**
   ```typescript
   // After successful login
   localStorage.setItem('token', response.token);
   ```

2. **Send token in requests:**
   ```typescript
   // In HTTP interceptor or service
   const token = localStorage.getItem('token');
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

### Common Frontend Issues

#### Issue 1: Token Not Stored After Login

**Check login response handler:**
```typescript
login(username: string, password: string) {
  this.http.post('/api/auth/login', { username, password })
    .subscribe(response => {
      // Make sure token is stored
      localStorage.setItem('token', response.token);
      console.log('Token stored:', response.token);
    });
}
```

#### Issue 2: Token Not Sent in Requests

**Check HTTP interceptor:**
```typescript
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next.handle(req);
}
```

#### Issue 3: Token Expired

**Check token expiration:**
- Tokens expire after 24 hours
- If token is expired, login again
- Clear old token before login

## 🔍 Backend Verification

### Check Backend Logs

After making a request, check backend logs for:

**If token is valid:**
```
✓ JWT Authentication successful:
  Username: intern@univen.ac.za
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

## 🧪 Testing Steps

### Test 1: Login and Verify Token

1. Clear browser storage
2. Login
3. Check token is stored:
   ```javascript
   console.log(localStorage.getItem('token'));
   ```
4. Check backend logs for "JWT Authentication successful"

### Test 2: Make API Request

1. After login, navigate to dashboard
2. Check Network tab for API requests
3. Verify Authorization header is present
4. Check backend logs for authentication success

### Test 3: Verify Token Format

**In Browser Console:**
```javascript
const token = localStorage.getItem('token');
if (token) {
  console.log('Token length:', token.length);
  console.log('Token starts with:', token.substring(0, 20));
  console.log('Has Bearer prefix:', token.startsWith('Bearer'));
  // Token should NOT have "Bearer " prefix (that's added by frontend)
}
```

## 🚨 Common Issues

### Issue 1: Token Not Stored

**Symptoms:**
- Login succeeds but token is null in localStorage
- All requests return 401

**Solution:**
- Check frontend login response handler
- Verify `response.token` exists
- Ensure `localStorage.setItem('token', response.token)` is called

### Issue 2: Token Not Sent

**Symptoms:**
- Token is stored but not sent in requests
- Backend logs show "No Authorization header found"

**Solution:**
- Check HTTP interceptor
- Verify token is retrieved from localStorage
- Ensure Authorization header is added to requests

### Issue 3: Invalid Token Format

**Symptoms:**
- Token is sent but validation fails
- Backend logs show "Invalid or expired token"

**Solution:**
- Check token doesn't have "Bearer " prefix in storage (frontend adds it)
- Verify token is not corrupted
- Clear storage and login again

### Issue 4: Token from Old Secret Key

**Symptoms:**
- Token was created before JWT secret key fix
- Validation fails with signature error

**Solution:**
- Clear browser storage
- Login again to get new token (signed with fixed secret key)
- New token will work

## ✅ Complete Fix Process

1. **Stop frontend** (if running)
2. **Clear browser storage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
3. **Verify backend is running** with fixed JWT secret
4. **Restart backend** (if needed):
   ```powershell
   mvn spring-boot:run
   ```
5. **Start frontend:**
   ```powershell
   cd "C:\Users\kulani.baloyi\Downloads\Univen-intern-Register-frontend\Univen-intern-Register-frontend"
   npm start
   ```
6. **Login again** to get a new token
7. **Verify token is stored:**
   ```javascript
   console.log(localStorage.getItem('token'));
   ```
8. **Test API requests** - should work now

## 📋 Verification Checklist

After fixing:

- [ ] Browser storage cleared
- [ ] Backend running with fixed JWT secret
- [ ] Frontend running on port 4200
- [ ] Login successful
- [ ] Token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Backend logs show "JWT Authentication successful"
- [ ] API requests return 200 OK (not 401)
- [ ] No "Invalid or expired token" errors

## 🎯 Expected Behavior

**After login:**
```
✓ Login successful
✓ Token stored in localStorage
✓ Token sent in all API requests
✓ Backend validates token successfully
✓ API requests return 200 OK
```

**Backend logs should show:**
```
✓ JWT Authentication successful:
  Username: intern@univen.ac.za
  Role: INTERN
  Endpoint: GET /api/interns
  ✓ Authentication set in SecurityContext: true
```

## 🆘 Still Getting 401?

1. **Check backend logs** - What error message appears?
2. **Check browser Network tab** - Is Authorization header present?
3. **Check browser Console** - Is token stored in localStorage?
4. **Verify backend is running** - Is server listening on port 8082?
5. **Try login again** - Clear storage and get a fresh token

---

**The main issue is that old tokens are invalid after the JWT secret key fix. Clear storage and login again to get a new valid token!**

