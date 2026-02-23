-- Fix: Set active = TRUE for all intern users where active is NULL
-- This approach uses the primary key (id) to satisfy safe update mode

-- Step 1: First, see which interns need to be updated
SELECT id, username, email, role, active FROM users WHERE role = 'INTERN' AND (active IS NULL OR active = FALSE);

-- Step 2: Update using a subquery with the primary key (id)
-- This works with safe update mode because it uses the primary key
UPDATE users 
SET active = TRUE 
WHERE id IN (
    SELECT id FROM (
        SELECT id FROM users 
        WHERE role = 'INTERN' AND email IS NOT NULL AND (active IS NULL OR active = FALSE)
    ) AS temp
);

-- Alternative: Update one by one by email (if you know the emails)
-- UPDATE users SET active = TRUE WHERE email = 'intern@univen.ac.za' AND role = 'INTERN';
-- UPDATE users SET active = TRUE WHERE email = 'intern2@univen.ac.za' AND role = 'INTERN';

-- Alternative: Update by specific IDs (after running Step 1, use the IDs you see)
-- UPDATE users SET active = TRUE WHERE id IN (1, 2, 3, 4, 5); -- Replace with actual IDs

