# Fix Password Hash and Rate Limiting - Quick Guide

## 🔧 Issue: Invalid Password + Rate Limiting Lockout

You're getting:
- `✗ Login attempt failed: Invalid password for user - superadmin@univen.ac.za`
- `⚠ IP 0:0:0:0:0:0:0:1 locked out due to 5 failed login attempts`

---

## ✅ Solution 1: Restart Server (Clears Rate Limiting)

**The easiest fix is to restart your Spring Boot server:**

1. **Stop the server** (Ctrl+C in the terminal)
2. **Start it again:**
   ```bash
   mvn spring-boot:run
   ```
   OR
   ```bash
   .\mvnw.cmd spring-boot:run
   ```

This will **clear all rate limiting** (it's stored in memory).

---

## ✅ Solution 2: Clear Rate Limiting via API

I've added a new endpoint to clear rate limiting. After restarting the server, you can use:

**Clear All Lockouts:**
```
POST http://localhost:8082/api/auth/clear-rate-limit
Content-Type: application/json

{}
```

**Clear Specific IP:**
```
POST http://localhost:8082/api/auth/clear-rate-limit
Content-Type: application/json

{
  "ipAddress": "0:0:0:0:0:0:0:1"
}
```

---

## ✅ Solution 3: Fix Password Hash

The password hash in the database might be incorrect. Here's the correct SQL to update it:

### Option A: Use Correct Hash (Recommended)

Run this SQL to update the password hash:

```sql
-- Update Super Admin password hash
-- Password: superadmin123
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'superadmin@univen.ac.za' 
   OR username = 'superadmin@univen.ac.za';
```

### Option B: Generate New Hash

If the hash above doesn't work, generate a new one:

1. **Use Online BCrypt Generator:**
   - Go to: https://bcrypt-generator.com/
   - Enter password: `superadmin123`
   - Rounds: `10`
   - Copy the generated hash

2. **Update in Database:**
   ```sql
   UPDATE users 
   SET password = 'YOUR_NEW_HASH_HERE'
   WHERE email = 'superadmin@univen.ac.za';
   ```

### Option C: Use Spring Boot to Generate Hash

Create a temporary test class or add this to a controller temporarily:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("superadmin123");
System.out.println("Hash: " + hash);
```

Then update the database with the generated hash.

---

## 🎯 Complete Fix Steps

### Step 1: Restart Server
```bash
# Stop server (Ctrl+C)
# Then restart:
mvn spring-boot:run
```

### Step 2: Update Password Hash
```sql
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'superadmin@univen.ac.za';
```

### Step 3: Verify User Exists
```sql
SELECT id, username, email, role, 
       LEFT(password, 20) as password_preview
FROM users 
WHERE email = 'superadmin@univen.ac.za';
```

**Expected:**
- `role` = `SUPER_ADMIN`
- `password_preview` = `$2a$10$N9qo8uLOickgx`

### Step 4: Test Login in Postman
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

---

## 🔍 Verify Everything is Correct

Run this SQL to check:

```sql
-- Check user exists
SELECT id, username, email, role, name,
       LEFT(password, 30) as password_hash_preview
FROM users 
WHERE email = 'superadmin@univen.ac.za';

-- Check role enum includes SUPER_ADMIN
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';

-- Check admin profile exists
SELECT admin_id, name, email 
FROM admins 
WHERE email = 'superadmin@univen.ac.za';
```

---

## ⚠️ If Still Not Working

1. **Check server console logs** - They show exactly what's wrong
2. **Verify password hash** - Make sure it starts with `$2a$10$`
3. **Try generating a new hash** - Use the online generator
4. **Check if user exists** - Run the SQL queries above
5. **Restart server** - Clears rate limiting

---

## 💡 Pro Tips

- **Rate limiting is in-memory** - Restarting the server clears it
- **Password hash must match** - Use BCrypt with 10 rounds
- **Check server logs** - They show the exact error
- **Use the clear-rate-limit endpoint** - After restart, you can use it to clear lockouts without restarting

---

## 📋 Quick Checklist

- [ ] Server restarted (clears rate limiting)
- [ ] Password hash updated in database
- [ ] User exists with role `SUPER_ADMIN`
- [ ] Admin profile exists
- [ ] Role enum includes `SUPER_ADMIN`
- [ ] Login test successful in Postman

