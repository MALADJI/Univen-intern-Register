-- =====================================================
-- MySQL Script to Create Super Admin User
-- =====================================================
-- This script creates a SUPER_ADMIN user in the users table
-- =====================================================

-- =====================================================
-- First, check what columns exist in the users table
-- =====================================================
-- Run this to see the actual column names:
-- DESCRIBE users;
-- or
-- SHOW COLUMNS FROM users;

-- =====================================================
-- Option 1: Create Super Admin (without timestamp columns)
-- =====================================================
-- Default password: "admin123"
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- Note: createdAt and updatedAt are auto-managed by JPA, so we omit them
-- =====================================================

INSERT INTO users (
    username,
    email,
    password,
    role,
    active
) VALUES (
    'superadmin',
    'superadmin@univen.ac.za',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Password: admin123
    'SUPER_ADMIN',
    TRUE
);

-- =====================================================
-- Option 2: Create Super Admin with custom credentials
-- =====================================================
-- Uncomment and modify the section below to use custom username/email
-- =====================================================

/*
INSERT INTO users (
    username,
    email,
    password,
    role,
    active
) VALUES (
    'your_username_here',           -- Change this
    'your_email@univen.ac.za',      -- Change this
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Change this (see instructions below)
    'SUPER_ADMIN',
    TRUE
);
*/

-- =====================================================
-- Option 3: If your table uses snake_case column names
-- =====================================================
-- Uncomment if columns are named created_at, updated_at, etc.
-- =====================================================

/*
INSERT INTO users (
    username,
    email,
    password,
    role,
    active,
    created_at,
    updated_at
) VALUES (
    'superadmin',
    'superadmin@univen.ac.za',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'SUPER_ADMIN',
    TRUE,
    NOW(),
    NOW()
);
*/

-- =====================================================
-- How to Generate a BCrypt Hash for Your Password
-- =====================================================
-- 
-- Method 1: Using Spring Boot (Recommended)
-- -----------------------------------------
-- 1. Create a simple Java class or use Spring Boot shell:
-- 
--    import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
--    
--    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
--    String hash = encoder.encode("your_password_here");
--    System.out.println(hash);
-- 
-- Method 2: Using Online BCrypt Generator
-- -----------------------------------------
-- Visit: https://bcrypt-generator.com/
-- Enter your password and copy the generated hash
-- 
-- Method 3: Using Command Line (if bcrypt is installed)
-- -----------------------------------------
-- bcrypt-cli hash "your_password_here"
-- 
-- =====================================================
-- Verify the Super Admin was created
-- =====================================================

SELECT 
    id,
    username,
    email,
    role,
    active
FROM users
WHERE role = 'SUPER_ADMIN'
ORDER BY id DESC;

-- =====================================================
-- Update Super Admin Password (if needed)
-- =====================================================
-- Uncomment and modify to update the password:
-- =====================================================

/*
UPDATE users
SET password = '$2a$10$YOUR_NEW_BCRYPT_HASH_HERE'
WHERE username = 'superadmin' 
   OR email = 'superadmin@univen.ac.za';
*/

-- =====================================================
-- Delete Super Admin (if needed)
-- =====================================================
-- Uncomment to delete the super admin:
-- =====================================================

/*
DELETE FROM users
WHERE role = 'SUPER_ADMIN'
  AND (username = 'superadmin' OR email = 'superadmin@univen.ac.za');
*/

