-- Check if the user 'tests@univen.ac.za' exists and is active
SELECT id, username, email, role, active FROM users WHERE email = 'tests@univen.ac.za';

-- If the user doesn't exist, you'll need to create it or use a different account
-- If the user exists but active is NULL or FALSE, update it:
UPDATE users SET active = TRUE WHERE email = 'tests@univen.ac.za';

-- Check all supervisor users:
SELECT id, username, email, role, active FROM users WHERE role = 'SUPERVISOR';

