-- Fix Admin Activation - Safe Update Mode Compatible
-- This query uses admin_id (PRIMARY KEY) to satisfy MySQL safe update mode

-- Step 1: Find the admin_id for the admin you want to activate
SELECT admin_id, name, email, active 
FROM admins 
WHERE email = 'admin@univen.ac.za';

-- Step 2: Activate using admin_id (PRIMARY KEY - satisfies safe update mode)
-- Replace 'X' with the actual admin_id from Step 1
UPDATE admins 
SET active = TRUE 
WHERE admin_id = X;  -- Replace X with actual admin_id

-- OR: Activate ALL admins (if safe update mode allows)
UPDATE admins 
SET active = TRUE 
WHERE admin_id > 0;

-- Step 3: Verify the activation
SELECT admin_id, name, email, active,
    CASE 
        WHEN active IS NULL THEN 'NULL'
        WHEN active = 1 THEN 'ACTIVE ✓'
        WHEN active = 0 THEN 'DEACTIVATED ✗'
        ELSE 'UNKNOWN'
    END as status
FROM admins
WHERE email = 'admin@univen.ac.za';

-- Step 4: If active column doesn't exist, add it first
ALTER TABLE admins ADD COLUMN active BOOLEAN DEFAULT TRUE;

-- Then set all existing admins to active
UPDATE admins SET active = TRUE WHERE admin_id > 0;

