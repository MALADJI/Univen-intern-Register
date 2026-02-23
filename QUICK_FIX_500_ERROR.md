# 🚨 Quick Fix: 500 Error on GET /api/leave

## Problem
The endpoint `GET /api/leave` is returning a 500 Internal Server Error because the `seen` column doesn't exist in the `leave_requests` table.

## ✅ Solution: Run Database Migration

**You MUST run this SQL to fix the error:**

```sql
ALTER TABLE leave_requests 
ADD COLUMN seen BOOLEAN DEFAULT FALSE NULL;
```

**Or if you want it to be NOT NULL (recommended):**

```sql
ALTER TABLE leave_requests 
ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
```

## 🔧 How to Run the Migration

### Option 1: MySQL Command Line
```bash
mysql -u root -p your_database_name
```

Then paste:
```sql
ALTER TABLE leave_requests ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
```

### Option 2: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Run:
```sql
ALTER TABLE leave_requests ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;
```

### Option 3: Using the Migration File
```bash
mysql -u root -p your_database_name < ADD_SEEN_FIELD_TO_LEAVE_REQUESTS.sql
```

## ⚠️ Important: Restart Application

After running the migration, **restart your Spring Boot application**:
```bash
# Stop the current application (Ctrl+C)
# Then restart:
mvn spring-boot:run
```

## ✅ Verify Fix

After restarting, test the endpoint:
```bash
curl http://localhost:8082/api/leave \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The error should be gone!

## 📋 Why This Happened

1. I added the `seen` field to the `LeaveRequest` entity
2. The code tries to read `req.getSeen()` 
3. But the database column doesn't exist yet
4. Hibernate throws an error when trying to map the entity
5. This causes a 500 Internal Server Error

**The fix:** Add the column to the database, then restart the application.

