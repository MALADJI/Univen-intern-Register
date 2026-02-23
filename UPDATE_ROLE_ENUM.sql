-- ============================================
-- Update Role ENUM to Include SUPER_ADMIN
-- ============================================

-- Step 1: Check current role enum values
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';

-- Step 2: Update the role enum to include SUPER_ADMIN
-- This will modify the ENUM column to include all roles
ALTER TABLE users 
MODIFY COLUMN role ENUM('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'INTERN') NOT NULL;

-- Step 3: Verify the update
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';

-- Step 4: Now you can create the Super Admin user
INSERT INTO users (username, email, password, role, name, created_at)
VALUES ('superadmin@univen.ac.za', 'superadmin@univen.ac.za', 
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
        'SUPER_ADMIN', 'Super Admin', NOW());

-- Step 5: Create Admin profile
INSERT INTO admins (name, email, created_at)
VALUES ('Super Admin', 'superadmin@univen.ac.za', NOW());

-- Step 6: Verify Super Admin was created
SELECT id, username, email, role, name, created_at 
FROM users 
WHERE role = 'SUPER_ADMIN';

SELECT admin_id, name, email, created_at 
FROM admins 
WHERE email = 'superadmin@univen.ac.za';

