-- Simplified SQL Script to remove extra reason columns from leave_requests table
-- Run this in MySQL Workbench or your MySQL client

USE internregister;

-- Step 1: Migrate existing decline/rejection messages to reason column for rejected requests
UPDATE leave_requests 
SET reason = COALESCE(
    NULLIF(rejection_reason, ''), 
    NULLIF(rejection_message, ''), 
    NULLIF(decline_reason, ''), 
    reason
)
WHERE status = 'REJECTED' 
  AND (
    rejection_reason IS NOT NULL OR 
    rejection_message IS NOT NULL OR 
    decline_reason IS NOT NULL
  );

-- Step 2: Remove the extra columns
ALTER TABLE leave_requests DROP COLUMN IF EXISTS rejection_reason;
ALTER TABLE leave_requests DROP COLUMN IF EXISTS rejection_message;
ALTER TABLE leave_requests DROP COLUMN IF EXISTS decline_reason;

-- Step 3: Verify - should only show 'reason' column
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'internregister' 
  AND TABLE_NAME = 'leave_requests'
  AND (COLUMN_NAME LIKE '%reason%' OR COLUMN_NAME LIKE '%message%');

