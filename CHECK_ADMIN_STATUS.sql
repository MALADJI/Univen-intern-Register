-- Check Admin Account Status
-- Run this SQL to check if an admin account is active or deactivated

-- 1. Check if admin exists and their active status
SELECT 
    a.admin_id,
    a.name,
    a.email,
    a.active,
    u.id as user_id,
    u.username,
    u.role,
    u.email as user_email
FROM admins a
LEFT JOIN users u ON a.email = u.email
WHERE a.email = 'admin@univen.ac.za'
   OR u.email = 'admin@univen.ac.za';

-- 2. Check all admins and their status
SELECT 
    a.admin_id,
    a.name,
    a.email,
    a.active,
    CASE 
        WHEN a.active IS NULL THEN 'NULL (defaults to active)'
        WHEN a.active = 1 THEN 'ACTIVE'
        WHEN a.active = 0 THEN 'DEACTIVATED'
        ELSE 'UNKNOWN'
    END as status_description
FROM admins a
ORDER BY a.admin_id;

-- 3. Activate an admin account (if deactivated)
-- Replace 'admin@univen.ac.za' with the actual admin email
UPDATE admins 
SET active = TRUE 
WHERE email = 'admin@univen.ac.za';

-- 4. Check if active column exists (if you get an error)
SHOW COLUMNS FROM admins LIKE 'active';

-- 5. Add active column if it doesn't exist
ALTER TABLE admins ADD COLUMN active BOOLEAN DEFAULT TRUE;

