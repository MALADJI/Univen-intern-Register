# Debug 500 Error: GET /api/leave

## 🔍 Steps to Find the Actual Error

The 500 error means something is wrong on the server. We need to see the actual error message.

### Step 1: Check Server Logs

Look at your Spring Boot console/terminal where the application is running. You should see a stack trace with the actual error.

**Common errors:**
- `Column 'seen' doesn't exist` - Migration not run
- `NullPointerException` - Something is null
- `SQLSyntaxErrorException` - SQL error
- Other exceptions

### Step 2: Check if Column Exists

Run this SQL to verify the column was added:

```sql
DESCRIBE leave_requests;
```

Or:

```sql
SHOW COLUMNS FROM leave_requests LIKE 'seen';
```

**Expected:** You should see a `seen` column with type `tinyint(1)` or `boolean`.

### Step 3: Check Application Logs

The error should be printed in your Spring Boot console. Look for lines like:
```
java.sql.SQLException: ...
or
java.lang.NullPointerException: ...
or
org.hibernate.exception.SQLGrammarException: ...
```

## 🔧 Common Issues and Fixes

### Issue 1: Column Still Doesn't Exist
**Symptom:** Error mentions "Column 'seen' doesn't exist"

**Fix:** Run the migration:
```sql
ALTER TABLE leave_requests ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
```

### Issue 2: Application Not Restarted
**Symptom:** Column exists but still getting error

**Fix:** Restart Spring Boot application:
```bash
# Stop (Ctrl+C)
# Then restart:
mvn spring-boot:run
```

### Issue 3: NullPointerException
**Symptom:** Error mentions NullPointerException

**Possible causes:**
- `req.getStatus()` is null
- `req.getIntern()` is null
- Other null values

**Fix:** The code should handle nulls, but check the actual error in logs.

### Issue 4: Status Filter Issue
**Symptom:** Error when filtering by status

**Fix:** Check if status can be null in the filter logic.

## 🎯 Quick Diagnostic Query

Run this to check your database state:

```sql
-- Check if column exists
SHOW COLUMNS FROM leave_requests;

-- Check if there are any leave requests
SELECT COUNT(*) FROM leave_requests;

-- Check a sample record
SELECT * FROM leave_requests LIMIT 1;
```

## 📋 What to Share

If the error persists, please share:
1. **The full error message** from the Spring Boot console
2. **The result of:** `DESCRIBE leave_requests;`
3. **Whether you restarted** the application after adding the column

This will help identify the exact issue!

