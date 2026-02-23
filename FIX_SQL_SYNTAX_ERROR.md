# Fix SQL Syntax Error

## ❌ Error
```
Error Code: 1064. You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'DEFAUL' at line 2
```

**Problem:** Typo - "DEFAUL" instead of "DEFAULT"

## ✅ Correct SQL

Use this SQL (note: **DEFAULT** not "DEFAUL"):

```sql
ALTER TABLE leave_requests 
ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
```

## 📋 Step-by-Step

1. **Copy this exact SQL:**
```sql
ALTER TABLE leave_requests ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
```

2. **Run it in MySQL Workbench or command line**

3. **Verify it worked:**
```sql
DESCRIBE leave_requests;
```
You should see the `seen` column in the output.

4. **Restart your Spring Boot application**

## 🔍 Alternative: If Column Already Exists

If you get an error saying the column already exists, you can check first:

```sql
-- Check if column exists
SHOW COLUMNS FROM leave_requests LIKE 'seen';

-- If it doesn't exist, add it:
ALTER TABLE leave_requests ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
```

## ✅ After Running

Once the column is added, restart your Spring Boot application and the 500 error should be fixed!

