# Fix 403 Forbidden Error

## 🔍 Problem

Getting `403 Forbidden` error when accessing `GET /api/leave` from supervisor dashboard.

## ✅ What I've Done

1. **Added better logging** to JWT filter to see what's happening
2. **Enhanced authentication logging** to debug the issue

## 🔧 Most Likely Causes

### 1. **User is Inactive**
If the user's `active` field is `false` in the database, authentication won't be set.

**Check:**
```sql
SELECT username, email, role, active FROM users WHERE email = 'your-supervisor-email@univen.ac.za';
```

**Fix:**
```sql
UPDATE users SET active = TRUE WHERE email = 'your-supervisor-email@univen.ac.za';
```

### 2. **Invalid or Expired Token**
The JWT token might be invalid or expired.

**Fix:** Log out and log back in to get a new token.

### 3. **Token Not Being Sent**
The frontend might not be sending the Authorization header.

**Check:** Open browser DevTools → Network tab → Check the request headers for `Authorization: Bearer ...`

## 📋 Next Steps

### Step 1: Check Server Logs

After restarting, when you make the request, check your Spring Boot console. You should see:

**If authentication succeeds:**
```
✓ JWT Filter: Authenticated user: supervisor@univen.ac.za with role: SUPERVISOR
```

**If authentication fails:**
```
❌ JWT Filter: User is inactive: supervisor@univen.ac.za
```
or
```
❌ JWT Filter: Invalid token for /api/leave
```
or
```
❌ JWT Filter: No Authorization header for /api/leave
```

### Step 2: Check User Status in Database

```sql
SELECT username, email, role, active FROM users WHERE role = 'SUPERVISOR';
```

Make sure `active = 1` (or `TRUE`).

### Step 3: Verify Token

1. Open browser DevTools (F12)
2. Go to Application/Storage → Local Storage
3. Find your token
4. Copy it
5. Check if it's valid at https://jwt.io

### Step 4: Restart Application

After making any database changes, restart Spring Boot:

```bash
# Stop (Ctrl+C)
mvn spring-boot:run
```

## 🎯 Quick Fix

If the user is inactive, run:

```sql
UPDATE users SET active = TRUE;
```

Then restart the application and try again.

## ✅ After Fix

The endpoint should work! Check the server console for the authentication log message.

