# Leave Request Fix - Interns Can Now Submit Leave Requests

## ✅ Problem Fixed

Interns were unable to submit leave requests. The issue was that the endpoint:
1. Required authentication but didn't check it properly
2. Required `internId` in the request body, which interns might not know
3. Didn't automatically link the request to the authenticated intern's profile

## 🔧 Changes Made

### 1. Enhanced Leave Request Submission (`POST /api/leave`)

**For Interns:**
- ✅ Automatically retrieves the intern profile from the authenticated user's email
- ✅ No need to provide `internId` in the request body
- ✅ Validates that the intern profile exists
- ✅ Provides clear error messages if profile is missing

**For Admins/Supervisors:**
- ✅ Can still submit leave requests on behalf of interns by providing `internId`
- ✅ Can also submit for themselves if they have an intern profile

**Authentication:**
- ✅ Requires authentication (JWT token)
- ✅ Validates user exists
- ✅ Checks user role (INTERN, ADMIN, or SUPERVISOR)
- ✅ Only authorized roles can submit leave requests

### 2. Enhanced Get Leave Requests (`GET /api/leave/intern/{internId}`)

**For Interns:**
- ✅ Can only view their own leave requests
- ✅ Authorization check ensures they can't view other interns' requests
- ✅ Returns 403 if they try to access another intern's requests

**For Admins/Supervisors:**
- ✅ Can view any intern's leave requests
- ✅ No restrictions

### 3. New Endpoint: Get My Leave Requests (`GET /api/leave/my-leave`)

**New Endpoint for Interns:**
- ✅ Interns can get their own leave requests without knowing their `internId`
- ✅ Automatically uses the authenticated user's intern profile
- ✅ Only available for INTERN role

## 📋 API Usage

### Submit Leave Request (Intern)

**Request:**
```http
POST /api/leave
Authorization: Bearer {intern_token}
Content-Type: application/json

{
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL"
}
```

**Note:** Interns don't need to provide `internId` - it's automatically retrieved from their profile.

**Response (200 OK):**
```json
{
  "requestId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL",
  "status": "PENDING",
  "createdAt": "2024-11-09T10:00:00"
}
```

### Submit Leave Request (Admin/Supervisor on behalf of intern)

**Request:**
```http
POST /api/leave
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "internId": 1,
  "fromDate": "2024-12-25",
  "toDate": "2024-12-27",
  "leaveType": "ANNUAL"
}
```

### Get My Leave Requests (Intern)

**Request:**
```http
GET /api/leave/my-leave
Authorization: Bearer {intern_token}
```

**Response (200 OK):**
```json
[
  {
    "requestId": 1,
    "fromDate": "2024-12-25",
    "toDate": "2024-12-27",
    "leaveType": "ANNUAL",
    "status": "PENDING"
  }
]
```

### Get Leave Requests by Intern ID

**Request (Intern - own requests only):**
```http
GET /api/leave/intern/{internId}
Authorization: Bearer {intern_token}
```

**Request (Admin/Supervisor - any intern):**
```http
GET /api/leave/intern/{internId}
Authorization: Bearer {admin_token}
```

## 🚨 Error Responses

### Not Authenticated (401)
```json
{
  "error": "Not authenticated",
  "message": "Please log in to submit a leave request"
}
```

### Intern Profile Not Found (404)
```json
{
  "error": "Intern profile not found",
  "message": "Your intern profile was not found. Please contact an administrator."
}
```

### Unauthorized (403)
```json
{
  "error": "Unauthorized",
  "message": "You can only view your own leave requests"
}
```

### Missing Required Fields (400)
```json
{
  "error": "fromDate is required",
  "message": "Please provide the start date of your leave"
}
```

## 🔐 Security Improvements

1. ✅ **Authentication Required**: All endpoints require valid JWT token
2. ✅ **Authorization Checks**: Interns can only access their own data
3. ✅ **Automatic Profile Linking**: Interns don't need to provide `internId` - reduces risk of errors
4. ✅ **Role-Based Access**: Different permissions for INTERN, ADMIN, and SUPERVISOR roles
5. ✅ **Clear Error Messages**: Helps users understand what went wrong

## 🧪 Testing

### Test as Intern

1. **Login as intern:**
   ```http
   POST /api/auth/login
   {
     "username": "intern@univen.ac.za",
     "password": "Intern123!"
   }
   ```

2. **Submit leave request (no internId needed):**
   ```http
   POST /api/leave
   Authorization: Bearer {token}
   {
     "fromDate": "2024-12-25",
     "toDate": "2024-12-27",
     "leaveType": "ANNUAL"
   }
   ```

3. **Get my leave requests:**
   ```http
   GET /api/leave/my-leave
   Authorization: Bearer {token}
   ```

### Test as Admin/Supervisor

1. **Login as admin:**
   ```http
   POST /api/auth/login
   {
     "username": "admin@univen.ac.za",
     "password": "Admin123!"
   }
   ```

2. **Submit leave request for intern:**
   ```http
   POST /api/leave
   Authorization: Bearer {token}
   {
     "internId": 1,
     "fromDate": "2024-12-25",
     "toDate": "2024-12-27",
     "leaveType": "ANNUAL"
   }
   ```

## 📝 Notes

- Interns must have an intern profile created (automatically created during registration)
- The intern profile is linked to the user's email address
- Leave requests are automatically set to PENDING status
- All dates must be in `yyyy-MM-dd` format
- Valid leave types: ANNUAL, SICK, CASUAL, EMERGENCY, OTHER, UNPAID, STUDY

## ✅ What's Fixed

1. ✅ Interns can now submit leave requests without providing `internId`
2. ✅ Authentication and authorization properly implemented
3. ✅ Clear error messages for all failure scenarios
4. ✅ Interns can only view their own leave requests
5. ✅ Admins and supervisors can still manage all leave requests
6. ✅ New endpoint for interns to get their leave requests easily

## 🚀 Next Steps

1. **Restart the server** for changes to take effect
2. **Test the endpoints** with Postman or your frontend
3. **Update frontend** to:
   - Remove `internId` from leave request submission for interns
   - Use `/api/leave/my-leave` endpoint for interns to view their requests
   - Handle authentication errors properly
   - Display clear error messages to users

