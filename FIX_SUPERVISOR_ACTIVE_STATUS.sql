-- Fix: Activate all supervisor users
-- Option 1: Update by email (if you know the email)
UPDATE users SET active = TRUE WHERE email = 'supervisor@univen.ac.za';

-- Option 2: Update by username (if you know the username)
UPDATE users SET active = TRUE WHERE username = 'supervisor@univen.ac.za';

-- Option 3: Update by ID (if you know the user ID)
UPDATE users SET active = TRUE WHERE id = 1;

-- Option 4: Update all supervisors using email (email is unique, so it's safe)
UPDATE users SET active = TRUE WHERE role = 'SUPERVISOR' AND email IS NOT NULL;

-- Option 5: Update specific supervisor by email
-- Replace 'your-supervisor-email@univen.ac.za' with the actual email
UPDATE users SET active = TRUE WHERE email = 'your-supervisor-email@univen.ac.za' AND role = 'SUPERVISOR';

-- Option 6: If you want to update ALL users (be careful!)
-- First, check which users are inactive:
SELECT id, username, email, role, active FROM users WHERE active = FALSE OR active IS NULL;

-- Then update by ID:
UPDATE users SET active = TRUE WHERE id IN (1, 2, 3); -- Replace with actual IDs

