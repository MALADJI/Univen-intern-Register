# Fix 403 Error - Activate Supervisor User

## 🔍 Problem

MySQL safe update mode requires using a key column (like `id` or `email`) in the WHERE clause.

## ✅ Solutions

### Option 1: Update by Email (Recommended)

If you know the supervisor's email:

```sql
UPDATE users SET active = TRUE WHERE email = 'supervisor@univen.ac.za';
```

### Option 2: Find Supervisor First, Then Update

**Step 1:** Find the supervisor's ID or email:

```sql
SELECT id, username, email, role, active FROM users WHERE role = 'SUPERVISOR';
```

**Step 2:** Update using the ID (from Step 1):

```sql
UPDATE users SET active = TRUE WHERE id = 1; -- Replace 1 with the actual ID
```

### Option 3: Update All Supervisors Using Email

Since `email` is a unique column, this should work:

```sql
UPDATE users SET active = TRUE WHERE role = 'SUPERVISOR' AND email IS NOT NULL;
```

### Option 4: Disable Safe Update Mode (Not Recommended)

If you really need to update without a key:

1. In MySQL Workbench: **Edit → Preferences → SQL Editor**
2. Uncheck **"Safe Updates"**
3. Reconnect to the database
4. Run your original query

**⚠️ Warning:** This disables safety checks. Use with caution!

## 🎯 Quick Fix

**Most likely, you just need to use the email:**

```sql
-- First, check which supervisors exist:
SELECT id, username, email, role, active FROM users WHERE role = 'SUPERVISOR';

-- Then update by email:
UPDATE users SET active = TRUE WHERE email = 'supervisor@univen.ac.za';
```

Replace `'supervisor@univen.ac.za'` with the actual supervisor email from the SELECT query.

## ✅ After Running the Update

1. **Restart your Spring Boot application**
2. **Try the request again**
3. **Check server logs** for authentication messages

The 403 error should be resolved!

