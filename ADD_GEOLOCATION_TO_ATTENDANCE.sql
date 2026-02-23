-- Add latitude and longitude columns to attendance table
ALTER TABLE attendance ADD COLUMN latitude DOUBLE DEFAULT NULL;
ALTER TABLE attendance ADD COLUMN longitude DOUBLE DEFAULT NULL;
