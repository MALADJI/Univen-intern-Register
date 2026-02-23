-- ============================================
-- Database Setup Verification Script
-- ============================================

-- 1. Check if signature column exists
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'signature';

-- 2. Check if SUPER_ADMIN role exists in users table
SELECT DISTINCT role FROM users;

-- 3. Check if Super Admin user exists
SELECT id, username, email, role, name 
FROM users 
WHERE role = 'SUPER_ADMIN';

-- 4. Check if Super Admin profile exists
SELECT admin_id, name, email, created_at 
FROM admins 
WHERE email = 'superadmin@univen.ac.za';

-- 5. Verify signature column can store data (if column exists)
-- This will show NULL if no signatures stored yet
SELECT id, username, email, role, 
       CASE 
         WHEN signature IS NULL THEN 'No signature'
         WHEN signature = '' THEN 'Empty signature'
         ELSE CONCAT('Has signature (', LENGTH(signature), ' chars)')
       END AS signature_status
FROM users 
LIMIT 10;

-- ============================================
-- If signature column doesn't exist, run:
-- ============================================
-- ALTER TABLE users ADD COLUMN signature TEXT;

-- ============================================
-- If Super Admin doesn't exist, run:
-- ============================================
-- INSERT INTO users (username, email, password, role, name, created_at)
-- VALUES ('superadmin@univen.ac.za', 'superadmin@univen.ac.za', 
--         '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
--         'SUPER_ADMIN', 'Super Admin', NOW());
-- 
-- INSERT INTO admins (name, email, created_at)
-- VALUES ('Super Admin', 'superadmin@univen.ac.za', NOW());

