-- Migration: Add location_id column to interns table
-- This migration adds the ability to assign a location to an intern

-- Step 1: Add location_id column to interns table (nullable to support existing records)
ALTER TABLE interns 
ADD COLUMN location_id BIGINT NULL;

-- Step 2: Add foreign key constraint to locations table
ALTER TABLE interns 
ADD CONSTRAINT fk_intern_location 
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
    ON DELETE SET NULL;

-- Step 3: Verify the column was added (optional - for verification)
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'interns' AND COLUMN_NAME = 'location_id';

-- Note: Existing interns will have location_id = NULL
-- You can assign locations to interns using the API endpoint:
-- PUT /api/interns/{internId}/location
-- Body: { "locationId": <location_id> }

