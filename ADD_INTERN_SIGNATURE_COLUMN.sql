-- =====================================================
-- Add signature column to interns table
-- =====================================================
-- This script adds a LONGBLOB column to store intern signatures
-- Signatures are stored as binary data (byte[]) converted from Base64 strings
-- =====================================================

-- Check if column already exists before adding
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'interns'
    AND COLUMN_NAME = 'signature'
);

-- Add signature column if it doesn't exist
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE interns ADD COLUMN signature LONGBLOB NULL',
    'SELECT "Column signature already exists in interns table" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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

