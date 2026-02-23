-- Fix: Set active = TRUE for all intern users where active is NULL
-- Option 1: Update by email (email is unique, so it's safe)
UPDATE users SET active = TRUE WHERE role = 'INTERN' AND email IS NOT NULL AND (active IS NULL OR active = FALSE);

-- Option 2: Update all interns using email
UPDATE users SET active = TRUE WHERE role = 'INTERN' AND email IS NOT NULL;

-- Option 3: First check which interns have NULL active
SELECT id, username, email, role, active FROM users WHERE role = 'INTERN' AND (active IS NULL OR active = FALSE);

-- Option 4: Update by specific email (if you know the email)
UPDATE users SET active = TRUE WHERE email = 'intern@univen.ac.za' AND role = 'INTERN';

-- Option 5: Update all users (interns, supervisors, admins) where active is NULL
UPDATE users SET active = TRUE WHERE email IS NOT NULL AND (active IS NULL OR active = FALSE);

-- Option 6: Update by ID (if you know the IDs)
-- First get the IDs:
SELECT id, username, email, role, active FROM users WHERE role = 'INTERN' AND (active IS NULL OR active = FALSE);
-- Then update (replace with actual IDs):
UPDATE users SET active = TRUE WHERE id IN (1, 2, 3, 4, 5); -- Replace with actual IDs

