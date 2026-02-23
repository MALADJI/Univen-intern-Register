-- ============================================
-- Rollback Script: Remove ID Number, Start Date, and End Date from Interns Table
-- ============================================
-- This script removes the columns added by add_intern_fields_mysql.sql
-- Use this script if you need to undo the changes
--
-- WARNING: This will permanently delete all data in these columns!
-- Make sure to back up your data before running this script.
--
-- Date: 2025-01-27
-- ============================================

-- Step 1: Drop the check constraint first (if it exists)
ALTER TABLE interns 
DROP CONSTRAINT IF EXISTS chk_intern_dates;

-- Step 2: Drop indexes on id_number (if they exist)
-- Uncomment if you created an index on id_number
-- DROP INDEX IF EXISTS idx_intern_id_number ON interns;

-- Step 3: Drop unique constraint on id_number (if it exists)
-- Uncomment if you created a unique constraint on id_number
-- ALTER TABLE interns 
-- DROP CONSTRAINT IF EXISTS uk_intern_id_number;

-- Step 4: Drop the id_number column
ALTER TABLE interns 
DROP COLUMN IF EXISTS id_number;

-- Step 5: Drop the start_date column
ALTER TABLE interns 
DROP COLUMN IF EXISTS start_date;

-- Step 6: Drop the end_date column
ALTER TABLE interns 
DROP COLUMN IF EXISTS end_date;

-- ============================================
-- Verification Query
-- ============================================
-- Verify the columns have been removed
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'interns'
  AND COLUMN_NAME IN ('id_number', 'start_date', 'end_date');

-- If the query above returns no rows, the columns have been successfully removed.


