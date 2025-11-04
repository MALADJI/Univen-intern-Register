# Complete Intern Testing Guide - From Registration to Sign Out

## 📋 Complete Test Sequence for Interns

This guide covers **everything an intern needs to do** - from registration to daily operations.

---

## 🚀 Step-by-Step Testing Sequence

### **STEP 1: Send Verification Code** (Required for Registration)

```
POST http://localhost:8082/api/auth/send-verification-code
Content-Type: application/json

{
  "email": "intern.test@univen.ac.za"
}
```

**Expected Response:**
```json
{
  "message": "Verification code sent to intern.test@univen.ac.za",
  "code": "123456"
}
```

**⚠️ IMPORTANT:** Copy the `code` from the response - you'll need it for registration!

---

### **STEP 2: Register as Intern**

```
POST http://localhost:8082/api/auth/register
Content-Type: application/json

{
  "username": "intern.test@univen.ac.za",
  "email": "intern.test@univen.ac.za",
  "password": "Intern123!",
  "role": "INTERN",
  "verificationCode": "123456",
  "name": "Test",
  "surname": "Intern",
  "department": "ICT",
  "field": "Software Development"
}
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "userId": "5",
  "role": "INTERN"
}
```

**✅ Success!** You're now registered as an intern.

---

### **STEP 3: Login as Intern**

```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "intern.test@univen.ac.za",
  "password": "Intern123!"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJpbnRlcm4udGVzdEB1bml2ZW4uYWMuemEiLCJyb2xlIjoiSU5URVJOIiwiaWF0IjoxNzYxODE5ODI2LCJleHAiOjE3NjE5MDYyMjZ9...",
  "role": "INTERN",
  "username": "intern.test@univen.ac.za",
  "email": "intern.test@univen.ac.za"
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
  "username": "intern.test@univen.ac.za",
  "email": "intern.test@univen.ac.za",
  "role": "INTERN"
}
```

---

### **STEP 5: Get Intern Profile**

**First, get your intern ID from the profile:**

```
GET http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN_HERE
```

**Or search for your intern record:**

```
GET http://localhost:8082/api/interns/search?name=Test&page=0&size=10
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "internId": 1,
    "name": "Test Intern",
    "email": "intern.test@univen.ac.za",
    "department": {
      "departmentId": 1,
      "name": "ICT"
    },
    "supervisor": {
      "supervisorId": 1,
      "name": "Supervisor Name"
    }
  }
]
```

**⚠️ IMPORTANT:** Note your `internId` - you'll need it for attendance!

---

### **STEP 6: Sign In (Attendance with Geolocation)**

```
POST http://localhost:8082/api/attendance/signin
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "internId": 1,
  "location": "Main Building, Room 101",
  "latitude": -22.9756,
  "longitude": 30.4475
}
```

**Expected Response:**
```json
{
  "attendanceId": 1,
  "date": "2024-12-20T08:00:00",
  "timeIn": "2024-12-20T08:00:00",
  "status": "SIGNED_IN",
  "location": "Main Building, Room 101",
  "latitude": -22.9756,
  "longitude": 30.4475,
  "intern": {
    "internId": 1,
    "name": "Test Intern"
  }
}
```

**⚠️ IMPORTANT:** Copy the `attendanceId` - you'll need it for sign out!

**Note:** `latitude` and `longitude` are optional. If not provided, only location name will be saved.

---

### **STEP 7: View My Attendance Records**

```
GET http://localhost:8082/api/attendance/intern/1
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "attendanceId": 1,
    "date": "2024-12-20T08:00:00",
    "timeIn": "2024-12-20T08:00:00",
    "timeOut": null,
    "status": "SIGNED_IN",
    "location": "Main Building, Room 101",
    "latitude": -22.9756,
    "longitude": 30.4475
  }
]
```

---

### **STEP 8: Sign Out (Attendance with Geolocation)**

