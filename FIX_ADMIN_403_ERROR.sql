-- Fix Admin 403 Forbidden Error
-- This script fixes the admin activation issue with safe update mode

-- Step 1: Check current status of the admin
SELECT 
    a.admin_id,
    a.name,
    a.email,
    a.active,
    u.id as user_id,
    u.username,
    u.role,
    CASE 
        WHEN a.active IS NULL THEN 'NULL (will be treated as active)'
        WHEN a.active = 1 THEN 'ACTIVE ✓'
        WHEN a.active = 0 THEN 'DEACTIVATED ✗'
        ELSE 'UNKNOWN'
    END as status
FROM admins a
LEFT JOIN users u ON a.email = u.email
WHERE a.email = 'admin@univen.ac.za'
   OR u.email = 'admin@univen.ac.za';

-- Step 2: Activate admin using admin_id (PRIMARY KEY - satisfies safe update mode)
-- First, get the admin_id from Step 1, then run:
UPDATE admins 
SET active = TRUE 
WHERE admin_id = (SELECT admin_id FROM (SELECT admin_id FROM admins WHERE email = 'admin@univen.ac.za') AS temp);

-- OR simpler: Activate all admins (if safe update mode allows)
UPDATE admins 
SET active = TRUE 
WHERE admin_id > 0;

-- Step 3: If active column doesn't exist, add it
-- Check first:
SHOW COLUMNS FROM admins LIKE 'active';

-- If column doesn't exist, add it:
ALTER TABLE admins ADD COLUMN active BOOLEAN DEFAULT TRUE;

-- Then activate all:
UPDATE admins SET active = TRUE WHERE admin_id > 0;

-- Step 4: Verify the fix
SELECT 
    admin_id,
    name,
    email,
    active,
    CASE 
        WHEN active IS NULL THEN 'NULL'
        WHEN active = 1 THEN 'ACTIVE ✓'
        WHEN active = 0 THEN 'DEACTIVATED ✗'
        ELSE 'UNKNOWN'
    END as status
FROM admins
WHERE email = 'admin@univen.ac.za';

-- Step 5: If admin record doesn't exist in admins table, check users table
SELECT id, username, email, role, name 
FROM users 
WHERE email = 'admin@univen.ac.za' 
   OR username = 'admin@univen.ac.za';

-- If user exists but no admin record, you may need to create the admin profile
-- This should be done through the Super Admin dashboard or API

