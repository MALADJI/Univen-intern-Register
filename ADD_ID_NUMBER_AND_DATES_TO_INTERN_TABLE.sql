-- ============================================
-- Add ID Number, Start Date, and End Date to Interns Table
-- ============================================
-- This script adds three new columns to the 'interns' table:
--   - id_number: South African ID number (13 digits)
--   - start_date: Internship start date
--   - end_date: Internship end date
--
-- Date: 2025-01-27
-- ============================================

-- Select the database (replace 'internregister' with your actual database name if different)
USE internregister;

-- Step 1: Add ID Number column to interns table
-- The column is nullable to allow existing records without ID number information
ALTER TABLE interns 
ADD COLUMN id_number VARCHAR(13) NULL 
COMMENT 'South African ID number (13 digits)';

-- Step 2: Add Start Date column to interns table
-- The column is nullable to allow existing records without start date information
ALTER TABLE interns 
ADD COLUMN start_date DATE NULL 
COMMENT 'Internship start date';

-- Step 3: Add End Date column to interns table
-- The column is nullable to allow existing records without end date information
ALTER TABLE interns 
ADD COLUMN end_date DATE NULL 
COMMENT 'Internship end date';

-- Step 4: Verify the columns were added successfully
-- This query should show the three new columns
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'interns'
  AND COLUMN_NAME IN ('id_number', 'start_date', 'end_date')
ORDER BY COLUMN_NAME;

-- Step 5: (Optional) Update existing records with default values if needed
-- Uncomment the lines below if you want to set default values for existing records
-- UPDATE interns SET start_date = CURDATE() WHERE start_date IS NULL;
-- UPDATE interns SET end_date = DATE_ADD(CURDATE(), INTERVAL 6 MONTH) WHERE end_date IS NULL;

-- ============================================
-- Verification Query
-- ============================================
-- Run this query to verify the columns exist and see sample data:
-- SELECT intern_id, name, email, id_number, start_date, end_date, employer, field, department_id 
-- FROM interns 
-- LIMIT 10;

-- ============================================
-- Rollback Script (if needed)
-- ============================================
-- If you need to remove the columns, run:
-- ALTER TABLE interns DROP COLUMN id_number;
-- ALTER TABLE interns DROP COLUMN start_date;
-- ALTER TABLE interns DROP COLUMN end_date;

