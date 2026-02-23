-- ============================================
-- Add Employer Column to Interns Table
-- ============================================
-- This script adds an 'employer' column to the 'interns' table
-- to store the employer/company name for each intern.
--
-- Date: 2025-11-27
-- ============================================

-- Step 1: Add employer column to interns table
-- The column is nullable to allow existing records without employer information
ALTER TABLE interns 
ADD COLUMN employer VARCHAR(255) NULL 
COMMENT 'Employer/Company name for the intern';

-- Step 2: Verify the column was added successfully
-- This query should show the new employer column
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'interns'
  AND COLUMN_NAME = 'employer';

-- Step 3: (Optional) Update existing records with a default value if needed
-- Uncomment the line below if you want to set a default value for existing records
-- UPDATE interns SET employer = 'N/A' WHERE employer IS NULL;

-- ============================================
-- Verification Query
-- ============================================
-- Run this query to verify the column exists and see sample data:
-- SELECT intern_id, name, email, employer, field, department_id 
-- FROM interns 
-- LIMIT 10;

-- ============================================
-- Rollback Script (if needed)
-- ============================================
-- If you need to remove the column, run:
-- ALTER TABLE interns DROP COLUMN employer;

