-- Simple Admin Activation Script
-- The 'active' column already exists, so we just update values

-- Step 1: Check current status
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
ORDER BY admin_id;

-- Step 2: Activate ALL admins (satisfies safe update mode - uses PRIMARY KEY)
UPDATE admins 
SET active = TRUE 
WHERE admin_id > 0;

-- Step 3: Set any NULL values to TRUE (if any)
UPDATE admins 
SET active = TRUE 
WHERE active IS NULL 
  AND admin_id > 0;

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

-- All admins should now show 'ACTIVE ✓'

