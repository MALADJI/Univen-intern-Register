-- Remove the 'seen' column from leave_requests table
-- Run this SQL in your MySQL database

ALTER TABLE leave_requests DROP COLUMN IF EXISTS seen;

-- If your MySQL version doesn't support IF EXISTS, use:
-- ALTER TABLE leave_requests DROP COLUMN seen;

