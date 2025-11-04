# Login Troubleshooting Guide

## Current Status
- ✅ Backend is running on port 8082
- ✅ Backend correctly returns 401 for invalid credentials
- ✅ Frontend API service configured correctly
- ✅ Login validation logic is in place

## Common Issues & Solutions

### Issue 1: Button Not Responding
**Symptoms**: Clicking login button does nothing

**Solution**:
1. Open browser DevTools (F12) → Console
2. Check for JavaScript errors
3. Make sure Angular app compiled successfully
4. Try restarting Angular: `ng serve`

### Issue 2: Error Message Not Showing
**Symptoms**: Login fails but no error message appears

**Check**:
1. Open Console (F12) → Look for error logs
2. Check if `errorMessage` is being set
3. Check HTML template for `*ngIf="errorMessage"` binding

**Solution**:
- Ensure error message div is visible in template
- Check console logs for actual error

### Issue 3: Wrong Credentials Still Navigate
**Symptoms**: Can navigate to dashboard with wrong credentials

**Check**:
1. Open Network tab (F12)
2. Try login with wrong credentials
3. Check if request returns 401
4. Check console logs - should see "❌ Login failed"

**Solution**:
- Backend should return 401 for wrong credentials ✅ (Verified)
- Frontend should catch error and NOT navigate ✅ (Fixed)
- If still happening, check if there's a token in localStorage before login

### Issue 4: CORS Error
**Symptoms**: Browser console shows CORS error

**Solution**:
- CORS is configured in backend ✅
- Check Network tab - should see CORS headers in response
- Clear browser cache if needed

### Issue 5: Backend Not Responding
**Symptoms**: "Cannot connect to server" error

**Check**:
1. Verify backend is running: `netstat -ano | findstr :8082`
2. Test endpoint directly: `http://localhost:8082/api/auth/login`
3. Check backend logs for errors

**Solution**:
- Restart backend if needed
- Check backend logs for startup errors

## Debugging Steps

### Step 1: Check Browser Console
```javascript
// Open DevTools (F12) → Console tab
// Look for:
// - Red error messages
// - "✓ Client-side validation passed"
// - "Backend response received"
// - "❌ Login failed" messages
```

### Step 2: Check Network Tab
```
1. Open DevTools (F12) → Network tab
2. Try to login
3. Find request to: /api/auth/login
4. Check:
   - Request URL: http://localhost:8082/api/auth/login
   - Request Method: POST
   - Request Payload: {username: "...", password: "..."}
   - Response Status: 200 (success) or 401 (invalid)
   - Response Body: Check content
```

### Step 3: Check localStorage
```javascript
// In browser console, type:
localStorage.getItem('auth_token')  // Should be null before login
localStorage.getItem('user_role')    // Should be null before login
localStorage.getItem('username')     // Should be null before login

// After successful login, these should have values
// After failed login, these should still be null
```

### Step 4: Test Backend Directly
```powershell
# Test with wrong credentials (should return 401)
$body = @{username="test@test.com"; password="wrong"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8082/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body

# Should return: 401 Unauthorized with {"error":"Invalid credentials"}
```

## Expected Behavior

### With Wrong Credentials:
1. User enters email/password
2. Clicks login button
3. Frontend validates format ✅
4. Frontend sends request to backend ✅
5. Backend validates credentials ✅
6. Backend returns 401 with `{"error":"Invalid credentials"}` ✅
7. Frontend receives error ✅
8. Frontend shows error message: "Invalid credentials. Please check your email and password."
9. Frontend clears localStorage ✅
10. User stays on login page ✅ (NO NAVIGATION)

### With Correct Credentials:
1. User enters correct email/password
2. Clicks login button
3. Frontend validates format ✅
4. Frontend sends request to backend ✅
5. Backend validates credentials ✅
6. Backend returns 200 with `{token, role, username, email}` ✅
7. Frontend validates response ✅
8. Frontend stores token in localStorage ✅
9. Frontend navigates to appropriate dashboard ✅

## Testing Checklist

- [ ] Backend is running (port 8082)
- [ ] Angular app is running (port 4200)
- [ ] Browser console shows no errors
- [ ] Network tab shows login request
- [ ] Wrong credentials return 401
- [ ] Wrong credentials show error message
- [ ] Wrong credentials do NOT navigate
- [ ] localStorage cleared on error
- [ ] Correct credentials return 200
- [ ] Correct credentials navigate to dashboard

## Quick Fix Commands

### Restart Backend:
```bash
# Stop backend (Ctrl+C in terminal)
# Then restart:
cd C:\Users\kulani.baloyi\IdeaProjects\intern-register
mvn spring-boot:run
```

### Restart Angular:
```bash
# Stop Angular (Ctrl+C in terminal)
# Then restart:
cd "C:\Users\kulani.baloyi\Downloads\Intern-Register-System (5)\Intern-Register-System\Intern-Register-System"
ng serve
```

### Clear Browser Storage:
```javascript
// In browser console (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Still Not Working?

1. **Share browser console logs** - Copy all console messages
2. **Share Network tab details** - Screenshot or details of login request/response
3. **Share error message** - Exact error message shown to user
4. **Check backend logs** - Look for any error messages in backend terminal

