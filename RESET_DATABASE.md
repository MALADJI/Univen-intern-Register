# Database Reset Instructions

## Option 1: Using SQL Script (Recommended)

1. **Open MySQL Workbench** or MySQL command line
2. **Connect to your database**: `internregister`
3. **Run the SQL script**: `reset_database.sql`

Or run these commands directly:

```sql
-- Connect to database
USE internregister;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all data
DELETE FROM verification_codes;
DELETE FROM attendance;
DELETE FROM leave_requests;
DELETE FROM interns;
DELETE FROM supervisors;
DELETE FROM admins;
DELETE FROM users;
DELETE FROM departments;

-- Reset auto-increment counters
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE admins AUTO_INCREMENT = 1;
ALTER TABLE supervisors AUTO_INCREMENT = 1;
ALTER TABLE interns AUTO_INCREMENT = 1;
ALTER TABLE attendance AUTO_INCREMENT = 1;
ALTER TABLE leave_requests AUTO_INCREMENT = 1;
ALTER TABLE verification_codes AUTO_INCREMENT = 1;
ALTER TABLE departments AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify reset
SELECT 
    (SELECT COUNT(*) FROM users) AS users_count,
    (SELECT COUNT(*) FROM admins) AS admins_count,
    (SELECT COUNT(*) FROM supervisors) AS supervisors_count,
    (SELECT COUNT(*) FROM interns) AS interns_count,
    (SELECT COUNT(*) FROM attendance) AS attendance_count,
    (SELECT COUNT(*) FROM leave_requests) AS leave_requests_count,
    (SELECT COUNT(*) FROM verification_codes) AS verification_codes_count;
```

## Option 2: Using API Endpoint (Requires Authentication)

**Note**: This endpoint requires admin authentication. If you're not logged in as admin, use Option 1 instead.

```bash
POST http://localhost:8082/api/admins/reset-database
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Using PowerShell:**
```powershell
# First login to get token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8082/api/auth/login" `
    -Method POST -Headers @{"Content-Type"="application/json"} `
    -Body '{"username":"admin@univen.ac.za","password":"admin123"}'

# Then reset database
$token = $loginResponse.token
Invoke-RestMethod -Uri "http://localhost:8082/api/admins/reset-database" `
    -Method POST -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
```

**Response:**
```json
{
  "success": true,
  "message": "Database reset successfully",
  "deleted": {
    "users": 5,
    "admins": 2,
    "supervisors": 1,
    "interns": 3,
    "attendance": 10,
    "leaveRequests": 2,
    "verificationCodes": 1
  },
  "totalDeleted": 24
}
```

## Option 3: Using MySQL Command Line

```bash
mysql -u root -p internregister < reset_database.sql
```

Enter your MySQL password when prompted (default: `Ledge.98`)

## What Gets Deleted

The reset will delete ALL data from:
- ✅ Users (including authentication data)
- ✅ Admins
- ✅ Supervisors
- ✅ Interns
- ✅ Attendance records
- ✅ Leave requests
- ✅ Verification codes
- ✅ Departments (will be recreated on next startup)

## After Reset

1. **Restart your Spring Boot application**
2. The `DatabaseInitializer` will automatically create default users:
   - `admin@univen.ac.za` / `admin123` (ADMIN)
   - `supervisor@univen.ac.za` / `supervisor123` (SUPERVISOR)
   - `intern@univen.ac.za` / `intern123` (INTERN)

## Quick Reset (Copy & Paste)

Run this in MySQL:

```sql
USE internregister; SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM verification_codes; DELETE FROM attendance; DELETE FROM leave_requests;
DELETE FROM interns; DELETE FROM supervisors; DELETE FROM admins; DELETE FROM users; DELETE FROM departments;
ALTER TABLE users AUTO_INCREMENT = 1; ALTER TABLE admins AUTO_INCREMENT = 1;
ALTER TABLE supervisors AUTO_INCREMENT = 1; ALTER TABLE interns AUTO_INCREMENT = 1;
ALTER TABLE attendance AUTO_INCREMENT = 1; ALTER TABLE leave_requests AUTO_INCREMENT = 1;
ALTER TABLE verification_codes AUTO_INCREMENT = 1; ALTER TABLE departments AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;
SELECT 'Database reset complete!' AS message;
```

