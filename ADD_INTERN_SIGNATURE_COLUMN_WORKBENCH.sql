-- =====================================================
-- Add signature column to interns table
-- =====================================================
-- Copy and paste this entire script into MySQL Workbench
-- Then click the Execute button (⚡)
-- =====================================================

-- Step 1: Check if column already exists
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Column already exists - skipping'
        ELSE 'Column does not exist - will add it'
    END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'interns'
AND COLUMN_NAME = 'signature';

-- Step 2: Add signature column
-- If column already exists, you'll get an error "Duplicate column name 'signature'"
-- That's OK - just means the column is already there!
ALTER TABLE interns ADD COLUMN signature LONGBLOB NULL;

-- Step 3: Verify the column was added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'interns'
AND COLUMN_NAME = 'signature';

-- Step 4: Show full table structure
DESCRIBE interns;
