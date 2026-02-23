# Fix 500 Error: GET /api/leave

## 🔍 Problem

**Error:** `GET http://localhost:8082/api/leave 500 (Internal Server Error)`

**Root Cause:** The `seen` column doesn't exist in the `leave_requests` table. The code was updated to use the `seen` field, but the database migration hasn't been run yet.

## ✅ Solution

### Step 1: Run Database Migration

You need to add the `seen` column to the `leave_requests` table:

```sql
ALTER TABLE leave_requests 
ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;

UPDATE leave_requests SET seen = FALSE WHERE seen IS NULL;
```

**Or run the migration file:**
```bash
mysql -u your_username -p your_database < ADD_SEEN_FIELD_TO_LEAVE_REQUESTS.sql
```

### Step 2: Restart Spring Boot Application

After running the migration, restart your application:
```bash
mvn spring-boot:run
```

## 🔧 Alternative: Temporary Fix (If Migration Can't Run Now)

If you can't run the migration immediately, I can make the code handle missing columns gracefully. However, **the proper fix is to run the migration**.

## 📋 Quick Fix Commands

### Option 1: Using MySQL Command Line
```bash
mysql -u root -p your_database_name
```

Then run:
```sql
ALTER TABLE leave_requests ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
UPDATE leave_requests SET seen = FALSE WHERE seen IS NULL;
EXIT;
```

### Option 2: Using Migration File
```bash
mysql -u root -p your_database_name < ADD_SEEN_FIELD_TO_LEAVE_REQUESTS.sql
```

### Option 3: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Run this SQL:
```sql
ALTER TABLE leave_requests 
ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;

UPDATE leave_requests SET seen = FALSE WHERE seen IS NULL;
```

## ✅ Verify Fix

After running the migration and restarting:

1. **Check if column exists:**
```sql
DESCRIBE leave_requests;
-- Should show 'seen' column
```

2. **Test the endpoint:**
```bash
curl http://localhost:8082/api/leave \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Check supervisor dashboard** - Should now load leave requests without error

## 🎯 Summary

**The Issue:** Database column `seen` is missing  
**The Fix:** Run the migration SQL  
**The Result:** Endpoint will work correctly

