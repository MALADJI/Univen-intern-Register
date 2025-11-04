# Complete Supervisor Testing Guide - All Functionalities

## 📋 Complete Test Sequence for Supervisors

This guide covers **everything a supervisor needs to do** - from registration to managing interns and leave requests.

---

## 🚀 Step-by-Step Testing Sequence

### **STEP 1: Send Verification Code** (Required for Registration)

```
POST http://localhost:8082/api/auth/send-verification-code
Content-Type: application/json

{
  "email": "supervisor.test@univen.ac.za"
}
```

**Expected Response:**
```json
{
  "message": "Verification code sent to supervisor.test@univen.ac.za",
  "code": "123456"
}
```

**⚠️ IMPORTANT:** Copy the `code` from the response - you'll need it for registration!

---

### **STEP 2: Register as Supervisor**

```
POST http://localhost:8082/api/auth/register
Content-Type: application/json

{
  "username": "supervisor.test@univen.ac.za",
  "email": "supervisor.test@univen.ac.za",
  "password": "Supervisor123!",
  "role": "SUPERVISOR",
  "verificationCode": "123456",
  "name": "Test",
  "surname": "Supervisor",
  "department": "ICT"
}
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "userId": "5",
  "role": "SUPERVISOR"
}
```

**✅ Success!** You're now registered as a supervisor.

---

### **STEP 3: Login as Supervisor**

```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "supervisor.test@univen.ac.za",
  "password": "Supervisor123!"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcnZpc29yLnRlc3RAdW5pdmVuLmFjLnphIiwicm9sZSI6IlNVUEVSVklTT1IiLCJpYXQiOjE3NjE4MTk4MjYsImV4cCI6MTc2MTkwNjIyNn0...",
  "role": "SUPERVISOR",
  "username": "supervisor.test@univen.ac.za",
  "email": "supervisor.test@univen.ac.za"
}
```

**⚠️ IMPORTANT:** Copy the `token` - you'll need it for all protected endpoints!

---

### **STEP 4: Get Current User Info**

```
GET http://localhost:8082/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "id": 5,
  "username": "supervisor.test@univen.ac.za",
  "email": "supervisor.test@univen.ac.za",
  "role": "SUPERVISOR"
}
```

---

### **STEP 5: Get Supervisor Profile**

**First, get your supervisor ID from the profile:**

```
GET http://localhost:8082/api/supervisors
Authorization: Bearer YOUR_TOKEN_HERE
```

**Or get supervisor by ID:**

```
GET http://localhost:8082/api/supervisors/1
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "supervisorId": 1,
    "name": "Test Supervisor",
    "email": "supervisor.test@univen.ac.za",
    "department": {
      "departmentId": 1,
      "name": "ICT"
    }
  }
]
```

**⚠️ IMPORTANT:** Note your `supervisorId` - you may need it for some operations.

---

## 👥 MANAGING INTERNS (Supervisor Functions)

### **View All Interns**

```
GET http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "internId": 1,
    "name": "Jane Intern",
    "email": "jane.intern@univen.ac.za",
    "department": {
      "departmentId": 1,
      "name": "ICT"
    },
    "supervisor": {
      "supervisorId": 1,
      "name": "Test Supervisor"
    }
  }
]
```

---

### **Search Interns**

```
GET http://localhost:8082/api/interns/search?name=Jane&page=0&size=10
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters:**
- `name` - Search by name (optional)
- `page` - Page number (default: 0)
- `size` - Page size (default: 10)

---

### **Get Intern by ID**

```
GET http://localhost:8082/api/interns/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### **View Interns by Department**

```
GET http://localhost:8082/api/interns/search?department=ICT&page=0&size=10
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📍 VIEWING ATTENDANCE (Supervisor Functions)

### **View All Attendance Records**

```
GET http://localhost:8082/api/attendance
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "attendanceId": 1,
    "date": "2024-12-20T08:00:00",
    "timeIn": "2024-12-20T08:00:00",
    "timeOut": "2024-12-20T17:00:00",
    "status": "SIGNED_OUT",
    "location": "Main Building",
    "latitude": -22.9756,
    "longitude": 30.4475,
    "intern": {
      "internId": 1,
      "name": "Jane Intern"
    }
  }
]
```

---

### **View Attendance by Specific Intern**

```
GET http://localhost:8082/api/attendance/intern/1
Authorization: Bearer YOUR_TOKEN_HERE
```

**Use Case:** Supervisors can check attendance records for interns they supervise.

---

## 📋 MANAGING LEAVE REQUESTS (Supervisor Functions)

### **View All Leave Requests**

```
GET http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "leaveRequestId": 1,
    "fromDate": "2024-12-25",
    "toDate": "2024-12-27",
    "leaveType": "ANNUAL",
    "status": "PENDING",
    "intern": {
      "internId": 1,
      "name": "Jane Intern"
    },
    "createdAt": "2024-12-20T10:00:00"
  }
]
```

---

### **Filter Leave Requests by Status**

```
GET http://localhost:8082/api/leave?status=PENDING
Authorization: Bearer YOUR_TOKEN_HERE
```

**Available Status Values:**
- `PENDING` - Awaiting approval
- `APPROVED` - Approved
- `REJECTED` - Rejected

---

### **Search Leave Requests**

```
GET http://localhost:8082/api/leave/search?status=PENDING&internId=1&page=0&size=10
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters:**
- `status` - Filter by status (optional)
- `internId` - Filter by intern ID (optional)
- `page` - Page number (default: 0)
- `size` - Page size (default: 10)

