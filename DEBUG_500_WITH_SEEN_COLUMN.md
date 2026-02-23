# Debug 500 Error - Column Exists

## ✅ Column Exists But Still Getting 500 Error

Since the `seen` column exists in your database, the issue is likely something else.

## 🔍 Check Server Logs

**CRITICAL:** Look at your Spring Boot console/terminal for the **actual error message**. The error will tell us exactly what's wrong.

### Common Issues When Column Exists:

### 1. Data Type Mismatch
**Error:** `Data truncation: Incorrect integer value` or similar

**Check:** What data type is the column?
```sql
DESCRIBE leave_requests;
```

**Expected:** `seen` should be `tinyint(1)` or `boolean`

**If different:** The column might be the wrong type. MySQL uses `tinyint(1)` for BOOLEAN.

### 2. Null Values in Existing Records
**Error:** `Column 'seen' cannot be null`

**Fix:** Update existing records:
```sql
UPDATE leave_requests SET seen = FALSE WHERE seen IS NULL;
```

### 3. Hibernate/JPA Mapping Issue
**Error:** `Could not determine type` or mapping errors

**Check:** The entity field should match the database column type.

### 4. Application Not Restarted
**Symptom:** Code changes not reflected

**Fix:** Restart Spring Boot application

## 🎯 Diagnostic Steps

### Step 1: Check Column Definition
```sql
DESCRIBE leave_requests;
```

Look at the `seen` column:
- **Type:** Should be `tinyint(1)` or `boolean`
- **Null:** Should be `YES` or `NO` (depending on your migration)
- **Default:** Should be `0` or `FALSE`

### Step 2: Check Existing Data
```sql
SELECT requestId, seen FROM leave_requests LIMIT 5;
```

Check if there are any NULL values or invalid data.

### Step 3: Check Server Logs
**This is the most important step!**

Look at your Spring Boot console and find the error. It will look like:
```
java.sql.SQLException: ...
or
java.lang.NullPointerException: ...
or
org.hibernate.exception.SQLGrammarException: ...
```

### Step 4: Test the Column Directly
```sql
-- Try to select with the seen column
SELECT requestId, seen, status FROM leave_requests LIMIT 1;
```

If this works, the column is fine. If it fails, there's a database issue.

## 🔧 Quick Fixes to Try

### Fix 1: Update Existing Records
```sql
UPDATE leave_requests SET seen = FALSE WHERE seen IS NULL;
```

### Fix 2: Verify Column Type
```sql
-- Check column type
SHOW COLUMNS FROM leave_requests WHERE Field = 'seen';
```

If it's not `tinyint(1)`, you might need to alter it:
```sql
ALTER TABLE leave_requests MODIFY COLUMN seen TINYINT(1) DEFAULT 0;
```

### Fix 3: Restart Application
Make sure you've restarted Spring Boot after any code changes.

## 📋 What to Share

Please share:
1. **The exact error message** from your Spring Boot console
2. **Result of:** `DESCRIBE leave_requests;` (especially the `seen` row)
3. **Result of:** `SELECT requestId, seen FROM leave_requests LIMIT 1;`

This will help identify the exact issue!

