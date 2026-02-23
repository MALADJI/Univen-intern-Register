# Fix 500 Error - Column Exists

## ✅ Column Exists But Still Getting Error

Since the `seen` column exists, try these fixes:

## 🔧 Fix 1: Restart Application (MOST IMPORTANT)

**You MUST restart Spring Boot after adding the column:**

```bash
# Stop the application (Ctrl+C)
# Then restart:
mvn spring-boot:run
```

Hibernate caches the database schema, so it needs a restart to recognize the new column.

## 🔧 Fix 2: Check Column Data Type

Run this SQL to check the column type:

```sql
DESCRIBE leave_requests;
```

**Expected:** `seen` should be `tinyint(1)` (MySQL's BOOLEAN type)

**If it's different**, fix it:
```sql
ALTER TABLE leave_requests MODIFY COLUMN seen TINYINT(1) DEFAULT 0;
```

## 🔧 Fix 3: Update Existing NULL Values

If there are existing records with NULL values:

```sql
UPDATE leave_requests SET seen = 0 WHERE seen IS NULL;
```

## 🔧 Fix 4: Clear Hibernate Cache

If restarting doesn't work, try:

1. Stop the application
2. Delete the `target/` folder:
   ```bash
   rm -rf target/
   # Or on Windows:
   rmdir /s /q target
   ```
3. Restart:
   ```bash
   mvn spring-boot:run
   ```

## 📋 Check Server Logs

**Look at your Spring Boot console** - the error message will tell us exactly what's wrong.

The error should show something like:
- `java.sql.SQLException: ...`
- `org.hibernate.exception.SQLGrammarException: ...`
- `java.lang.NullPointerException: ...`

## 🎯 Most Likely Solution

**99% of the time, it's because the application wasn't restarted!**

1. Stop Spring Boot (Ctrl+C)
2. Restart: `mvn spring-boot:run`
3. Try the endpoint again

## ✅ After Restart

The error should be gone. If not, share the **exact error message** from the Spring Boot console.