```
PUT http://localhost:8082/api/attendance/signout/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "location": "Main Building, Exit",
  "latitude": -22.9756,
  "longitude": 30.4475
}
```

**Expected Response:**
```json
{
  "attendanceId": 1,
  "date": "2024-12-20T08:00:00",
  "timeIn": "2024-12-20T08:00:00",
  "timeOut": "2024-12-20T17:00:00",
  "status": "SIGNED_OUT",
  "location": "Main Building, Exit",
  "latitude": -22.9756,
  "longitude": 30.4475
}
```

**Note:** Request body is optional. If provided, location and geolocation will be updated.

---

### **STEP 9: Submit Leave Request**

```
POST http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "internId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL"
}
```

**Expected Response:**
```json
{
  "leaveRequestId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL",
  "status": "PENDING",
  "intern": {
    "internId": 1,
    "name": "Test Intern"
  }
}
```

**Available Leave Types:**
- `ANNUAL` - Annual leave
- `SICK` - Sick leave
- `CASUAL` - Casual leave
- `EMERGENCY` - Emergency leave
- `OTHER` - Other leave
- `UNPAID` - Unpaid leave
- `STUDY` - Study leave

---

### **STEP 10: View My Leave Requests**

```
GET http://localhost:8082/api/leave/intern/1
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
    "createdAt": "2024-12-20T10:00:00"
  }
]
```

---

### **STEP 11: View All My Leave Requests (with Status Filter)**

```
GET http://localhost:8082/api/leave/intern/1?status=PENDING
Authorization: Bearer YOUR_TOKEN_HERE
```

**Available Status Values:**
- `PENDING` - Awaiting approval
- `APPROVED` - Approved
- `REJECTED` - Rejected

---

### **STEP 12: Upload Leave Request Attachment (Optional)**

```
POST http://localhost:8082/api/leave/1/attachment
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

file: [Select your document file]
```

**Note:** This is optional. You can attach medical certificates, documents, etc.

---

## 📍 Geolocation Coordinates Reference

**University of Venda (Thohoyandou):**
- **Main Building:** `-22.9756, 30.4475`
- **Library:** `-22.9760, 30.4480`
- **Admin Block:** `-22.9750, 30.4470`
- **Lab Building:** `-22.9765, 30.4485`

**Test Coordinates:**
- Use any coordinates between `-22.97` to `-22.98` for latitude
- Use any coordinates between `30.44` to `30.45` for longitude

---

## 🔄 Complete Daily Workflow

### **Morning Routine:**
1. ✅ Login
2. ✅ Get intern ID
3. ✅ Sign In (with location)

### **End of Day:**
4. ✅ Sign Out (with location)
5. ✅ View today's attendance

### **When Needed:**
6. ✅ Submit leave request
7. ✅ View leave request status
8. ✅ Upload leave documents

---

## 📝 All Intern Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/send-verification-code` | POST | Send verification code | No |
| `/api/auth/register` | POST | Register as intern | No |
| `/api/auth/login` | POST | Login | No |
| `/api/auth/me` | GET | Get current user info | Yes |
| `/api/interns` | GET | Get all interns | Yes |
| `/api/interns/{id}` | GET | Get intern by ID | Yes |
| `/api/interns/search` | GET | Search interns | Yes |
| `/api/attendance/signin` | POST | Sign in (with geolocation) | Yes |
| `/api/attendance/signout/{id}` | PUT | Sign out (with geolocation) | Yes |
| `/api/attendance/intern/{internId}` | GET | Get my attendance | Yes |
| `/api/leave` | POST | Submit leave request | Yes |
| `/api/leave/intern/{internId}` | GET | Get my leave requests | Yes |
| `/api/leave/{id}/attachment` | POST | Upload leave document | Yes |

---

## 🧪 Complete Test Checklist

### **Registration & Setup:**
- [ ] Send verification code
- [ ] Register as intern
- [ ] Login successfully
- [ ] Get current user info
- [ ] Get intern profile

