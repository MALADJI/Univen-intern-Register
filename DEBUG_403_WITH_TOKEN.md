# Debug 403 Error - Token is Being Sent

## ✅ Good News

The request headers show:
- ✅ **Authorization header is present**: `Bearer eyJhbGciOiJIUzI1NiJ9...`
- ✅ **Token format looks correct**: JWT token structure is valid
- ✅ **Role in token**: `SUPERVISOR`
- ✅ **Username in token**: `tests@univen.ac.za`

## 🔍 Problem

The token is being sent, but you're still getting 403. This means:
1. The user might not exist in the database
2. The user might be inactive
3. The JWT filter might not be processing the token correctly

## 📋 Steps to Debug

### Step 1: Check if User Exists

Run this SQL to check if the user exists:

```sql
SELECT id, username, email, role, active FROM users WHERE email = 'tests@univen.ac.za';
```

**Expected Result:**
- User should exist
- `role` should be `SUPERVISOR`
- `active` should be `TRUE` (or `1`)

**If user doesn't exist:**
- You need to create the user or use a different account

**If user exists but `active` is `NULL` or `FALSE`:**
- Run: `UPDATE users SET active = TRUE WHERE email = 'tests@univen.ac.za';`

### Step 2: Check Server Logs

When you make the request, check your Spring Boot console. You should see one of these:

**If authentication succeeds:**
```
✓ JWT Filter: Authenticated user: tests@univen.ac.za with role: SUPERVISOR
```

**If authentication fails:**
```
❌ JWT Filter: User not found: tests@univen.ac.za
```
or
```
❌ JWT Filter: User is inactive: tests@univen.ac.za
```
or
```
❌ JWT Filter: Invalid token for /api/leave
```

### Step 3: Verify Token is Valid

The token payload shows:
- **Username**: `tests@univen.ac.za`
- **Role**: `SUPERVISOR`
- **Issued at**: 1763984901 (timestamp)
- **Expires at**: 1764071301 (timestamp)

**Check if token is expired:**
- Current timestamp: Check current time
- Token expires: 1764071301 (convert to date to see when it expires)

## 🔧 Quick Fix

### If User Doesn't Exist

You need to either:
1. **Create the user** in the database
2. **Use a different account** that exists (like `supervisor@univen.ac.za`)

### If User Exists But is Inactive

```sql
UPDATE users SET active = TRUE WHERE email = 'tests@univen.ac.za';
```

Then restart Spring Boot.

### If User is Active But Still Getting 403

Check the server logs for the exact error message. The enhanced logging I added should show what's happening.

## 🎯 Most Likely Issue

**The user `tests@univen.ac.za` probably doesn't exist in the database or is inactive.**

Run the SQL query in Step 1 to check, then fix accordingly.

## ✅ After Fixing

1. **Restart Spring Boot**
2. **Make the request again**
3. **Check server logs** for authentication message
4. **The 403 should be resolved!**

