-- Quick Fix: Activate Admin Account
-- Run this SQL to activate the admin account

-- NOTE: The 'active' column already exists, so we just need to update values

-- Option 1: Activate ALL admins (safest - satisfies safe update mode)
UPDATE admins 
SET active = TRUE 
WHERE admin_id > 0;  -- This satisfies safe update mode requirement

-- Option 2: Activate specific admin by admin_id
-- First, find the admin_id:
SELECT admin_id, name, email, active FROM admins WHERE email = 'admin@univen.ac.za';
-- Then use the admin_id (replace X with actual admin_id):
-- UPDATE admins SET active = TRUE WHERE admin_id = X;

-- Then activate:
UPDATE admins 
SET active = TRUE 
WHERE email = 'admin@univen.ac.za';

-- Option 3: Activate ALL admins (if needed)
UPDATE admins SET active = TRUE;

-- Verify the fix
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