### **Daily Attendance:**
- [ ] Sign in with location
- [ ] Sign in with geolocation
- [ ] View my attendance records
- [ ] Sign out with location
- [ ] Sign out with geolocation
- [ ] Verify attendance saved correctly

### **Leave Management:**
- [ ] Submit annual leave request
- [ ] Submit sick leave request
- [ ] Submit casual leave request
- [ ] View all my leave requests
- [ ] Filter leave by status
- [ ] Upload leave attachment

---

## ❌ Common Errors & Solutions

### **Error: "Invalid verification code"**
**Solution:**
1. Make sure you called `/send-verification-code` first
2. Use the code from the response immediately
3. Codes expire after 10 minutes
4. Codes are one-time use only

### **Error: "Intern not found"**
**Solution:**
1. Check your intern ID
2. Make sure you're registered
3. Get your intern ID from `/api/interns` endpoint

### **Error: "401 Unauthorized"**
**Solution:**
1. Login again to get a new token
2. Check Authorization header format: `Bearer YOUR_TOKEN`
3. Make sure token is not expired (24 hours)

### **Error: "Invalid leaveType"**
**Solution:**
Use one of these exact values:
- `ANNUAL`, `SICK`, `CASUAL`, `EMERGENCY`, `OTHER`, `UNPAID`, `STUDY`

---

## 🎯 Quick Test Sequence (Copy & Paste)

### **1. Register:**
```bash
# Send code
POST http://localhost:8082/api/auth/send-verification-code
{"email": "intern.test@univen.ac.za"}

# Register
POST http://localhost:8082/api/auth/register
{
  "username": "intern.test@univen.ac.za",
  "email": "intern.test@univen.ac.za",
  "password": "Intern123!",
  "role": "INTERN",
  "verificationCode": "123456",
  "name": "Test",
  "surname": "Intern",
  "department": "ICT"
}
```

### **2. Login:**
```bash
POST http://localhost:8082/api/auth/login
{"username": "intern.test@univen.ac.za", "password": "Intern123!"}
# Copy token from response
```

### **3. Get Intern ID:**
```bash
GET http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN
# Note internId from response
```

### **4. Sign In:**
```bash
POST http://localhost:8082/api/attendance/signin
Authorization: Bearer YOUR_TOKEN
{
  "internId": 1,
  "location": "Main Building",
  "latitude": -22.9756,
  "longitude": 30.4475
}
# Note attendanceId from response
```

### **5. Sign Out:**
```bash
PUT http://localhost:8082/api/attendance/signout/1
Authorization: Bearer YOUR_TOKEN
{
  "location": "Main Building",
  "latitude": -22.9756,
  "longitude": 30.4475
}
```

### **6. Submit Leave:**
```bash
POST http://localhost:8082/api/leave
Authorization: Bearer YOUR_TOKEN
{
  "internId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL"
}
```

---

## ✅ Success Indicators

### **Registration:**
- ✅ Verification code received
- ✅ User registered successfully
- ✅ Intern profile created

### **Login:**
- ✅ Token received
- ✅ Role is "INTERN"
- ✅ Can access protected endpoints

### **Attendance:**
- ✅ Sign in successful
- ✅ Geolocation saved
- ✅ Sign out successful
- ✅ Attendance records visible

### **Leave:**
- ✅ Leave request submitted
- ✅ Status is "PENDING"
- ✅ Can view leave requests

---

## 📚 Additional Resources

- **Complete API Docs:** `POSTMAN_TEST_LINKS.md`
- **Auth Guide:** `POSTMAN_TEST_GUIDE_WITH_AUTH.md`
- **Admin Features:** `ADMIN_FEATURES_SUMMARY.md`

---

## 🎉 You're All Set!

Follow this guide step-by-step to test everything an intern can do in the system. All endpoints are ready and working!

