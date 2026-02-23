# Troubleshooting: Supervisor 403 Error on /api/leave

## 🔍 Current Issue

Supervisor is getting 403 Forbidden errors when accessing `/api/leave` endpoint, even though:
- Token is being sent correctly
- Frontend authentication passes (AuthGuard, RoleGuard)
- User is logged in successfully

## 📋 What to Check

### 1. **Check Spring Boot Console Logs**

When the supervisor tries to access `/api/leave`, you should see logs like:

#### If Token is Valid:
```
🔍 JWT Filter: Processing request to /api/leave
   Token length: 200
   Token preview: eyJhbGciOiJIUzM4NCJ9...
   Token validation result: true
   Token username: [email or username]
   Token role: SUPERVISOR
✓ JWT Filter: Authenticated user: [username] (ID: [id]) with role: SUPERVISOR
```

#### If Token Validation Fails:
```
🔍 JWT Filter: Processing request to /api/leave
   Token length: 200
   Token preview: eyJhbGciOiJIUzM4NCJ9...
   Token validation result: false
❌ JWT Token signature invalid: ...
   This usually means the secret key changed (app was restarted) or token was tampered with
❌ JWT Filter: Invalid token for /api/leave
```

#### If User Not Found:
```
🔍 JWT Filter: Processing request to /api/leave
   Token validation result: true
   Token username: [email]
   Token role: SUPERVISOR
❌ JWT Filter: User not found by username: [email]
   Attempting to find by email instead...
   ❌ User not found by email either: [email]
```

### 2. **Check Controller Logs**

If the request reaches the controller, you should see:
```
🔍 [getAllLeaveRequests] Authentication check:
   - Auth object: present
   - Authenticated: true
   - Principal: [username/email]
   - Name: [username/email]
   - Authorities: [ROLE_SUPERVISOR]
🔍 [SecurityUtil] Looking up user with authentication name: [username/email]
✓ [SecurityUtil] Found user by email: [email] (Role: SUPERVISOR, Active: true)
✓ getAllLeaveRequests: User authenticated - [username] (Role: SUPERVISOR, Active: true)
```

### 3. **Common Issues and Solutions**

#### Issue 1: Token Validation Failing
**Symptoms:**
- Logs show: `Token validation result: false`
- Error: `JWT Token signature invalid`

**Solution:**
1. **User needs to log in again** - The token was signed with a different secret key
2. **Check JWT secret key** - Make sure `jwt.secret` in `application.properties` is consistent
3. **Clear browser storage** - Old tokens might be cached

#### Issue 2: User Not Found
**Symptoms:**
- Logs show: `User not found by username` and `User not found by email either`
- Token is valid but user lookup fails

**Solution:**
1. **Check user exists in database:**
   ```sql
   SELECT id, username, email, role, active 
   FROM users 
   WHERE email = '[supervisor-email]' OR username = '[supervisor-username]';
   ```

2. **Verify email/username matches token:**
   - Decode the JWT token at https://jwt.io
   - Check the `sub` field (this is the username/email in the token)
   - Make sure it matches either `username` or `email` in the database

3. **Check user is active:**
   ```sql
   UPDATE users SET active = TRUE WHERE email = '[supervisor-email]';
   ```

#### Issue 3: Authentication Not Set
**Symptoms:**
- No logs from JWT Filter or Controller
- Request is rejected before reaching controller

**Solution:**
1. **Check if JWT filter is running** - You should see `🔍 JWT Filter: Processing request` logs
2. **Verify token format** - Token should start with `eyJ` and be a valid JWT
3. **Check Authorization header** - Should be `Bearer [token]`

#### Issue 4: User Inactive
**Symptoms:**
- Logs show: `User is inactive` or `User found but is inactive`

**Solution:**
```sql
UPDATE users SET active = TRUE WHERE email = '[supervisor-email]';
```

## 🔧 Quick Fixes

### Fix 1: Force User to Log In Again
1. Clear browser localStorage/sessionStorage
2. Log out and log in again
3. This will generate a new token with the current secret key

### Fix 2: Verify User in Database
```sql
-- Check supervisor user
SELECT id, username, email, role, active 
FROM users 
WHERE role = 'SUPERVISOR';

-- Activate if needed
UPDATE users SET active = TRUE WHERE role = 'SUPERVISOR' AND active IS NULL;

-- Check supervisor profile
SELECT supervisor_id, name, email 
FROM supervisors;
```

### Fix 3: Verify JWT Secret Key
1. Check `src/main/resources/application.properties`:
   ```properties
   jwt.secret=MyDefaultJwtSecretKeyForDevelopmentOnlyMustBeAtLeast32CharactersLong
   ```

2. Make sure it's the same value that was used when tokens were issued

3. If you changed it, all users need to log in again

## 📝 Next Steps

1. **Restart Spring Boot application** to apply the new logging

2. **Try accessing `/api/leave` as supervisor**

3. **Check Spring Boot console** for the detailed logs

4. **Share the logs** - Copy the relevant log lines starting with:
   - `🔍 JWT Filter:`
   - `❌ JWT Filter:`
   - `✓ JWT Filter:`
   - `🔍 [getAllLeaveRequests]`
   - `🔍 [SecurityUtil]`

5. **Based on the logs**, we can identify the exact issue and fix it

## 🎯 Expected Flow

1. **Request arrives** → JWT Filter processes it
2. **Token validated** → User looked up in database
3. **Authentication set** → Spring Security allows request
4. **Controller receives request** → SecurityUtil gets current user
5. **Supervisor filtering** → Leave requests filtered by assigned interns
6. **Response returned** → Leave requests sent to frontend

If any step fails, the logs will show exactly where it's failing.

