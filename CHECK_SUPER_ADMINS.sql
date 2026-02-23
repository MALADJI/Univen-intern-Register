-- ============================================
-- Check Super Admins in Admin Table
-- ============================================
-- This query checks for SUPER_ADMIN users that have entries in the admins table
-- ============================================

SELECT 
    'Current Super Admins in Admin Table' AS info,
    COUNT(*) AS count,
    GROUP_CONCAT(a.email ORDER BY a.email SEPARATOR ', ') AS emails
FROM admins a
INNER JOIN users u ON a.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
WHERE u.role = 'SUPER_ADMIN';

-- Alternative: More detailed view
SELECT 
    'Detailed Super Admin Entries in Admin Table' AS info,
    a.admin_id,
    a.name,
    a.email,
    u.id AS user_id,
    u.username,
    u.role,
    a.department_id,
    a.created_at
FROM admins a
INNER JOIN users u ON a.email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
WHERE u.role = 'SUPER_ADMIN'
ORDER BY a.email;

