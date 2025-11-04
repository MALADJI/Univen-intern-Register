# Postman Test Links - Intern Register System

## 📋 Quick Setup Guide

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Postman_Collection.json` file
4. Collection will be imported with all endpoints

### Step 2: Set Variables
1. In Postman, click on the collection name
2. Go to **Variables** tab
3. Set `baseUrl` = `http://localhost:8082/api`
4. `token` will be auto-filled after login

### Step 3: Get Authentication Token
1. Run **"Login"** request first
2. Token will be automatically saved to collection variable
3. All other requests will use this token automatically

---

## 🔗 All API Endpoints

### Base URL
```
http://localhost:8082/api
```

---

## 1️⃣ AUTHENTICATION ENDPOINTS

### Send Verification Code
```
POST http://localhost:8082/api/auth/send-verification-code
Content-Type: application/json

{
  "email": "test@univen.ac.za"
}
```

### Verify Code
```
POST http://localhost:8082/api/auth/verify-code
Content-Type: application/json

{
  "email": "test@univen.ac.za",
  "code": "123456"
}
```

### Register - ADMIN
```
POST http://localhost:8082/api/auth/register
Content-Type: application/json

{
  "username": "admin@univen.ac.za",
  "email": "admin@univen.ac.za",
  "password": "Admin123!",
  "role": "ADMIN",
  "verificationCode": "123456",
  "name": "Admin",
  "surname": "User"
}
```

### Register - SUPERVISOR
```
POST http://localhost:8082/api/auth/register
Content-Type: application/json

{
  "username": "supervisor@univen.ac.za",
  "email": "supervisor@univen.ac.za",
  "password": "Supervisor123!",
  "role": "SUPERVISOR",
  "verificationCode": "123456",
  "name": "Supervisor",
  "surname": "User",
  "department": "ICT"
}
```

### Register - INTERN
```
POST http://localhost:8082/api/auth/register
Content-Type: application/json

{
  "username": "intern@univen.ac.za",
  "email": "intern@univen.ac.za",
  "password": "Intern123!",
  "role": "INTERN",
  "verificationCode": "123456",
  "name": "Intern",
  "surname": "User",
  "department": "ICT"
}
```

### Login (✅ Auto-saves token)
```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "admin@univen.ac.za",
  "password": "Admin123!"
}
```

### Get Current User
```
GET http://localhost:8082/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 2️⃣ INTERN ENDPOINTS

### Get All Interns
```
GET http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN_HERE
```

### Search Interns
```
GET http://localhost:8082/api/interns/search?name=John&page=0&size=10
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Intern by ID
```
GET http://localhost:8082/api/interns/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Intern
```
POST http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "New Intern",
  "email": "newintern@univen.ac.za",
  "departmentId": 1,
  "supervisorId": 1
}
```

### Update Intern
```
PUT http://localhost:8082/api/interns/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Intern Name",
  "email": "updated@univen.ac.za"
}
```

### Delete Intern
```
DELETE http://localhost:8082/api/interns/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 3️⃣ ATTENDANCE ENDPOINTS

### Get All Attendance
```
GET http://localhost:8082/api/attendance
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Attendance by Intern ID
```
GET http://localhost:8082/api/attendance/intern/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Sign In
```
POST http://localhost:8082/api/attendance/signin
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "internId": 1,
  "location": "Main Building"
}
```

### Sign Out
```
PUT http://localhost:8082/api/attendance/signout/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 4️⃣ LEAVE REQUEST ENDPOINTS

### Get All Leave Requests
```
GET http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Leave Requests by Status
```
GET http://localhost:8082/api/leave?status=PENDING
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Leave Requests by Intern
```
GET http://localhost:8082/api/leave/intern/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Search Leave Requests
```
GET http://localhost:8082/api/leave/search?status=PENDING&internId=1&page=0&size=10
Authorization: Bearer YOUR_TOKEN_HERE
```

### Submit Leave Request
```
POST http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "internId": 1,
  "fromDate": "2024-12-01",
  "toDate": "2024-12-05",
  "reason": "Personal leave",
  "leaveType": "ANNUAL"
}
```

### Upload Leave Attachment
```
POST http://localhost:8082/api/leave/1/attachment
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

file: [Select file]
```

