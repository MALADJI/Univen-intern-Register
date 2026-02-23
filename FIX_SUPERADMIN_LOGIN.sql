-- =====================================================
-- MySQL Script to Fix Superadmin Login
-- =====================================================
-- This script fixes the superadmin username/email and active status
-- It uses the primary key (id) in WHERE clause to avoid safe update mode issues
-- =====================================================

-- Disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Start transaction for safety
START TRANSACTION;

-- =====================================================
-- Step 1: Check current state
-- =====================================================
SELECT 'Current Superadmin Status:' as info;
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE role = 'SUPER_ADMIN';

-- =====================================================
-- Step 2: Get the superadmin ID (using a subquery workaround)
-- =====================================================
-- First, find the ID using a temporary variable approach
SELECT id INTO @superadmin_id
FROM users
WHERE role = 'SUPER_ADMIN'
ORDER BY id
LIMIT 1;

-- Alternative if SELECT INTO doesn't work, use SET with subquery
-- SET @superadmin_id = (SELECT id FROM (SELECT id FROM users WHERE role = 'SUPER_ADMIN' ORDER BY id LIMIT 1) AS temp);

SELECT CONCAT('Superadmin ID: ', COALESCE(@superadmin_id, 'NOT FOUND')) as info;

-- =====================================================
-- Step 3: Update username, email, and active status using primary key
-- =====================================================
-- Only update if we found an ID
UPDATE users
SET username = 'superadmin@univen.ac.za',
    email = 'superadmin@univen.ac.za',
    active = TRUE
WHERE id = @superadmin_id;

-- =====================================================
-- Step 4: Verify the update
-- =====================================================
SELECT 'After Update:' as info;
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE id = @superadmin_id;

-- =====================================================
-- Step 5: Test user lookup by username
-- =====================================================
SELECT 'User lookup by username:' as info;
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE username = 'superadmin@univen.ac.za';

-- =====================================================
-- Step 6: Test user lookup by email
-- =====================================================
SELECT 'User lookup by email:' as info;
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE email = 'superadmin@univen.ac.za';

-- =====================================================
-- Step 7: Commit or Rollback
-- =====================================================
-- Review the results above, then:
-- If everything looks good, commit:
COMMIT;

-- If something went wrong, rollback:
-- ROLLBACK;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

