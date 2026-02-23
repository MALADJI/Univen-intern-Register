-- ============================================
-- Create Separate Super Admin Table
-- ============================================
-- This script creates a separate 'super_admins' table and migrates
-- existing SUPER_ADMIN users from the 'admins' table to the new table.
-- ============================================

-- Step 1: Check current SUPER_ADMIN users in users and admins tables
SELECT 
    'Current SUPER_ADMIN users in users table' AS info,
    u.id AS user_id,
    u.username,
    u.email,
    u.role,
    u.active
FROM users u
WHERE u.role = 'SUPER_ADMIN';

SELECT 
    'Current SUPER_ADMIN entries in admins table' AS info,
    a.admin_id,
    a.name,
    a.email,
    a.department_id,
    a.created_at
FROM admins a
INNER JOIN users u ON a.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
WHERE u.role = 'SUPER_ADMIN';

-- Step 2: Create the super_admins table
-- Note: Super admins don't have departments, so we don't include department_id
CREATE TABLE IF NOT EXISTS super_admins (
    super_admin_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT,
    signature TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Migrate existing SUPER_ADMIN entries from admins to super_admins
-- This will move all admins that correspond to SUPER_ADMIN users
INSERT INTO super_admins (name, email, user_id, signature, active, created_at, updated_at)
SELECT 
    a.name,
    a.email,
    u.id AS user_id,
    u.signature,
    COALESCE(a.active, TRUE) AS active,
    COALESCE(a.created_at, u.created_at) AS created_at,
    COALESCE(a.updated_at, NOW()) AS updated_at
FROM admins a
INNER JOIN users u ON a.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
WHERE u.role = 'SUPER_ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM super_admins sa WHERE sa.email COLLATE utf8mb4_unicode_ci = a.email COLLATE utf8mb4_unicode_ci
  );

-- Step 4: Create super_admins entries for SUPER_ADMIN users that don't have admin records
-- This handles cases where a SUPER_ADMIN user exists but no admin record
INSERT INTO super_admins (name, email, user_id, signature, active, created_at, updated_at)
SELECT 
    COALESCE(u.username, u.email) AS name,
    u.email,
    u.id AS user_id,
    u.signature,
    COALESCE(u.active, TRUE) AS active,
    COALESCE(u.created_at, NOW()) AS created_at,
    NOW() AS updated_at
FROM users u
WHERE u.role = 'SUPER_ADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM super_admins sa WHERE sa.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
  );

-- Step 5: Remove SUPER_ADMIN entries from admins table
-- This ensures super admins are only in the super_admins table
-- Using admin_id (PRIMARY KEY) to satisfy safe update mode

-- Option A: Using temporary table (recommended for safe update mode)
CREATE TEMPORARY TABLE IF NOT EXISTS temp_super_admin_ids AS
SELECT a.admin_id
FROM admins a
INNER JOIN users u ON a.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
WHERE u.role = 'SUPER_ADMIN';

DELETE FROM admins
WHERE admin_id IN (SELECT admin_id FROM temp_super_admin_ids);

DROP TEMPORARY TABLE IF EXISTS temp_super_admin_ids;

-- Alternative Option B (if Option A doesn't work, uncomment this and comment Option A):
-- SET SQL_SAFE_UPDATES = 0;
-- DELETE a FROM admins a
-- INNER JOIN users u ON a.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
-- WHERE u.role = 'SUPER_ADMIN';
-- SET SQL_SAFE_UPDATES = 1;

-- Step 6: Verify the migration
SELECT 
    'Super Admins in super_admins table' AS info,
    sa.super_admin_id,
    sa.name,
    sa.email,
    sa.user_id,
    u.username,
    u.role,
    sa.active,
    sa.created_at
FROM super_admins sa
LEFT JOIN users u ON sa.user_id = u.id
ORDER BY sa.super_admin_id;

-- Step 7: Verify no SUPER_ADMIN entries remain in admins table
SELECT 
    'Remaining entries in admins table (should be none for SUPER_ADMIN)' AS info,
    a.admin_id,
    a.name,
    a.email,
    u.role
FROM admins a
LEFT JOIN users u ON a.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
WHERE u.role = 'SUPER_ADMIN';

-- Step 8: Summary report
SELECT 
    'Migration Summary' AS info,
    (SELECT COUNT(*) FROM super_admins) AS total_super_admins,
    (SELECT COUNT(*) FROM admins a INNER JOIN users u ON a.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci WHERE u.role = 'SUPER_ADMIN') AS super_admins_in_admins_table,
    (SELECT COUNT(*) FROM users WHERE role = 'SUPER_ADMIN') AS total_super_admin_users;

-- ============================================
-- Notes:
-- ============================================
-- 1. The super_admins table has a foreign key to users.id
-- 2. Super admins don't have departments (unlike regular admins)
-- 3. The signature is stored in both users and super_admins tables
--    (users.signature for authentication, super_admins.signature for profile)
-- 4. All SUPER_ADMIN entries have been removed from the admins table
-- 5. The users table still contains SUPER_ADMIN users for authentication
-- ============================================

