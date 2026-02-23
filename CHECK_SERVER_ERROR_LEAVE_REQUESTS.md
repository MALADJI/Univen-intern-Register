# Check Server Error for Leave Requests

## 🔍 To Find the Actual Error

The 500 error means there's an exception on the server. Check your **Spring Boot console/terminal** where the application is running.

### Look for:
1. **Stack trace** starting with `java.lang.Exception` or `java.sql.SQLException`
2. **Error message** that tells you what went wrong
3. **Line numbers** showing where the error occurred

## 🎯 Most Likely Causes

### 1. Column 'seen' Doesn't Exist
**Error will say:** `Column 'seen' doesn't exist` or `Unknown column 'seen'`

**Fix:**
```sql
ALTER TABLE leave_requests ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
```
Then **restart** the application.

### 2. Application Not Restarted
**Symptom:** Column exists but still getting error

**Fix:** Restart Spring Boot:
```bash
# Stop (Ctrl+C)
mvn spring-boot:run
```

### 3. NullPointerException
**Error will say:** `java.lang.NullPointerException`

**Possible causes:**
- `req.getStatus()` is null
- `req.getIntern()` is null

**Fix:** I've added null checks in the code. Restart the application.

## 📋 Quick Diagnostic

### Step 1: Verify Column Exists
```sql
DESCRIBE leave_requests;
```
Look for `seen` column in the output.

### Step 2: Check Server Logs
Look at your Spring Boot console for the actual error message.

### Step 3: Test Directly
```bash
curl http://localhost:8082/api/leave \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 What I Just Fixed

I've added null safety checks to prevent NullPointerException:
- ✅ Added null check for `req.getStatus()` in status filtering
- ✅ Added null check in `getLeaveRequestsByStatus()` method

**After these fixes, restart your application!**

## 📝 Next Steps

1. **Check the server console** for the actual error message
2. **Verify the column exists** with `DESCRIBE leave_requests;`
3. **Restart the application** after any code/database changes
4. **Share the error message** from the console if it still fails

The error message in the console will tell us exactly what's wrong!

