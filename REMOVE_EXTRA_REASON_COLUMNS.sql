-- SQL Script to remove extra reason columns from leave_requests table
-- This script removes rejection_reason, rejection_message, and decline_reason columns
-- and keeps only the 'reason' column

-- Step 1: Check current table structure
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'internregister' 
  AND TABLE_NAME = 'leave_requests'
  AND COLUMN_NAME IN ('reason', 'rejection_reason', 'rejection_message', 'decline_reason');

-- Step 2: Migrate any existing decline/rejection messages to reason column for rejected requests
-- This preserves any existing decline messages before removing the columns
UPDATE internregister.leave_requests 
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

-- Step 3: Remove the extra columns
-- Note: MySQL doesn't support dropping multiple columns in one statement, so we do them separately

-- Drop rejection_reason column (if it exists)
ALTER TABLE internregister.leave_requests 
DROP COLUMN IF EXISTS rejection_reason;

-- Drop rejection_message column (if it exists)
ALTER TABLE internregister.leave_requests 
DROP COLUMN IF EXISTS rejection_message;

-- Drop decline_reason column (if it exists)
ALTER TABLE internregister.leave_requests 
DROP COLUMN IF EXISTS decline_reason;

-- Step 4: Verify the changes
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'internregister' 
  AND TABLE_NAME = 'leave_requests'
  AND COLUMN_NAME LIKE '%reason%' OR COLUMN_NAME LIKE '%message%';

-- Expected result: Only 'reason' column should remain

