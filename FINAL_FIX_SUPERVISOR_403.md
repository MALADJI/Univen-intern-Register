# Final Fix: Supervisor 403 Error - Step by Step

## 🔍 Current Status

You're getting 403 Forbidden errors when the supervisor tries to access `/api/leave`. The token is being sent correctly, but Spring Security is rejecting the request.

## ✅ What We've Fixed

1. ✅ Added `CASUAL` to `LeaveType` enum (fixes the enum mismatch error)
2. ✅ Made JWT secret key persistent (fixes token invalidation on restart)
3. ✅ Added supervisor filtering logic (supervisors only see their interns' leave requests)
4. ✅ Added comprehensive logging (to diagnose authentication issues)

## 🚨 Critical: Application Must Be Restarted

**IMPORTANT:** You MUST restart your Spring Boot application for these changes to take effect:
- The enum change requires a restart
- The JWT secret key change requires a restart
- The new logging requires a restart

## 📋 Step-by-Step Fix

### Step 1: Restart Spring Boot Application
1. Stop your Spring Boot application (Ctrl+C)
2. Start it again
3. Wait for it to fully start
4. Check the console for: `✓ JWT: Using secret key from configuration`

### Step 2: Clear Browser Storage and Log In Again
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear localStorage and sessionStorage
4. **Log out and log in again** - This will generate a new token with the correct secret key

### Step 3: Check Server Logs
When you try to access `/api/leave`, check your Spring Boot console for logs like:

**If working correctly:**
```
🔍 JWT Filter: Processing request to /api/leave
   Token length: 200
   Token validation result: true
   Token username: [email]
   Token role: SUPERVISOR
✓ JWT Filter: Authenticated user: [email] (ID: [id]) with role: SUPERVISOR
🔍 [getAllLeaveRequests] Authentication check:
   - Auth object: present
   - Authenticated: true
✓ getAllLeaveRequests: User authenticated - [username] (Role: SUPERVISOR, Active: true)
```

**If token validation fails:**
```
🔍 JWT Filter: Processing request to /api/leave
   Token validation result: false
❌ JWT Token signature invalid: ...
   This usually means the secret key changed (app was restarted) or token was tampered with
```

**If user not found:**
```
❌ JWT Filter: User not found by username: [email]
   Attempting to find by email instead...
   ❌ User not found by email either: [email]
```

## 🔧 If Still Getting 403 After Restart

### Check 1: Verify User Exists and is Active
```sql
SELECT id, username, email, role, active 
FROM users 
WHERE email = 'bonisile@univen.ac.za' OR username = 'bonisile@univen.ac.za';
```

Make sure:
- User exists
- `active = TRUE` (or `1`)
- `role = 'SUPERVISOR'`

If `active` is NULL or FALSE:
```sql
UPDATE users SET active = TRUE WHERE email = 'bonisile@univen.ac.za';
```

### Check 2: Verify Supervisor Profile Exists
```sql
SELECT supervisor_id, name, email 
FROM supervisors 
WHERE email = 'bonisile@univen.ac.za';
```

If it doesn't exist, the supervisor needs to be created in the supervisors table.

### Check 3: Verify Interns Are Assigned
```sql
SELECT i.intern_id, i.name, i.email, s.supervisor_id, s.name as supervisor_name
FROM interns i
JOIN supervisors s ON i.supervisor_id = s.supervisor_id
WHERE s.email = 'bonisile@univen.ac.za';
```

This should return at least one intern. If it's empty, no interns are assigned to this supervisor.

### Check 4: Verify JWT Token
1. Copy the token from browser DevTools (Network tab → Request Headers → Authorization)
2. Decode it at https://jwt.io
3. Check:
   - The `sub` field should match the supervisor's email or username
   - The `role` field should be `SUPERVISOR`
   - The token should not be expired

## 🎯 Expected Behavior After Fix

1. **On Application Start:**
   ```
   ✓ JWT: Using secret key from configuration
   ```

2. **When Supervisor Accesses Leave Requests:**
   - Token is validated successfully
   - User is found in database
   - Authentication is set
   - Controller receives request
   - Leave requests are filtered by assigned interns
   - Response is returned successfully

3. **In Supervisor Dashboard:**
   - Leave requests from assigned interns are displayed
   - No 403 errors
   - "Total Requests" shows the correct count

## 📝 Summary

The main issues were:
1. **Enum mismatch** - Database had 'CASUAL' but enum didn't (FIXED)
2. **JWT secret key** - Was random, now persistent (FIXED)
3. **Authentication** - Need to verify user lookup works (CHECK LOGS)

**Next Steps:**
1. ✅ Restart Spring Boot application
2. ✅ Clear browser storage and log in again
3. ✅ Check server logs for authentication flow
4. ✅ Verify user exists and is active in database
5. ✅ Verify supervisor profile exists
6. ✅ Verify interns are assigned to supervisor

If you still get 403 after following these steps, **please share the server console logs** so we can see exactly where authentication is failing.

