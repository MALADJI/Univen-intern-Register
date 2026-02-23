-- Fix attendance signature column to support large base64 strings
-- This ensures the signature column can store large base64-encoded signature data

-- Check current column type
-- DESCRIBE attendance;

-- Alter the signature column to LONGTEXT if it's not already
ALTER TABLE attendance 
MODIFY COLUMN signature LONGTEXT NULL;

-- Verify the change
-- DESCRIBE attendance;

-- Note: LONGTEXT can store up to 4GB of text data, which is more than enough for base64-encoded signatures

