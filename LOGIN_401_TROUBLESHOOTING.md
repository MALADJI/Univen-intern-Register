# Login 401 Error - Troubleshooting Guide

## 🔍 Issue: Getting 401 Unauthorized on Login

When you get a 401 error with an empty response body, it usually means one of these:

1. **User doesn't exist in database**
2. **Password is incorrect**
3. **Password hash is wrong**
4. **Rate limiting is blocking you**

---

## ✅ Step-by-Step Fix

### Step 1: Check Server Console Logs

**IMPORTANT:** Check your Spring Boot server console. You should see detailed logs like:

```
=== LOGIN ATTEMPT ===
Username: superadmin@univen.ac.za
Password: ***
Client IP: 127.0.0.1
```

**Look for these messages:**
- `✗ Login attempt failed: User not found` → User doesn't exist
- `✗ Login attempt failed: Invalid password` → Password is wrong
- `⚠ Login blocked: IP ... is locked out` → Rate limiting

---

### Step 2: Verify Super Admin User Exists

Run this SQL in MySQL:

```sql
-- Check if Super Admin exists
SELECT id, username, email, role, name, created_at 
FROM users 
WHERE email = 'superadmin@univen.ac.za' 
   OR username = 'superadmin@univen.ac.za';

-- Check the role enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';
```

**Expected Result:**
- Should see one row with `role = 'SUPER_ADMIN'`
- Role enum should include `'SUPER_ADMIN'`

**If user doesn't exist or role is wrong:**
1. Update the role enum first:
   ```sql
   ALTER TABLE users 
   MODIFY COLUMN role ENUM('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'INTERN') NOT NULL;
   ```

2. Create the Super Admin user:
   ```sql
   INSERT INTO users (username, email, password, role, name, created_at)
   VALUES ('superadmin@univen.ac.za', 'superadmin@univen.ac.za', 
           '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
           'SUPER_ADMIN', 'Super Admin', NOW());
   
   INSERT INTO admins (name, email, created_at)
   VALUES ('Super Admin', 'superadmin@univen.ac.za', NOW());
   ```

---

### Step 3: Verify Password Hash

The password hash in the SQL is for password: `superadmin123`

**If you want to use a different password**, you need to generate a new BCrypt hash.

**Option A: Use Online BCrypt Generator**
- Go to: https://bcrypt-generator.com/
- Enter password: `superadmin123`
- Copy the hash (should start with `$2a$10$`)

**Option B: Generate Hash via Spring Boot**

Create a temporary test endpoint or use this Java code:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("superadmin123");
System.out.println("Hash: " + hash);
```

---

### Step 4: Test Login in Postman

**Request:**
```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "superadmin@univen.ac.za",
  "password": "superadmin123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "superadmin@univen.ac.za",
    "email": "superadmin@univen.ac.za",
    "role": "SUPER_ADMIN",
    "name": "Super Admin"
  }
}
```

**If you still get 401:**
1. Check server console for exact error message
2. Verify password hash matches the password you're using
3. Check if rate limiting is blocking you

---

### Step 5: Clear Rate Limiting (If Locked Out)

If you see `⚠ Login blocked: IP ... is locked out` in the console:

**Option A: Wait for lockout to expire** (usually 15-30 minutes)

**Option B: Restart the server** (clears in-memory rate limiting)

**Option C: Clear rate limiting in database** (if using database-backed rate limiting)

---

## 🧪 Quick Test Script

Run this SQL to verify everything is set up correctly:

```sql
-- 1. Check role enum
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';

-- 2. Check if Super Admin exists
SELECT id, username, email, role, name, 
       LEFT(password, 20) as password_preview
FROM users 
WHERE email = 'superadmin@univen.ac.za';

-- 3. Check Admin profile
SELECT admin_id, name, email 
FROM admins 
WHERE email = 'superadmin@univen.ac.za';
```

**Expected Results:**
- Role enum should include `'SUPER_ADMIN'`
- User should exist with `role = 'SUPER_ADMIN'`
- Password should start with `$2a$10$`
- Admin profile should exist

---

## 🔧 Common Issues & Solutions

### Issue 1: "User not found"
**Solution:**
- Run the SQL to create Super Admin user (see Step 2)
- Make sure email matches exactly: `superadmin@univen.ac.za`

### Issue 2: "Invalid password"
**Solution:**
- Verify you're using password: `superadmin123`
- Check password hash in database starts with `$2a$10$`
- Generate new hash if needed

### Issue 3: "Rate limiting locked out"
**Solution:**
- Restart Spring Boot server
- Wait 15-30 minutes
- Or change your IP address

### Issue 4: "Role enum doesn't include SUPER_ADMIN"
**Solution:**
- Run the ALTER TABLE command to update enum (see Step 2)
- Make sure to include all roles: `ENUM('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'INTERN')`

### Issue 5: Empty Response Body
**Solution:**
- Check server console for detailed error messages
- Make sure server is running and accessible
- Check if CORS is blocking the request

---

## 📋 Complete Setup Checklist

- [ ] Backend server is running on port 8082
- [ ] Role enum updated to include `SUPER_ADMIN`
- [ ] Super Admin user created in `users` table
- [ ] Admin profile created in `admins` table
- [ ] Password hash is correct (starts with `$2a$10$`)
- [ ] Using correct email: `superadmin@univen.ac.za`
- [ ] Using correct password: `superadmin123`
- [ ] Server console shows login attempt logs
- [ ] No rate limiting lockout active

---

## 🎯 Still Not Working?

1. **Share the server console logs** - They show exactly what's wrong
2. **Share the SQL query results** - To verify user exists
3. **Check Postman request** - Make sure:
   - Method is `POST`
   - URL is `http://localhost:8082/api/auth/login`
   - Headers include `Content-Type: application/json`
   - Body is valid JSON with `username` and `password` fields

---

## 💡 Pro Tip

**Always check the server console first!** The logs will tell you exactly what's wrong:
- User not found → Create the user
- Invalid password → Check password/hash
- Rate limited → Wait or restart server

