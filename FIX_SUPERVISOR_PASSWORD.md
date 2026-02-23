# Fix: supervisor@univen.ac.za Password Issue

## 🔍 Problem

The user `supervisor@univen.ac.za` exists in the database but login returns 401 Unauthorized.

## 🔍 Possible Causes

1. **Password not hashed** - Password was stored as plain text instead of BCrypt hash
2. **Wrong password** - Using incorrect password
3. **Password hash mismatch** - Password was hashed with different encoder

## ✅ Solution: Reset Password

### Option 1: Check Backend Logs First

When you try to login, check your backend console. You should see:

```
=== LOGIN ATTEMPT ===
Username: supervisor@univen.ac.za
✓ User found: supervisor@univen.ac.za (Role: SUPERVISOR, Email: supervisor@univen.ac.za)
Password valid: false  ← This tells us the password doesn't match
```

**If you see "Password valid: false":**
- The password hash in database doesn't match what you're entering
- Need to reset the password

### Option 2: Reset Password via SQL (Quick Fix)

If you have database access, you can reset the password directly:

```sql
-- Check current password hash
SELECT id, username, password FROM users WHERE username = 'supervisor@univen.ac.za';

-- The password should start with $2a$ (BCrypt hash)
-- If it doesn't, it's not hashed correctly
```

**To reset password to "supervisor123":**
```sql
-- Generate BCrypt hash for "supervisor123"
-- Use this online tool: https://bcrypt-generator.com/
-- Or use Spring's BCryptPasswordEncoder

-- Then update:
UPDATE users 
SET password = '$2a$10$...'  -- Replace with actual BCrypt hash
WHERE username = 'supervisor@univen.ac.za';
```

### Option 3: Use Forgot Password Feature

1. **Request password reset code:**
   ```
   POST /api/auth/forgot-password
   { "email": "supervisor@univen.ac.za" }
   ```

2. **Get the code** from response (or check backend logs)

3. **Reset password:**
   ```
   POST /api/auth/reset-password
   {
     "email": "supervisor@univen.ac.za",
     "code": "123456",
     "newPassword": "supervisor123"
   }
   ```

### Option 4: Delete and Recreate User

If nothing else works, delete the user and let it recreate on next startup:

```sql
DELETE FROM users WHERE username = 'supervisor@univen.ac.za';
```

Then restart backend - it will recreate the user with correct password hash.

## 🧪 Test After Fix

After resetting password, try login:

```javascript
fetch('http://localhost:8082/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'supervisor@univen.ac.za',
    password: 'supervisor123'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Login successful:', data);
})
.catch(e => console.error('❌ Error:', e));
```

## 📋 What to Check

1. **Backend logs** - What does "Password valid:" show?
2. **Database password** - Is it hashed (starts with $2a$)?
3. **Password you're using** - Is it exactly "supervisor123"?

Share what you see in the backend logs when you try to login!

