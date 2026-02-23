-- ============================================
-- Make Employer, ID Number, Start Date, and End Date NOT NULL
-- ============================================
-- This script makes the following columns required (NOT NULL):
--   - employer: Employer/Company name
--   - id_number: South African ID number (13 digits)
--   - start_date: Internship start date
--   - end_date: Internship end date
--
-- WARNING: This script will first update any NULL values to default values,
-- then make the columns NOT NULL. Make sure you want to do this!
--
-- Date: 2025-01-27
-- ============================================

-- Select the database
USE internregister;

-- Step 1: Check for NULL values before making changes
-- This will show you how many records have NULL values
SELECT 
    'employer' AS column_name,
    COUNT(*) AS null_count
FROM interns 
WHERE employer IS NULL
UNION ALL
SELECT 
    'id_number' AS column_name,
    COUNT(*) AS null_count
FROM interns 
WHERE id_number IS NULL
UNION ALL
SELECT 
    'start_date' AS column_name,
    COUNT(*) AS null_count
FROM interns 
WHERE start_date IS NULL
UNION ALL
SELECT 
    'end_date' AS column_name,
    COUNT(*) AS null_count
FROM interns 
WHERE end_date IS NULL;

-- Step 2: Update NULL values with default values
-- Update employer: Set to 'N/A' if NULL
UPDATE interns 
SET employer = 'N/A' 
WHERE employer IS NULL;

-- Update id_number: Set to empty string (you may want to use a different default)
-- WARNING: Empty string for ID number may not be ideal - consider using actual ID numbers
UPDATE interns 
SET id_number = '' 
WHERE id_number IS NULL;

-- Update start_date: Set to current date if NULL
UPDATE interns 
SET start_date = CURDATE() 
WHERE start_date IS NULL;

-- Update end_date: Set to 6 months from current date if NULL
UPDATE interns 
SET end_date = DATE_ADD(CURDATE(), INTERVAL 6 MONTH) 
WHERE end_date IS NULL;

-- Step 3: Verify all NULL values have been updated
-- This should return 0 rows if all NULLs were updated
SELECT 
    'employer' AS column_name,
    COUNT(*) AS remaining_nulls
FROM interns 
WHERE employer IS NULL
UNION ALL
SELECT 
    'id_number' AS column_name,
    COUNT(*) AS remaining_nulls
FROM interns 
WHERE id_number IS NULL
UNION ALL
SELECT 
    'start_date' AS column_name,
    COUNT(*) AS remaining_nulls
FROM interns 
WHERE start_date IS NULL
UNION ALL
SELECT 
    'end_date' AS column_name,
    COUNT(*) AS remaining_nulls
FROM interns 
WHERE end_date IS NULL;

-- Step 4: Make employer column NOT NULL
ALTER TABLE interns 
MODIFY COLUMN employer VARCHAR(255) NOT NULL 
COMMENT 'Employer/Company name for the intern';

-- Step 5: Make id_number column NOT NULL
ALTER TABLE interns 
MODIFY COLUMN id_number VARCHAR(13) NOT NULL 
COMMENT 'South African ID number (13 digits)';

-- Step 6: Make start_date column NOT NULL
ALTER TABLE interns 
MODIFY COLUMN start_date DATE NOT NULL 
COMMENT 'Internship start date';

-- Step 7: Make end_date column NOT NULL
ALTER TABLE interns 
MODIFY COLUMN end_date DATE NOT NULL 
COMMENT 'Internship end date';

-- Step 8: Verify the columns are now NOT NULL
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'interns'
  AND COLUMN_NAME IN ('employer', 'id_number', 'start_date', 'end_date')
ORDER BY COLUMN_NAME;

-- ============================================
-- Verification Query
-- ============================================
-- Run this query to see sample data:
-- SELECT intern_id, name, email, employer, id_number, start_date, end_date, field 
-- FROM interns 
-- LIMIT 10;

-- ============================================
-- Rollback Script (if needed)
-- ============================================
-- If you need to make the columns nullable again, run:
-- ALTER TABLE interns MODIFY COLUMN employer VARCHAR(255) NULL;
-- ALTER TABLE interns MODIFY COLUMN id_number VARCHAR(13) NULL;
-- ALTER TABLE interns MODIFY COLUMN start_date DATE NULL;
-- ALTER TABLE interns MODIFY COLUMN end_date DATE NULL;


