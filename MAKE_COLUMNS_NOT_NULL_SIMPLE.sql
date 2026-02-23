-- Simple script to make employer, id_number, start_date, and end_date NOT NULL
-- WARNING: This will update NULL values to defaults first!

USE internregister;

-- Update NULL values to defaults
UPDATE interns SET employer = 'N/A' WHERE employer IS NULL;
UPDATE interns SET id_number = '' WHERE id_number IS NULL;
UPDATE interns SET start_date = CURDATE() WHERE start_date IS NULL;
UPDATE interns SET end_date = DATE_ADD(CURDATE(), INTERVAL 6 MONTH) WHERE end_date IS NULL;

-- Make columns NOT NULL
ALTER TABLE interns MODIFY COLUMN employer VARCHAR(255) NOT NULL;
ALTER TABLE interns MODIFY COLUMN id_number VARCHAR(13) NOT NULL;
ALTER TABLE interns MODIFY COLUMN start_date DATE NOT NULL;
ALTER TABLE interns MODIFY COLUMN end_date DATE NOT NULL;


