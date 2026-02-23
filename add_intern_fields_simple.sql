-- =====================================================
-- Add ID Number, Start Date, and End Date to Interns Table
-- =====================================================
-- Run this directly in MySQL Workbench
-- =====================================================

-- Select the database (replace 'internregister' with your actual database name if different)
USE internregister;

-- Check if columns already exist
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'Some columns already exist'
        ELSE 'Columns do not exist - will add them'
    END AS status
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'interns'
  AND COLUMN_NAME IN ('id_number', 'start_date', 'end_date');

-- Add ID Number column (South African ID numbers are 13 digits)
ALTER TABLE interns 
ADD COLUMN id_number VARCHAR(13) NULL 
COMMENT 'South African ID number (13 digits)';

-- Add Start Date column
ALTER TABLE interns 
ADD COLUMN start_date DATE NULL 
COMMENT 'Internship start date';

-- Add End Date column
ALTER TABLE interns 
ADD COLUMN end_date DATE NULL 
COMMENT 'Internship end date';

-- Add check constraint to ensure end_date >= start_date
-- Note: Requires MySQL 8.0.16+ or MariaDB 10.2.1+
ALTER TABLE interns 
ADD CONSTRAINT chk_intern_dates 
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);

-- Verify the columns were added
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'interns'
  AND COLUMN_NAME IN ('id_number', 'start_date', 'end_date')
ORDER BY COLUMN_NAME;

-- Show current table structure
DESCRIBE interns;

