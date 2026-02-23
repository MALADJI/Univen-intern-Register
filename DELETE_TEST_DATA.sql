-- =====================================================
-- MySQL Script to Delete All Test Data
-- =====================================================
-- WARNING: This script will delete ALL data from the database!
-- Make sure you have a backup before running this script.
-- =====================================================

-- Disable safe update mode to allow DELETE without WHERE clause
SET SQL_SAFE_UPDATES = 0;

-- Disable foreign key checks temporarily to avoid constraint issues
SET FOREIGN_KEY_CHECKS = 0;

-- Start transaction for safety (can rollback if needed)
START TRANSACTION;

-- =====================================================
-- 1. Delete child records first (attendance, leave_requests)
-- =====================================================
DELETE FROM attendance;
DELETE FROM leave_requests;

-- =====================================================
-- 2. Delete interns (references supervisors, departments, locations)
-- =====================================================
DELETE FROM interns;

-- =====================================================
-- 3. Delete supervisors and admins (references departments)
-- =====================================================
DELETE FROM supervisors;
DELETE FROM admins;

-- =====================================================
-- 4. Delete verification codes (independent table)
-- =====================================================
DELETE FROM verification_codes;

-- =====================================================
-- 5. Delete locations (independent, but referenced by interns)
-- =====================================================
DELETE FROM locations;

-- =====================================================
-- 6. Delete fields (referenced by departments)
-- =====================================================
-- Note: If fields table exists and has foreign key to departments
DELETE FROM fields;

-- =====================================================
-- 7. Delete departments (may have fields)
-- =====================================================
DELETE FROM departments;

-- =====================================================
-- 8. Delete users (independent, but may be referenced by other tables)
-- =====================================================
DELETE FROM users;

-- =====================================================
-- Reset auto-increment counters (optional)
-- =====================================================
ALTER TABLE attendance AUTO_INCREMENT = 1;
ALTER TABLE leave_requests AUTO_INCREMENT = 1;
ALTER TABLE interns AUTO_INCREMENT = 1;
ALTER TABLE supervisors AUTO_INCREMENT = 1;
ALTER TABLE admins AUTO_INCREMENT = 1;
ALTER TABLE verification_codes AUTO_INCREMENT = 1;
ALTER TABLE locations AUTO_INCREMENT = 1;
ALTER TABLE fields AUTO_INCREMENT = 1;
ALTER TABLE departments AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Review the changes before committing
-- If everything looks good, uncomment the next line:
-- COMMIT;

-- If you want to rollback instead, uncomment:
-- ROLLBACK;

-- =====================================================
-- ALTERNATIVE: Delete only test data (preserve production data)
-- =====================================================
-- Uncomment the section below if you want to delete only test data
-- based on email patterns or other criteria
-- =====================================================

/*
-- Delete test data only (example: emails containing 'test' or 'example')
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- Delete attendance for test interns
DELETE a FROM attendance a
INNER JOIN interns i ON a.intern_id = i.internId
WHERE i.email LIKE '%test%' OR i.email LIKE '%example%';

-- Delete leave requests for test interns
DELETE lr FROM leave_requests lr
INNER JOIN interns i ON lr.intern_id = i.internId
WHERE i.email LIKE '%test%' OR i.email LIKE '%example%';

-- Delete test interns
DELETE FROM interns
WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Delete test supervisors
DELETE FROM supervisors
WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Delete test admins
DELETE FROM admins
WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Delete test users
DELETE FROM users
WHERE email LIKE '%test%' OR email LIKE '%example%' 
   OR username LIKE '%test%' OR username LIKE '%example%';

-- Delete verification codes for test emails
DELETE FROM verification_codes
WHERE email LIKE '%test%' OR email LIKE '%example%';

-- Delete test locations (optional - be careful with this)
-- DELETE FROM locations WHERE name LIKE '%test%' OR name LIKE '%example%';

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
-- COMMIT; or ROLLBACK;
*/

