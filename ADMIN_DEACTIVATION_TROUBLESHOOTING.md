# Admin Account Deactivation - Troubleshooting Guide

## Issue
Getting error when trying to login as admin:
```
Login attempt failed: Admin account is deactivated - admin@univen.ac.za
```

## Why This Happens

The admin account has been deactivated by a Super Admin. When an admin account is deactivated:
- The `active` field in the `admins` table is set to `false`
- The admin cannot log in (403 Forbidden)
- The account still exists but is disabled

## Solutions

### Solution 1: Activate Admin via Super Admin Dashboard

1. Login as **Super Admin**
2. Go to Super Admin Dashboard
3. Find the deactivated admin in the list
4. Click the green "check_circle" icon to activate
5. Admin can now log in

### Solution 2: Activate Admin via SQL

Run this SQL command in MySQL:

```sql
-- Activate the admin account
UPDATE admins 
SET active = TRUE 
WHERE email = 'admin@univen.ac.za';
```

### Solution 3: Check Admin Status

Check if admin is deactivated:

```sql
SELECT 
    admin_id,
    name,
    email,
    active,
    CASE 
        WHEN active IS NULL THEN 'NULL (defaults to active)'
        WHEN active = 1 THEN 'ACTIVE'
        WHEN active = 0 THEN 'DEACTIVATED'
        ELSE 'UNKNOWN'
    END as status
FROM admins
WHERE email = 'admin@univen.ac.za';
```

### Solution 4: Check if Active Column Exists

If you get an error about the `active` column not existing:

```sql
-- Check if column exists
SHOW COLUMNS FROM admins LIKE 'active';

-- Add column if it doesn't exist
ALTER TABLE admins ADD COLUMN active BOOLEAN DEFAULT TRUE;

-- Set all existing admins to active
UPDATE admins SET active = TRUE WHERE active IS NULL;
```

## How Admin Deactivation Works

### When Admin is Deactivated:
1. Super Admin clicks "Deactivate" button
2. `active` field set to `false` in database
3. Admin cannot log in (blocked at login endpoint)
4. Error message: "Your account has been deactivated. Please contact the Super Admin for assistance."

### When Admin is Activated:
1. Super Admin clicks "Activate" button
2. `active` field set to `true` in database
3. Admin can log in normally

## Login Flow for Admins

1. User enters credentials
2. System validates password
3. **NEW:** System checks if admin account is active
4. If deactivated → 403 Forbidden with message
5. If active → Login successful

## Quick Fix Commands

### Activate All Admins
```sql
UPDATE admins SET active = TRUE;
```

### Check All Admin Statuses
```sql
SELECT admin_id, name, email, active FROM admins;
```

### Deactivate Specific Admin (via SQL)
```sql
UPDATE admins SET active = FALSE WHERE email = 'admin@univen.ac.za';
```

## Prevention

- Only Super Admins can activate/deactivate admins
- Deactivated admins receive clear error messages
- Account data is preserved (not deleted)
- Can be reactivated at any time

## Notes

- The `active` field defaults to `true` for new admins
- Deactivation is non-destructive (data is preserved)
- Only affects login ability, not existing data
- Super Admin can always reactivate accounts

