# Fix: Leave Type Enum Mismatch Error

## 🔍 Problem

The supervisor was getting a 500 Internal Server Error (not 403) when trying to access `/api/leave`. The error was:

```
No enum constant com.internregister.entity.LeaveType.CASUAL
```

## ✅ Root Cause

The database had a leave request with `leave_type = 'CASUAL'`, but the `LeaveType` enum in Java only had:
- ANNUAL
- SICK
- PERSONAL
- EMERGENCY

When Hibernate tried to load the leave requests, it couldn't map the database value 'CASUAL' to the enum, causing the application to crash.

## 🔧 Fixes Applied

### 1. **Added CASUAL to LeaveType Enum**
- Added `CASUAL` as a valid enum value
- This allows the database records with 'CASUAL' to be loaded correctly

### 2. **Enhanced Error Handling**
- Added specific handling for enum mismatch errors in `LeaveRequestService`
- If an invalid enum value is found, it logs the error and returns an empty list instead of crashing
- This prevents the entire request from failing if there are data inconsistencies

## 📋 Changes Made

### `LeaveType.java`:
```java
public enum LeaveType {
    ANNUAL,
    SICK,
    PERSONAL,
    EMERGENCY,
    CASUAL  // ✅ Added
}
```

### `LeaveRequestService.java`:
- Added specific catch block for `IllegalArgumentException` with enum mismatch errors
- Returns empty list instead of crashing when invalid enum values are found
- Logs detailed error messages for debugging

## 🎯 Next Steps

1. **Restart Spring Boot application** - The enum change requires a restart

2. **Verify database** - Run the SQL script to check for any other invalid leave types:
   ```sql
   SELECT DISTINCT leave_type, COUNT(*) as count
   FROM leave_requests
   GROUP BY leave_type;
   ```

3. **Update database if needed** - If you want to keep CASUAL as a valid type, no action needed. If you want to change existing CASUAL records to another type:
   ```sql
   UPDATE leave_requests
   SET leave_type = 'PERSONAL'
   WHERE leave_type = 'CASUAL';
   ```

## ✅ Expected Behavior

After restart:
- Leave requests with `leave_type = 'CASUAL'` will load correctly
- Supervisor can access `/api/leave` endpoint
- Leave requests will be filtered by assigned interns
- No more enum mismatch errors

## 🔍 Verification

1. **Check server logs** - Should see:
   ```
   ✓ [Service] Repository returned X leave request(s)
   ```

2. **Test supervisor dashboard** - Should now load leave requests without errors

3. **Check database** - Verify all leave types are valid enum values

## 📝 Valid Leave Types

The following are now valid `LeaveType` enum values:
- `ANNUAL` - Annual leave
- `SICK` - Sick leave
- `PERSONAL` - Personal leave
- `EMERGENCY` - Emergency leave
- `CASUAL` - Casual leave (newly added)

If you need to add more leave types in the future:
1. Add them to the `LeaveType` enum
2. Update any existing database records if needed
3. Restart the application