---

### **Approve Leave Request**

```
PUT http://localhost:8082/api/leave/approve/1
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "leaveRequestId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL",
  "status": "APPROVED",
  "intern": {
    "internId": 1,
    "name": "Jane Intern"
  }
}
```

**⚠️ IMPORTANT:** Replace `1` with the actual `leaveRequestId` you want to approve.

---

### **Reject Leave Request**

```
PUT http://localhost:8082/api/leave/reject/1
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "leaveRequestId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL",
  "status": "REJECTED",
  "intern": {
    "internId": 1,
    "name": "Jane Intern"
  }
}
```

**⚠️ IMPORTANT:** Replace `1` with the actual `leaveRequestId` you want to reject.

---

### **View Leave Requests by Specific Intern**

```
GET http://localhost:8082/api/leave/intern/1
Authorization: Bearer YOUR_TOKEN_HERE
```

**Use Case:** Supervisors can view all leave requests for a specific intern they supervise.

---

### **Download Leave Request Attachment**

```
GET http://localhost:8082/api/leave/attachment/document.pdf
Authorization: Bearer YOUR_TOKEN_HERE
```

**Use Case:** Supervisors can download attachments (medical certificates, documents) uploaded with leave requests.

---

## 📊 VIEWING REPORTS (Supervisor Functions)

### **Generate Attendance Report - PDF (All)**

```
GET http://localhost:8082/api/reports/attendance/pdf
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:** PDF file download

---

### **Generate Attendance Report - PDF (Filtered)**

```
GET http://localhost:8082/api/reports/attendance/pdf?internName=Jane&department=ICT&field=Software
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters:**
- `internName` - Filter by intern name (optional)
- `department` - Filter by department (optional)
- `field` - Filter by field (optional)

---

### **Generate Attendance Report - Excel (All)**

```
GET http://localhost:8082/api/reports/attendance/excel
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:** Excel file download

---

### **Generate Attendance Report - Excel (Filtered)**

```
GET http://localhost:8082/api/reports/attendance/excel?internName=Jane&department=ICT&field=Software
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🏢 MANAGING DEPARTMENTS (View Only)

### **View All Departments**

```
GET http://localhost:8082/api/departments
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "departmentId": 1,
    "name": "ICT"
  },
  {
    "departmentId": 2,
    "name": "Marketing"
  }
]
```

---

### **View Department by ID**

```
GET http://localhost:8082/api/departments/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📝 All Supervisor Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/send-verification-code` | POST | Send verification code | No |
| `/api/auth/register` | POST | Register as supervisor | No |
| `/api/auth/login` | POST | Login | No |
| `/api/auth/me` | GET | Get current user info | Yes |
| `/api/supervisors` | GET | Get all supervisors | Yes |
| `/api/supervisors/{id}` | GET | Get supervisor by ID | Yes |
| `/api/interns` | GET | Get all interns | Yes |
| `/api/interns/{id}` | GET | Get intern by ID | Yes |
| `/api/interns/search` | GET | Search interns | Yes |
| `/api/attendance` | GET | Get all attendance | Yes |
| `/api/attendance/intern/{internId}` | GET | Get attendance by intern | Yes |
| `/api/leave` | GET | Get all leave requests | Yes |
| `/api/leave?status={status}` | GET | Filter leave by status | Yes |
| `/api/leave/intern/{internId}` | GET | Get leave by intern | Yes |
| `/api/leave/search` | GET | Search leave requests | Yes |
| `/api/leave/approve/{id}` | PUT | Approve leave request | Yes |
| `/api/leave/reject/{id}` | PUT | Reject leave request | Yes |
| `/api/leave/attachment/{filename}` | GET | Download attachment | Yes |
| `/api/reports/attendance/pdf` | GET | Generate PDF report | Yes |
| `/api/reports/attendance/excel` | GET | Generate Excel report | Yes |
| `/api/departments` | GET | Get all departments | Yes |
| `/api/departments/{id}` | GET | Get department by ID | Yes |

---

## 🧪 Complete Test Checklist

