-- =====================================================
-- Add signature column to interns table
-- =====================================================
-- Run this directly in MySQL Workbench
-- =====================================================

-- Check if column already exists
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Column already exists'
        ELSE 'Column does not exist - will add it'
    END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'interns'
AND COLUMN_NAME = 'signature';

-- Add signature column (safe to run even if column exists - will show error but won't break)
ALTER TABLE interns 
ADD COLUMN signature LONGBLOB NULL;

-- Verify the column was added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'interns'
AND COLUMN_NAME = 'signature';

-- Show current table structure
DESCRIBE interns;

