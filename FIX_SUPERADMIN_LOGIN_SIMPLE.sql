-- =====================================================
-- MySQL Script to Fix Superadmin Login (Simple Version)
-- =====================================================
-- This script fixes the superadmin username/email and active status
-- Uses a workaround to avoid MySQL error 1093
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
-- Step 2: Update using a subquery workaround
-- =====================================================
-- This wraps the subquery in another SELECT to avoid error 1093
UPDATE users
SET username = 'superadmin@univen.ac.za',
    email = 'superadmin@univen.ac.za',
    active = TRUE
WHERE id = (
    SELECT temp.id FROM (
        SELECT id 
        FROM users 
        WHERE role = 'SUPER_ADMIN' 
        ORDER BY id 
        LIMIT 1
    ) AS temp
);

-- =====================================================
-- Step 3: Verify the update
-- =====================================================
SELECT 'After Update:' as info;
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE role = 'SUPER_ADMIN';

-- =====================================================
-- Step 4: Test user lookup by username
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
-- Step 5: Test user lookup by email
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
-- Step 6: Commit or Rollback
-- =====================================================
-- Review the results above, then:
-- If everything looks good, commit:
COMMIT;

-- If something went wrong, rollback:
-- ROLLBACK;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

