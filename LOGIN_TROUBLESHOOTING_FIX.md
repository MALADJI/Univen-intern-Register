# Login Troubleshooting & Fix

## ✅ Fixes Applied

### 1. **Login Now Supports Both Username and Email**
- Login can now find users by both `username` and `email`
- If username search fails, it tries email search
- This handles cases where users register with email

### 2. **Enhanced Debugging**
- Added detailed logging to show:
  - What username/email is being searched
  - Whether user was found
  - Password verification status
  - User details (username, email, role)

### 3. **Better Error Messages**
- More specific error messages
- Logs show exactly what went wrong

---

## 🔍 How to Debug Login Issues

### Step 1: Check Console Logs

When you try to login, check the server console for messages like:

```
✓ User found:
  Username: admin@univen.ac.za
  Email: admin@univen.ac.za
  Role: ADMIN
  Stored password hash: $2a$10$...
```

Or if login fails:
```
✗ Login attempt failed: Invalid password for user - admin@univen.ac.za
  Password provided: ***8 chars
  Password verification result: false
```

### Step 2: Verify User Exists

**Check if user exists in database:**
```sql
SELECT * FROM users WHERE username = 'your-email@univen.ac.za';
-- OR
SELECT * FROM users WHERE email = 'your-email@univen.ac.za';
```

### Step 3: Test with Default Users

If you reset the database, default users are:
- `admin@univen.ac.za` / `admin123`
- `supervisor@univen.ac.za` / `supervisor123`
- `intern@univen.ac.za` / `intern123`

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid credentials" - User Not Found

**Possible causes:**
- Wrong username/email
- User not registered properly
- Email/username mismatch

**Solution:**
1. Check what you registered with (email or username)
2. Use the exact same email/username in login
3. Check database to see if user exists

### Issue 2: "Invalid credentials" - Password Mismatch

**Possible causes:**
- Wrong password
- Password was not hashed during registration
- Password contains special characters that need encoding

**Solution:**
1. Try the exact password you used during registration
2. Check console logs to see password verification result
3. If password was plain text in DB, it needs to be reset

### Issue 3: User Registered but Password Not Hashed

**If this happened:**
- The password in database might be stored as plain text
- You'll need to reset the password

**Solution:**
1. Reset the database (see `RESET_DATABASE.md`)
2. Register again with verification code
3. Or manually update password hash in database

---

## 🔧 Quick Fix: Reset Password for Existing User

If you need to reset a user's password:

### Option 1: Reset Database
```sql
DELETE FROM users WHERE username = 'your-email@univen.ac.za';
```
Then register again.

### Option 2: Update Password Hash Manually
```sql
-- Generate BCrypt hash for password "Admin123!"
-- Use online BCrypt generator or Spring's BCryptPasswordEncoder
UPDATE users SET password = '$2a$10$...' WHERE username = 'your-email@univen.ac.za';
```

### Option 3: Use API Endpoint
The `/api/admins/reset-database` endpoint will clear all users, then you can register fresh.

---

## ✅ Testing Login

### Test 1: Login with Default User
```bash
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "admin@univen.ac.za",
  "password": "admin123"
}
```

### Test 2: Login with Registered User
```bash
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "your-registered-email@univen.ac.za",
  "password": "YourPassword123!"
}
```

**Note:** Use the exact email/username and password you used during registration.

---

## 📝 What to Check

1. **Check Console Logs**
   - Look for "✓ User found:" or "✗ Login attempt failed"
   - Check password verification result

2. **Verify Database**
   - Check if user exists
   - Check if password is hashed (should start with `$2a$10$`)
   - Verify username/email matches

3. **Try Different Credentials**
   - Try default users if database was reset
   - Try registering a new user
   - Check if password requirements were met

---

## 🔐 Password Requirements

When registering, password must meet these requirements:
- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

Example valid passwords:
- `Admin123!`
- `Password123`
- `Test123!`

---

## 💡 Next Steps

1. **Check the server console** when you try to login
2. **Look for the debug messages** showing what's happening
3. **Try with default user** to verify login works
4. **If still failing**, check database to see what password hash is stored

The enhanced logging will show exactly what's happening during login attempts!

