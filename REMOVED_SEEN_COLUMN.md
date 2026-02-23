# ✅ Removed 'seen' Column

## What Was Removed

1. **Entity Field**: Removed `seen` field from `LeaveRequest.java`
2. **Controller**: 
   - Removed `seen` parameter from `getAllLeaveRequests()` endpoint
   - Removed `seen` filter logic
   - Removed `seen` from all response maps
   - Removed endpoints: `PUT /api/leave/{id}/seen`, `PUT /api/leave/reset-seen`, `PUT /api/leave/mark-all-seen`
3. **Service**: 
   - Removed `markAsSeen()`, `markAllAsSeen()`, `resetAllSeen()` methods
   - Removed `seen` initialization in `submitLeaveRequest()`

## 📋 Next Steps

### 1. Run SQL to Drop Column

Run this SQL in your MySQL database:

```sql
ALTER TABLE leave_requests DROP COLUMN IF EXISTS seen;
```

Or if your MySQL version doesn't support `IF EXISTS`:

```sql
ALTER TABLE leave_requests DROP COLUMN seen;
```

### 2. Restart Spring Boot Application

After running the SQL, restart your Spring Boot application:

```bash
# Stop (Ctrl+C)
mvn spring-boot:run
```

## ✅ After These Steps

The 500 error should be resolved! The endpoint `GET /api/leave` should now work without any issues related to the `seen` column.

