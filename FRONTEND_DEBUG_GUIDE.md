# Frontend Debugging Guide - Login & Password Reset

## 🔍 Common Errors and Solutions

### 1. ERR_CONNECTION_REFUSED
**Problem:** Backend server is not running
**Solution:** 
1. Start the backend server:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```
2. Wait for "Started InternRegisterApplication" message
3. Check that server is running on `http://localhost:8082`

---

### 2. 401 Unauthorized on Login
**Problem:** Invalid credentials or user doesn't exist

**Check Backend Console Logs:**
Look for these messages:
```
=== LOGIN ATTEMPT ===
Username: ...
Password: ***
✗ Login attempt failed: User not found - ...
OR
✗ Login attempt failed: Invalid password for user - ...
```

**Solutions:**
1. **Verify username/email is correct:**
   - Default intern: `intern@univen.ac.za`
   - Default admin: `admin@univen.ac.za`
   - Default supervisor: `supervisor@univen.ac.za`

2. **Verify password is correct:**
   - Default intern: `intern123`
   - Default admin: `admin123`
   - Default supervisor: `supervisor123`

3. **Check if user exists in database:**
   - Use the endpoint: `GET /api/admins/intern-users` (as admin)
   - Or check MySQL: `SELECT * FROM users WHERE role = 'INTERN';`

---

### 3. 400 Bad Request on Reset Password
**Problem:** Invalid code, missing fields, or password validation failed

**Check Backend Console Logs:**
Look for these messages:
```
=== RESET PASSWORD REQUEST ===
Email: ...
Code: ...
✗ Code verification failed
OR
✗ Password validation failed: Password must be at least 8 characters long
```

**Common Causes:**

1. **Code Verification Failed:**
   - Code doesn't match what was sent
   - Code expired (codes expire after 24 hours)
   - Code was already used (if one-time use)
   - **Solution:** Request a new code from `/api/auth/forgot-password`

2. **Password Validation Failed:**
   Password must meet ALL these requirements:
   - ✅ At least 8 characters long
   - ✅ At least one lowercase letter (a-z)
   - ✅ At least one uppercase letter (A-Z)
   - ✅ At least one digit (0-9)
   - ✅ At least one special character (@$!%*?&)

   **Example valid passwords:**
   - `Password123!`
   - `Intern123@`
   - `MyPass123$`

3. **Missing Fields:**
   - Check that request includes: `email`, `code`, `newPassword`
   - All fields are required

---

## 🛠️ Step-by-Step Debugging

### Step 1: Check Backend Server Status
```bash
# Check if server is running
netstat -ano | findstr :8082
```

### Step 2: Check Backend Console Logs
When you try to login or reset password, check the backend console for detailed logs:
- Look for `=== LOGIN ATTEMPT ===` or `=== RESET PASSWORD REQUEST ===`
- Read the error messages that follow (marked with ✗)

### Step 3: Test with Default Credentials
Try logging in with default credentials:
```json
{
  "username": "intern@univen.ac.za",
  "password": "intern123"
}
```

### Step 4: Test Password Reset Flow
1. **Request code:**
   ```
   POST /api/auth/forgot-password
   {
     "email": "intern@univen.ac.za"
   }
   ```
   - Copy the code from response (for testing)

2. **Reset password:**
   ```
   POST /api/auth/reset-password
   {
     "email": "intern@univen.ac.za",
     "code": "819760",
     "newPassword": "NewPass123!"
   }
   ```
   - Make sure password meets all requirements
   - Use the exact code from step 1

---

## 📝 Password Requirements Reminder

Your password must have:
- ✅ Minimum 8 characters
- ✅ At least 1 lowercase letter
- ✅ At least 1 uppercase letter  
- ✅ At least 1 number
- ✅ At least 1 special character: `@$!%*?&`

**Valid Examples:**
- `Password123!`
- `Intern123@`
- `MySecure123$`

**Invalid Examples:**
- `password` (no uppercase, number, or special char)
- `PASSWORD123` (no lowercase or special char)
- `Password!` (no number)
- `Pass123` (too short, less than 8 chars)

---

## 🔗 Quick Test Endpoints

### Get All Intern Users (to see available login credentials)
```
GET http://localhost:8082/api/admins/intern-users
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Test Login
```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "intern@univen.ac.za",
  "password": "intern123"
}
```

### Test Password Reset
```
POST http://localhost:8082/api/auth/reset-password
Content-Type: application/json

{
  "email": "intern@univen.ac.za",
  "code": "819760",
  "newPassword": "NewPassword123!"
}
```

---

## ✅ What to Check in Frontend

1. **Check Network Tab:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try login/reset password
   - Click on the failed request
   - Check the Response tab for error message

2. **Check Request Payload:**
   - In Network tab, check the Request Payload
   - Verify all required fields are present
   - Verify field names match: `username`, `password`, `email`, `code`, `newPassword`

3. **Check Console Logs:**
   - Look for error messages in browser console
   - Check if error response has a message you can display to user

---

## 🚨 Still Having Issues?

1. **Restart Backend Server:**
   ```bash
   # Stop server (Ctrl+C)
   # Then restart
   .\mvnw.cmd spring-boot:run
   ```

2. **Check Database:**
   - Verify users exist in database
   - Check if passwords are hashed correctly

3. **Check Backend Logs:**
   - All errors are logged with detailed messages
   - Look for ✗ symbols indicating failures
   - Read the error message to understand the issue