### **Registration & Setup:**
- [ ] Send verification code
- [ ] Register as supervisor
- [ ] Login successfully
- [ ] Get current user info
- [ ] Get supervisor profile

### **Managing Interns:**
- [ ] View all interns
- [ ] Search interns by name
- [ ] Get intern by ID
- [ ] View interns by department

### **Viewing Attendance:**
- [ ] View all attendance records
- [ ] View attendance by specific intern
- [ ] Verify attendance includes geolocation

### **Managing Leave Requests:**
- [ ] View all leave requests
- [ ] Filter leave by status (PENDING)
- [ ] Search leave requests
- [ ] View leave by specific intern
- [ ] Approve leave request
- [ ] Reject leave request
- [ ] Download leave attachment

### **Viewing Reports:**
- [ ] Generate PDF report (all)
- [ ] Generate PDF report (filtered)
- [ ] Generate Excel report (all)
- [ ] Generate Excel report (filtered)

### **Departments:**
- [ ] View all departments
- [ ] View department by ID

---

## 🔄 Complete Daily Workflow

### **Morning Routine:**
1. ✅ Login
2. ✅ View pending leave requests
3. ✅ Approve/reject leave requests
4. ✅ Check intern attendance

### **During Day:**
5. ✅ View intern profiles
6. ✅ Monitor attendance
7. ✅ Review leave requests

### **End of Day:**
8. ✅ Generate attendance reports
9. ✅ Review intern performance

---

## ❌ Common Errors & Solutions

### **Error: "Invalid verification code"**
**Solution:**
1. Make sure you called `/send-verification-code` first
2. Use the code from the response immediately
3. Codes expire after 10 minutes
4. Codes are one-time use only

### **Error: "401 Unauthorized"**
**Solution:**
1. Login again to get a new token
2. Check Authorization header format: `Bearer YOUR_TOKEN`
3. Make sure token is not expired (24 hours)

### **Error: "Leave request not found"**
**Solution:**
1. Check the leaveRequestId is correct
2. Verify the leave request exists
3. Use `/api/leave` to see all leave requests first

### **Error: "Intern not found"**
**Solution:**
1. Check the intern ID
2. Verify intern exists
3. Use `/api/interns` to see all interns

---

## 🎯 Quick Test Sequence (Copy & Paste)

### **1. Register:**
```bash
# Send code
POST http://localhost:8082/api/auth/send-verification-code
{"email": "supervisor.test@univen.ac.za"}

# Register
POST http://localhost:8082/api/auth/register
{
  "username": "supervisor.test@univen.ac.za",
  "email": "supervisor.test@univen.ac.za",
  "password": "Supervisor123!",
  "role": "SUPERVISOR",
  "verificationCode": "123456",
  "name": "Test",
  "surname": "Supervisor",
  "department": "ICT"
}
```

### **2. Login:**
```bash
POST http://localhost:8082/api/auth/login
{"username": "supervisor.test@univen.ac.za", "password": "Supervisor123!"}
# Copy token from response
```

### **3. View Interns:**
```bash
GET http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN
```

### **4. View Leave Requests:**
```bash
GET http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN
```

### **5. Approve Leave:**
```bash
PUT http://localhost:8082/api/leave/approve/1
Authorization: Bearer YOUR_TOKEN
```

### **6. View Attendance:**
```bash
GET http://localhost:8082/api/attendance
Authorization: Bearer YOUR_TOKEN
```

### **7. Generate Report:**
```bash
GET http://localhost:8082/api/reports/attendance/pdf
Authorization: Bearer YOUR_TOKEN
```

---

## ✅ Success Indicators

### **Registration:**
- ✅ Verification code received
- ✅ User registered successfully
- ✅ Supervisor profile created

### **Login:**
- ✅ Token received
- ✅ Role is "SUPERVISOR"
- ✅ Can access protected endpoints

### **Managing Interns:**
- ✅ Can view all interns
- ✅ Can search interns
- ✅ Can view intern details

### **Leave Management:**
- ✅ Can view all leave requests
- ✅ Can approve leave requests
- ✅ Can reject leave requests
- ✅ Can filter by status

### **Reports:**
- ✅ Can generate PDF reports
- ✅ Can generate Excel reports
- ✅ Can filter reports

---

## 📚 Additional Resources

- **Complete API Docs:** `POSTMAN_TEST_LINKS.md`
- **Auth Guide:** `POSTMAN_TEST_GUIDE_WITH_AUTH.md`
- **Intern Guide:** `INTERN_COMPLETE_TEST_GUIDE.md`

---

## 🎉 You're All Set!

Follow this guide step-by-step to test everything a supervisor can do in the system. All endpoints are ready and working!

**Key Supervisor Capabilities:**
- ✅ View and manage interns
- ✅ Approve/reject leave requests
- ✅ View attendance records
- ✅ Generate reports
- ✅ Monitor intern performance

