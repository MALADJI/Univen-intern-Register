# Quick Fix: Admin 403 Forbidden Error

## ✅ The `active` Column Already Exists

The error `Duplicate column name 'active'` means the column is already in the database. You just need to **update the values**, not add the column.

## 🚀 Quick Fix (Run This SQL)

```sql
-- Step 1: Activate ALL admins (satisfies safe update mode)
UPDATE admins 
SET active = TRUE 
WHERE admin_id > 0;

-- Step 2: Set any NULL values to TRUE
UPDATE admins 
SET active = TRUE 
WHERE active IS NULL 
  AND admin_id > 0;

-- Step 3: Verify
SELECT admin_id, name, email, active FROM admins WHERE email = 'admin@univen.ac.za';
```

## ✅ What This Does

1. **Activates all admins** using `admin_id > 0` (satisfies MySQL safe update mode)
2. **Sets NULL values to TRUE** (backward compatibility)
3. **Verifies the fix** by showing the admin status

## 🔄 After Running SQL

1. **Restart Spring Boot application** (to reload database changes)
2. **Try logging in** as admin
3. **Check server console** for login logs

## 📝 Why Safe Update Mode Error?

MySQL safe update mode requires using a PRIMARY KEY (`admin_id`) in the WHERE clause. Using `admin_id > 0` satisfies this requirement.

## ✅ Expected Result

After running the SQL:
- All admins will have `active = TRUE` (or `1`)
- Admin login should work
- No more 403 Forbidden errors

## 🐛 If Still Getting 403

1. **Check server logs** - Look for:
   - `✓ Admin account is active: true`
   - `⚠️ Admin active field is NULL - treating as active`

2. **Verify in database:**
   ```sql
   SELECT admin_id, email, active FROM admins WHERE email = 'admin@univen.ac.za';
   ```
   Should show `active = 1` or `active = TRUE`

3. **Restart application** - Database changes need app restart

4. **Clear browser cache** and try again

