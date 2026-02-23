-- =====================================================
-- MySQL Script to Get Verification Codes from Database
-- =====================================================
-- Use this script when email is not working to retrieve
-- verification codes directly from the database
-- =====================================================

-- =====================================================
-- First, check what columns exist in the table
-- =====================================================
-- Run this to see the actual column names:
-- DESCRIBE verification_codes;
-- or
-- SHOW COLUMNS FROM verification_codes;

-- =====================================================
-- Option 1: Get the latest verification code for a specific email
-- =====================================================
-- Replace 'your_email@example.com' with the actual email address
-- Try camelCase first, if it fails, use snake_case version below
-- =====================================================

-- Version A: Using camelCase (if your table uses camelCase)
/*
SELECT 
    id,
    email,
    code,
    createdAt,
    expiresAt,
    CASE 
        WHEN expiresAt > NOW() THEN 'VALID'
        ELSE 'EXPIRED'
    END AS status,
    TIMESTAMPDIFF(MINUTE, NOW(), expiresAt) AS minutes_until_expiry
FROM verification_codes
WHERE email = 'your_email@example.com'
ORDER BY createdAt DESC
LIMIT 1;
*/

-- Version B: Using snake_case (most common in MySQL)
SELECT 
    id,
    email,
    code,
    created_at,
    expires_at,
    CASE 
        WHEN expires_at > NOW() THEN 'VALID'
        ELSE 'EXPIRED'
    END AS status,
    TIMESTAMPDIFF(MINUTE, NOW(), expires_at) AS minutes_until_expiry
FROM verification_codes
WHERE email = 'superadmin@univen.ac.za'
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- Option 2: Get all recent verification codes (last 30 minutes)
-- =====================================================
-- Useful to see all recent codes generated
-- =====================================================

SELECT 
    id,
    email,
    code,
    created_at,
    expires_at,
    CASE 
        WHEN expires_at > NOW() THEN 'VALID'
        ELSE 'EXPIRED'
    END AS status,
    TIMESTAMPDIFF(MINUTE, NOW(), expires_at) AS minutes_until_expiry
FROM verification_codes
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
ORDER BY created_at DESC;

-- =====================================================
-- Option 3: Get all valid (non-expired) verification codes
-- =====================================================
-- Shows only codes that haven't expired yet
-- =====================================================

SELECT 
    id,
    email,
    code,
    created_at,
    expires_at,
    TIMESTAMPDIFF(MINUTE, NOW(), expires_at) AS minutes_until_expiry
FROM verification_codes
WHERE expires_at > NOW()
ORDER BY created_at DESC;

-- =====================================================
-- Option 4: Get verification code by email (simplified) - QUICK LOOKUP
-- =====================================================
-- Just shows the code and email - quick lookup
-- Replace 'superadmin@univen.ac.za' with your email
-- =====================================================

SELECT 
    email,
    code,
    CASE 
        WHEN expires_at > NOW() THEN 'VALID'
        ELSE 'EXPIRED'
    END AS status
FROM verification_codes
WHERE email = 'superadmin@univen.ac.za'
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- Option 5: Clean up expired verification codes
-- =====================================================
-- Run this to delete old expired codes (optional cleanup)
-- =====================================================

-- First, see how many expired codes exist:
SELECT COUNT(*) AS expired_codes_count
FROM verification_codes
WHERE expires_at < NOW();

-- Then delete them (uncomment to execute):
/*
DELETE FROM verification_codes
WHERE expires_at < NOW();
*/

-- =====================================================
-- Option 6: Manually create a verification code (for testing)
-- =====================================================
-- Use this if you need to manually create a code for testing
-- =====================================================

/*
-- First, delete any existing code for this email
DELETE FROM verification_codes WHERE email = 'your_email@example.com';

-- Then insert a new code (valid for 10 minutes)
-- Note: If your table uses camelCase, use expiresAt and createdAt instead
INSERT INTO verification_codes (
    email,
    code,
    expires_at,
    created_at
) VALUES (
    'your_email@example.com',
    '123456',  -- Your 6-digit code
    DATE_ADD(NOW(), INTERVAL 10 MINUTE),
    NOW()
);
*/

-- =====================================================
-- Quick Reference - 3 Ways to Get Verification Code:
-- =====================================================
-- 
-- METHOD 1: Check Spring Boot Console (Easiest)
-- ----------------------------------------------
-- When you request a password reset, the code is printed to the console:
-- Look for lines like:
--   ===========================================
--   PASSWORD RESET CODE FOR: your_email@univen.ac.za
--   CODE: 123456
--   ===========================================
-- 
-- METHOD 2: Query Database (Use this SQL script)
-- ----------------------------------------------
-- 1. Request password reset from the application
-- 2. Run Option 1 or 4 above with your email to get the code
-- 3. Use the code from the database to reset your password
-- 
-- METHOD 3: Check API Response (Development only)
-- ------------------------------------------------
-- The forgot-password endpoint returns the code in the response
-- for testing purposes (check the network tab in browser dev tools)
-- 
-- IMPORTANT NOTES:
-- - Codes expire after 10 minutes
-- - Only one code per email (new code replaces old one)
-- - Codes are stored in the verification_codes table
-- =====================================================

