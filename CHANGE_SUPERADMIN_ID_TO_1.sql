-- =====================================================
-- MySQL Script to Change Super Admin ID to 1
-- =====================================================
-- This script changes the superadmin's ID to 1 in the users table
-- It handles the case where ID 1 might already exist
-- =====================================================

-- Disable safe update mode and foreign key checks
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- Start transaction for safety
START TRANSACTION;

-- =====================================================
-- Step 1: Find the current superadmin ID
-- =====================================================
SELECT 
    id,
    username,
    email,
    role
FROM users
WHERE role = 'SUPER_ADMIN'
ORDER BY id
LIMIT 1;

-- =====================================================
-- Step 2: Check if ID 1 already exists
-- =====================================================
SELECT 
    id,
    username,
    email,
    role
FROM users
WHERE id = 1;

-- =====================================================
-- Step 3: If ID 1 exists and is NOT the superadmin, 
--         move it to a temporary high ID (999999)
-- =====================================================
-- First, check if ID 999999 exists (unlikely, but check anyway)
SELECT COUNT(*) as count FROM users WHERE id = 999999;

-- If ID 1 exists and is not the superadmin, move it temporarily
UPDATE users
SET id = 999999
WHERE id = 1 
  AND role != 'SUPER_ADMIN';

-- =====================================================
-- Step 4: Update superadmin ID to 1
-- =====================================================
-- Find the superadmin's current ID first
SET @superadmin_id = (
    SELECT id 
    FROM users 
    WHERE role = 'SUPER_ADMIN' 
    ORDER BY id 
    LIMIT 1
);

-- Update the superadmin's ID to 1
UPDATE users
SET id = 1
WHERE role = 'SUPER_ADMIN'
  AND id = @superadmin_id;

-- =====================================================
-- Step 5: Update super_admins table user_id foreign key
-- =====================================================
-- Update the super_admins table to point to the new user ID
UPDATE super_admins
SET user_id = 1
WHERE user_id = @superadmin_id;

-- =====================================================
-- Step 6: If we moved ID 1 to 999999, move it back to 
--         a different ID (e.g., the original superadmin ID)
-- =====================================================
-- Only if we actually moved something to 999999
UPDATE users
SET id = @superadmin_id
WHERE id = 999999
  AND @superadmin_id IS NOT NULL
  AND @superadmin_id != 1;

-- =====================================================
-- Step 7: Verify the changes
-- =====================================================
-- Verify users table
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE id = 1;

-- Verify super_admins table
SELECT 
    super_admin_id,
    name,
    email,
    user_id,
    active
FROM super_admins
WHERE user_id = 1;

-- =====================================================
-- Step 8: Commit or Rollback
-- =====================================================
-- If everything looks good, commit:
COMMIT;

-- If something went wrong, rollback:
-- ROLLBACK;

-- Re-enable safe update mode and foreign key checks
SET SQL_SAFE_UPDATES = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- Alternative: Simple approach if ID 1 doesn't exist
-- =====================================================
-- If you're sure ID 1 doesn't exist, you can use this simpler version:
-- =====================================================

/*
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

-- Get the current superadmin ID
SET @current_id = (
    SELECT id 
    FROM users 
    WHERE role = 'SUPER_ADMIN' 
    ORDER BY id 
    LIMIT 1
);

-- Update to ID 1
UPDATE users
SET id = 1
WHERE id = @current_id
  AND role = 'SUPER_ADMIN';

-- Verify
SELECT id, username, email, role FROM users WHERE id = 1;

COMMIT;

SET SQL_SAFE_UPDATES = 1;
SET FOREIGN_KEY_CHECKS = 1;
*/

