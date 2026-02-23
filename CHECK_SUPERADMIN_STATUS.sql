-- =====================================================
-- Diagnostic Script: Check Superadmin Status
-- =====================================================
-- Run this first to see the current state
-- =====================================================

-- Check users table
SELECT '=== USERS TABLE ===' as section;
SELECT 
    id,
    username,
    email,
    role,
    active,
    createdAt,
    updatedAt
FROM users
WHERE role = 'SUPER_ADMIN'
   OR username LIKE '%superadmin%'
   OR email LIKE '%superadmin%'
ORDER BY id;

-- Check super_admins table
SELECT '=== SUPER_ADMINS TABLE ===' as section;
SELECT 
    super_admin_id,
    name,
    email,
    user_id,
    active,
    created_at
FROM super_admins;

-- Check if user can be found by username
SELECT '=== USER LOOKUP BY USERNAME ===' as section;
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE username = 'superadmin@univen.ac.za'
   OR username = 'superadmin';

-- Check if user can be found by email
SELECT '=== USER LOOKUP BY EMAIL ===' as section;
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE email = 'superadmin@univen.ac.za';

-- Check all users with ID 1
SELECT '=== USER WITH ID 1 ===' as section;
SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE id = 1;

-- Check relationship between users and super_admins
SELECT '=== USERS + SUPER_ADMINS JOIN ===' as section;
SELECT 
    u.id as user_id,
    u.username,
    u.email as user_email,
    u.role,
    u.active as user_active,
    sa.super_admin_id,
    sa.name as superadmin_name,
    sa.email as superadmin_email,
    sa.user_id as superadmin_user_id,
    sa.active as superadmin_active
FROM users u
LEFT JOIN super_admins sa ON u.id = sa.user_id
WHERE u.role = 'SUPER_ADMIN'
   OR sa.super_admin_id IS NOT NULL;

