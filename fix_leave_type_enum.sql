-- Fix Leave Type Enum Mismatch
-- This script checks for invalid leave_type values and updates them

-- Check current leave types in database
SELECT DISTINCT leave_type, COUNT(*) as count
FROM leave_requests
GROUP BY leave_type;

-- Note: CASUAL and OTHER are now valid enum values in LeaveType.java
-- If you see any other invalid values, update them to one of the valid ones below

-- Valid LeaveType enum values are:
-- ANNUAL, SICK, PERSONAL, EMERGENCY, CASUAL, OTHER
-- 
-- If you have any other invalid values, you can update them like this:
-- UPDATE leave_requests SET leave_type = 'PERSONAL' WHERE leave_type = 'INVALID_VALUE';

-- Verify all leave types are valid
SELECT DISTINCT leave_type, COUNT(*) as count
FROM leave_requests
GROUP BY leave_type;
