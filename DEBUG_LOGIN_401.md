# Debug: Login Returning 401

## 🔍 Understanding the 401 Error

The 401 error on `/api/auth/login` is **NOT** a security configuration issue. The login endpoint is public and working correctly.

The 401 is returned by the login endpoint itself when:
1. **User not found** - Username/email doesn't exist in database
2. **Password incorrect** - Password doesn't match

## ✅ Check Backend Logs

When you try to login, check your backend console. You should see one of these:

### Scenario 1: User Not Found
```
=== LOGIN ATTEMPT ===
Username: your-email@univen.ac.za
✗ Login attempt failed: User not found - your-email@univen.ac.za
  Searched for username/email: your-email@univen.ac.za
```

**Fix:** User doesn't exist - register first or use correct email

### Scenario 2: Wrong Password
```
=== LOGIN ATTEMPT ===
Username: admin@univen.ac.za
✓ User found: admin@univen.ac.za (Role: ADMIN, Email: admin@univen.ac.za)
Password valid: false
✗ Login attempt failed: Invalid password for user - admin@univen.ac.za
```

**Fix:** Use correct password

### Scenario 3: Rate Limited
```
⚠ Login blocked: IP 127.0.0.1 is locked out. Remaining: 300 seconds
```

**Fix:** Wait for lockout to expire (usually 15 minutes)

## 🧪 Test with Default Users

If you reset the database, default users are created:

1. **Admin:**
   - Email: `admin@univen.ac.za`
   - Password: `admin123`

2. **Supervisor:**
   - Email: `supervisor@univen.ac.za`
   - Password: `supervisor123`

3. **Intern:**
   - Email: `intern@univen.ac.za`
   - Password: `intern123`

## 🔧 Quick Fix Steps

### Step 1: Check What You're Using
- What email/username are you using?
- What password are you using?

### Step 2: Check Backend Logs
Look for the login attempt message in backend console:
```
=== LOGIN ATTEMPT ===
Username: ...
```

### Step 3: Try Default Admin
Try logging in with:
- Email: `admin@univen.ac.za`
- Password: `admin123`

### Step 4: Check Database
If default users don't work, check if users exist:
```sql
SELECT * FROM users;
```

## 📝 Other Errors in Your Logs

### 409 Error: "This email is already registered"
- **Meaning:** User already exists
- **Fix:** Use login instead of register, or use different email

### 400 Error: "Invalid or expired verification code"
- **Meaning:** Verification code expired or doesn't match
- **Fix:** Request a new verification code (codes expire in 15 minutes)

## ✅ Next Steps

1. **Check backend console** for the exact login error message
2. **Try default admin credentials** (`admin@univen.ac.za` / `admin123`)
3. **Check if user exists** in database
4. **Share backend logs** so I can see the exact error

The login endpoint is working correctly - the 401 is because credentials are invalid or user doesn't exist.

