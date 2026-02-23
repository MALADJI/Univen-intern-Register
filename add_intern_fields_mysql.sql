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

-- Step 1: Add ID Number column (South African ID numbers are 13 digits)
-- The column is nullable to allow existing records without ID number information
ALTER TABLE interns 
ADD COLUMN id_number VARCHAR(13) NULL 
COMMENT 'South African ID number (13 digits)';

-- Step 2: Add Start Date column
-- The column is nullable to allow existing records without start date information
ALTER TABLE interns 
ADD COLUMN start_date DATE NULL 
COMMENT 'Internship start date';

-- Step 3: Add End Date column
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

-- Step 5: Add check constraint to ensure end_date >= start_date
-- Note: This requires MySQL 8.0.16+ or MariaDB 10.2.1+
-- For older versions, remove this constraint and handle validation in the application
ALTER TABLE interns 
ADD CONSTRAINT chk_intern_dates 
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);

-- Step 6: (Optional) Add index on id_number for faster lookups
-- Uncomment the line below if you want to add an index
-- CREATE INDEX idx_intern_id_number ON interns(id_number);

-- Step 7: (Optional) Add unique constraint on id_number
-- Uncomment the lines below if ID numbers must be unique
-- ALTER TABLE interns 
-- ADD CONSTRAINT uk_intern_id_number UNIQUE (id_number);

-- ============================================
-- Verification Query
-- ============================================
-- Run this query to see sample data with the new columns:
-- SELECT 
--     intern_id, 
--     name, 
--     email, 
--     id_number, 
--     start_date, 
--     end_date,
--     employer, 
--     field 
-- FROM interns 
-- LIMIT 10;

-- ============================================
-- Rollback Script (if needed)
-- ============================================
-- If you need to remove these columns, use the rollback script:
-- rollback_intern_fields.sql
-- 
-- Or manually run:
-- ALTER TABLE interns DROP CONSTRAINT chk_intern_dates;
-- ALTER TABLE interns DROP COLUMN id_number;
-- ALTER TABLE interns DROP COLUMN start_date;
-- ALTER TABLE interns DROP COLUMN end_date;

