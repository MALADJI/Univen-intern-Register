-- =====================================================
-- MySQL Script to Change Super Admin ID to 1 (Simple Version)
-- =====================================================
-- This script changes the superadmin's ID to 1 in both:
-- 1. users table (id column)
-- 2. super_admins table (user_id foreign key)
-- =====================================================

-- Disable safe update mode and foreign key checks
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- Start transaction for safety
START TRANSACTION;

-- =====================================================
-- Step 1: Check current state
-- =====================================================
SELECT 'Current Superadmin in users table:' as info;
SELECT id, username, email, role FROM users WHERE role = 'SUPER_ADMIN';

SELECT 'Current Superadmin in super_admins table:' as info;
SELECT super_admin_id, name, email, user_id FROM super_admins;

SELECT 'Check if ID 1 exists in users:' as info;
SELECT id, username, email, role FROM users WHERE id = 1;

-- =====================================================
-- Step 2: Get the current superadmin user ID
-- =====================================================
SET @current_user_id = (
    SELECT id 
    FROM users 
    WHERE role = 'SUPER_ADMIN' 
    ORDER BY id 
    LIMIT 1
);

SELECT CONCAT('Current superadmin user ID: ', @current_user_id) as info;

-- =====================================================
-- Step 3: If ID 1 exists and is NOT the superadmin, 
--         temporarily move it to 999999
-- =====================================================
UPDATE users
SET id = 999999
WHERE id = 1 
  AND id != @current_user_id
  AND role != 'SUPER_ADMIN';

-- =====================================================
-- Step 4: Update superadmin user ID to 1
-- =====================================================
UPDATE users
SET id = 1
WHERE id = @current_user_id
  AND role = 'SUPER_ADMIN';

-- =====================================================
-- Step 5: Update super_admins table to point to new user ID
-- =====================================================
UPDATE super_admins
SET user_id = 1
WHERE user_id = @current_user_id;

-- =====================================================
-- Step 6: Move the temporarily moved user back to original superadmin ID
-- =====================================================
UPDATE users
SET id = @current_user_id
WHERE id = 999999
  AND @current_user_id IS NOT NULL
  AND @current_user_id != 1;

-- =====================================================
-- Step 7: Verify the changes
-- =====================================================
SELECT 'After update - users table:' as info;
SELECT id, username, email, role, active FROM users WHERE id = 1;

SELECT 'After update - super_admins table:' as info;
SELECT super_admin_id, name, email, user_id, active FROM super_admins WHERE user_id = 1;

-- =====================================================
-- Step 8: Commit or Rollback
-- =====================================================
-- Review the results above, then:
-- If everything looks good, commit:
COMMIT;

-- If something went wrong, rollback:
-- ROLLBACK;

-- Re-enable safe update mode and foreign key checks
SET SQL_SAFE_UPDATES = 1;
SET FOREIGN_KEY_CHECKS = 1;