### Approve Leave Request
```
PUT http://localhost:8082/api/leave/approve/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Reject Leave Request
```
PUT http://localhost:8082/api/leave/reject/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 5️⃣ REPORT ENDPOINTS

### Generate PDF Report (All)
```
GET http://localhost:8082/api/reports/attendance/pdf
Authorization: Bearer YOUR_TOKEN_HERE
```

### Generate PDF Report (Filtered)
```
GET http://localhost:8082/api/reports/attendance/pdf?internName=John&department=ICT
Authorization: Bearer YOUR_TOKEN_HERE
```

### Generate Excel Report (All)
```
GET http://localhost:8082/api/reports/attendance/excel
Authorization: Bearer YOUR_TOKEN_HERE
```

### Generate Excel Report (Filtered)
```
GET http://localhost:8082/api/reports/attendance/excel?internName=John&department=ICT&field=Digital
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 6️⃣ DEPARTMENT ENDPOINTS

### Get All Departments
```
GET http://localhost:8082/api/departments
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Department
```
POST http://localhost:8082/api/departments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "New Department"
}
```

### Delete Department
```
DELETE http://localhost:8082/api/departments/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 7️⃣ SUPERVISOR ENDPOINTS

### Get All Supervisors
```
GET http://localhost:8082/api/supervisors
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get Supervisor by ID
```
GET http://localhost:8082/api/supervisors/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Supervisor
```
POST http://localhost:8082/api/supervisors
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "New Supervisor",
  "email": "newsupervisor@univen.ac.za",
  "departmentId": 1
}
```

### Delete Supervisor
```
DELETE http://localhost:8082/api/supervisors/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 8️⃣ ADMIN ENDPOINTS

### Get All Admins
```
GET http://localhost:8082/api/admins
Authorization: Bearer YOUR_TOKEN_HERE
```

### Create Admin
```
POST http://localhost:8082/api/admins
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@univen.ac.za"
}
```

### Delete Admin
```
DELETE http://localhost:8082/api/admins/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 9️⃣ ERROR TESTING ENDPOINTS

### Test Invalid Login - Wrong Password
```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "admin@univen.ac.za",
  "password": "WrongPassword123!"
}
```
**Expected**: 401 Unauthorized

### Test Invalid Login - Non-existent User
```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "nonexistent@univen.ac.za",
  "password": "Password123!"
}
```
**Expected**: 401 Unauthorized

### Test Unauthorized - No Token
```
GET http://localhost:8082/api/interns
```
**Expected**: 401 Unauthorized

### Test Invalid Token
```
GET http://localhost:8082/api/interns
Authorization: Bearer invalid_token_here
```
**Expected**: 401 Unauthorized

---

## 📚 SWAGGER UI

### Access Swagger Documentation
```
http://localhost:8082/swagger-ui/index.html
```

### Access OpenAPI JSON
```
http://localhost:8082/v3/api-docs
```

---

## 🎯 Testing Workflow

### Recommended Testing Order:

1. **Authentication**
   - Send Verification Code
   - Verify Code (use code from response)
   - Register User (ADMIN/SUPERVISOR/INTERN)
   - Login (token auto-saved)
   - Get Current User

2. **CRUD Operations**
   - Get All Interns/Supervisors/Departments
   - Create new records
   - Update records
   - Delete records

3. **Attendance**
   - Sign In
   - Get Attendance
   - Sign Out

4. **Leave Requests**
   - Submit Leave Request
   - Get Leave Requests
   - Approve/Reject Leave

5. **Reports**
   - Generate PDF Report
   - Generate Excel Report

6. **Error Testing**
   - Test invalid credentials
   - Test unauthorized access
   - Test invalid tokens

---

## ✅ Quick Tips

1. **Token Management**: After login, token is automatically saved. Use `{{token}}` in other requests.

2. **Replace IDs**: Replace `1` in URLs with actual IDs from your database.

3. **Email Verification**: Codes are valid for 10 minutes. Check backend logs for code.

4. **Rate Limiting**: After 5 failed login attempts, IP is locked for 15 minutes.

5. **Password Requirements**: Must be 8+ chars with uppercase, lowercase, digit, and special char.

---

## 📞 Need Help?

- Check backend logs for detailed error messages
- Use Swagger UI for interactive testing
- Review `API_DOCUMENTATION.md` for detailed endpoint documentation

