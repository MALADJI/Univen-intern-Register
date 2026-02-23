# Fix: Supervisor Access to Leave Requests

## 🔍 Problem

Supervisor dashboard was getting a 403 Forbidden error when trying to access `/api/leave` endpoint to fetch leave requests from interns.

## ✅ Root Cause

1. The endpoint allowed supervisors, but didn't filter leave requests to only show requests from interns assigned to that supervisor
2. The `LeaveRequestRepository` wasn't eagerly loading the supervisor relationship, which could cause lazy loading issues

## 🔧 Fixes Applied

### 1. **Added Supervisor Filtering**
- Supervisors now only see leave requests from interns assigned to them
- Added logic to find the supervisor by email and filter leave requests accordingly

### 2. **Updated LeaveRequestRepository**
- Added `intern.supervisor` to the `@EntityGraph` to eagerly load supervisor relationship
- Prevents lazy loading exceptions when filtering by supervisor

### 3. **Enhanced Error Handling**
- Better error messages if supervisor profile is not found
- Detailed logging for debugging

## 📋 Changes Made

### `LeaveRequestController.java`:
1. Added `SupervisorRepository` dependency
2. Added supervisor filtering logic:
   - Finds supervisor by email
   - Filters leave requests to only include those from assigned interns
   - Returns appropriate error if supervisor profile not found

### `LeaveRequestRepository.java`:
1. Updated `@EntityGraph` to include `intern.supervisor`
   - Changed from: `{"intern", "intern.department"}`
   - Changed to: `{"intern", "intern.department", "intern.supervisor"}`

## 🎯 Expected Behavior

### For Supervisors:
- Can access `/api/leave` endpoint
- Only see leave requests from interns assigned to them
- Can approve/reject leave requests from their interns

### For Admins:
- Can access `/api/leave` endpoint
- See all leave requests (or filtered by department if `departmentId` is provided)

### For Interns:
- Can access `/api/leave` endpoint
- Only see their own leave requests

## 🔍 Verification

After restarting the Spring Boot application:

1. **Check server logs** when supervisor accesses leave requests:
   ```
   ✓ getAllLeaveRequests: User authenticated - [username] (Role: SUPERVISOR)
   🔍 Getting leave requests for role: SUPERVISOR
   Supervisor detected - filtering by assigned interns
   ✓ Found supervisor: [name] (ID: [id])
   ✓ Filtered to X leave request(s) for supervisor's interns
   ```

2. **Test supervisor access:**
   - Login as supervisor
   - Navigate to supervisor dashboard
   - Click on leave requests section
   - Should see leave requests from assigned interns only

## ⚠️ If Still Getting 403 Error

1. **Check supervisor user exists:**
   ```sql
   SELECT id, username, email, role, active 
   FROM users 
   WHERE role = 'SUPERVISOR' AND email = '[supervisor-email]';
   ```
   Make sure `active` is `TRUE` (or `1`).

2. **Check supervisor profile exists:**
   ```sql
   SELECT supervisor_id, name, email 
   FROM supervisors 
   WHERE email = '[supervisor-email]';
   ```

3. **Check server console logs** for detailed error messages

4. **Verify JWT token** contains the correct email/username

