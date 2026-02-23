-- Migration: Add seen field to leave_requests table
-- This migration adds the ability to track if a supervisor has seen a leave request

-- Step 1: Add seen column to leave_requests table (default to false for existing records)
ALTER TABLE leave_requests 
ADD COLUMN seen BOOLEAN DEFAULT FALSE NOT NULL;

-- Step 2: Update existing records to be unseen (optional, but good practice)
UPDATE leave_requests SET seen = FALSE WHERE seen IS NULL;

-- Step 3: Verify the column was added (optional - for verification)
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'leave_requests' AND COLUMN_NAME = 'seen';

-- Note: 
-- - New leave requests will default to seen = FALSE
-- - Use PUT /api/leave/{id}/seen to mark a request as seen
-- - Use PUT /api/leave/reset-seen to reset all requests to unseen
-- - Use PUT /api/leave/mark-all-seen to mark all requests as seen

