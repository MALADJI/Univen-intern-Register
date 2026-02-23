-- ============================================
-- Fix Super Admin Password Hash
-- ============================================

-- Step 1: Verify user exists
SELECT id, username, email, role, name,
       LEFT(password, 30) as password_hash_preview
FROM users 
WHERE email = 'superadmin@univen.ac.za' 
   OR username = 'superadmin@univen.ac.za';

-- Step 2: Update password hash
-- Password: superadmin123
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'superadmin@univen.ac.za' 
   OR username = 'superadmin@univen.ac.za';

-- Step 3: Verify update
SELECT id, username, email, role, name,
       LEFT(password, 30) as password_hash_preview
FROM users 
WHERE email = 'superadmin@univen.ac.za';

-- Expected result:
-- password_hash_preview should be: $2a$10$N9qo8uLOickgx2ZMRZoMye

-- ============================================
-- If the hash above doesn't work, generate a new one:
-- ============================================
-- 1. Go to: https://bcrypt-generator.com/
-- 2. Enter password: superadmin123
-- 3. Rounds: 10
-- 4. Copy the generated hash
-- 5. Replace the hash in the UPDATE statement above

