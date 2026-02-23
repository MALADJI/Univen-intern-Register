# Fix: Supervisor 403 Error on Leave Requests

## 🔍 Problem

Supervisor was getting a 403 Forbidden error when trying to access `/api/leave` endpoint, even though:
- Authentication was successful (JWT token valid)
- User role was SUPERVISOR
- Token was being sent correctly

## ✅ Root Causes Identified

1. **JWT Filter User Lookup Issue**: When JWT token contains an email (instead of username), the filter was finding the user by email but setting authentication name to the database username, causing a mismatch when SecurityUtil tried to look it up again.

2. **Insufficient Logging**: Not enough logging to diagnose where the user lookup was failing.

3. **Missing Active Check**: The controller wasn't explicitly checking if the user is active before processing the request.

## 🔧 Fixes Applied

### 1. **Fixed JWT Filter Authentication Name**
- When user is found by email, authentication name is now set to the email (matching the token)
- This ensures SecurityUtil can find the user when it looks up by the authentication name

### 2. **Enhanced Logging**
- Added detailed logging in `SecurityUtil.getCurrentUser()` to track user lookup attempts
- Added detailed logging in `LeaveRequestController.getAllLeaveRequests()` to track authentication flow
- Added logging in JWT filter to show when users are found by email vs username

### 3. **Added Active User Check**
- Controller now explicitly checks if user is active before processing
- Returns appropriate error message if user is inactive

### 4. **Improved Error Messages**
- More descriptive error messages to help diagnose issues
- Error responses include details about what went wrong

## 📋 Changes Made

### `SecurityConfig.java` (JWT Filter):
```java
// When user found by email, set authentication name to email
UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
    user.getEmail(), null, java.util.List.of(authority));
```

### `SecurityUtil.java`:
- Added comprehensive logging for user lookup attempts
- Logs when user is found by username vs email
- Logs user role and active status

### `LeaveRequestController.java`:
- Added detailed authentication context logging
- Added explicit active user check
- Enhanced error messages with more details

## 🎯 Expected Behavior

### After Restart:

1. **JWT Filter Logs** (when supervisor accesses any endpoint):
   ```
   ✓ JWT Filter: Authenticated user: [email] (ID: [id]) with role: SUPERVISOR
   ```
   OR if found by email:
   ```
   ✓ JWT Filter: Authenticated user by email: [email] with role: SUPERVISOR
   ```

2. **SecurityUtil Logs** (when controller is called):
   ```
   🔍 [SecurityUtil] Looking up user with authentication name: [email/username]
   ✓ [SecurityUtil] Found user by email: [email] (Role: SUPERVISOR, Active: true)
   ```

3. **Controller Logs** (when accessing /api/leave):
   ```
   🔍 [getAllLeaveRequests] Authentication check:
      - Auth object: present
      - Authenticated: true
      - Principal: [email/username]
      - Name: [email/username]
      - Authorities: [ROLE_SUPERVISOR]
   ✓ getAllLeaveRequests: User authenticated - [username] (Role: SUPERVISOR, Active: true)
   🔍 Getting leave requests for role: SUPERVISOR
   Supervisor detected - filtering by assigned interns
   ✓ Found supervisor: [name] (ID: [id])
   ✓ Filtered to X leave request(s) for supervisor's interns
   ```

## 🔍 Verification Steps

1. **Restart Spring Boot application**

2. **Check server console logs** when supervisor logs in and accesses leave requests

3. **Verify supervisor user in database**:
   ```sql
   SELECT id, username, email, role, active 
   FROM users 
   WHERE role = 'SUPERVISOR' AND email = '[supervisor-email]';
   ```
   - Ensure `active` is `TRUE` (or `1`)
   - Note the `username` and `email` values

4. **Verify supervisor profile exists**:
   ```sql
   SELECT supervisor_id, name, email 
   FROM supervisors 
   WHERE email = '[supervisor-email]';
   ```

5. **Check JWT token** (decode it at jwt.io):
   - The `sub` field should match either the `username` or `email` from the database
   - The `role` field should be `SUPERVISOR`

## ⚠️ If Still Getting 403 Error

1. **Check server console logs** - Look for:
   - `❌ JWT Filter: User not found`
   - `❌ [SecurityUtil] User not found`
   - `❌ getAllLeaveRequests: User authenticated but not found in database`

2. **Verify user exists and is active**:
   ```sql
   -- Check user exists
   SELECT * FROM users WHERE email = '[supervisor-email]' OR username = '[supervisor-username]';
   
   -- Activate user if needed
   UPDATE users SET active = TRUE WHERE email = '[supervisor-email]';
   ```

3. **Check JWT token payload**:
   - Decode the JWT token (use jwt.io)
   - Verify the `sub` field matches either `username` or `email` in database
   - Verify the `role` field is `SUPERVISOR`

4. **Check supervisor profile**:
   ```sql
   SELECT * FROM supervisors WHERE email = '[supervisor-email]';
   ```

5. **Verify interns are assigned to supervisor**:
   ```sql
   SELECT i.intern_id, i.name, i.email, s.supervisor_id, s.name as supervisor_name
   FROM interns i
   JOIN supervisors s ON i.supervisor_id = s.supervisor_id
   WHERE s.email = '[supervisor-email]';
   ```

## 📝 Notes

- The JWT token's `sub` field can be either a username or email
- The system now handles both cases correctly
- Authentication name is set to match what's in the token (email or username)
- SecurityUtil will try both username and email lookups to find the user

