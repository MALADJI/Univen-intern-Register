-- ============================================
-- Fix All Admins Active Status
-- ============================================
-- This script ensures all admins have active = TRUE
-- ============================================

-- Step 1: Check if active column exists
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'admins' 
  AND COLUMN_NAME = 'active';

-- Step 2: Add active column if it doesn't exist
-- (This will only add if it doesn't exist - safe to run multiple times)
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'admins' 
      AND COLUMN_NAME = 'active'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE admins ADD COLUMN active BOOLEAN DEFAULT TRUE',
    'SELECT "Column active already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Check current status of all admins
SELECT 
    admin_id,
    name,
    email,
    active,
    CASE 
        WHEN active IS NULL THEN 'NULL ✗'
        WHEN active = 1 THEN 'ACTIVE ✓'
        WHEN active = 0 THEN 'DEACTIVATED ✗'
        ELSE 'UNKNOWN'
    END as status
FROM admins
ORDER BY admin_id;

-- Step 4: Activate ALL admins (satisfies safe update mode - uses PRIMARY KEY)
UPDATE admins 
SET active = TRUE 
WHERE admin_id > 0;

-- Step 5: Set any remaining NULL values to TRUE (if any)
UPDATE admins 
SET active = TRUE 
WHERE active IS NULL 
  AND admin_id > 0;

-- Step 6: Verify the fix - all admins should now be active
SELECT 
    admin_id,
    name,
    email,
    active,
    CASE 
        WHEN active IS NULL THEN 'NULL ✗'
        WHEN active = 1 THEN 'ACTIVE ✓'
        WHEN active = 0 THEN 'DEACTIVATED ✗'
        ELSE 'UNKNOWN'
    END as status,
    'All admins should show ACTIVE ✓' AS verification
FROM admins
ORDER BY admin_id;

-- Step 7: Summary
SELECT 
    COUNT(*) AS total_admins,
    SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active_count,
    SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS deactivated_count,
    SUM(CASE WHEN active IS NULL THEN 1 ELSE 0 END) AS null_count
FROM admins;

-- ============================================
-- Notes:
-- ============================================
-- 1. This script adds the 'active' column if it doesn't exist
-- 2. Sets all admins to active = TRUE
-- 3. Handles NULL values by setting them to TRUE
-- 4. Uses admin_id > 0 to satisfy MySQL safe update mode
-- 5. All admins should now be able to log in
-- ============================================

