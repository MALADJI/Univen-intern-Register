-- Simple script to add ID number, start date, and end date columns to interns table
-- Select the database (replace 'internregister' with your actual database name if different)
USE internregister;

ALTER TABLE interns 
ADD COLUMN id_number VARCHAR(13) NULL;

ALTER TABLE interns 
ADD COLUMN start_date DATE NULL;

ALTER TABLE interns 
ADD COLUMN end_date DATE NULL;

