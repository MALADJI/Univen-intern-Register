# Intern Register System - API Documentation

## Base URL
```
http://localhost:8082/api
```

## Authentication
All endpoints (except `/api/auth/**`) require JWT Bearer token authentication.

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Authentication Endpoints

### 1. Send Verification Code
**POST** `/api/auth/send-verification-code`

Sends a 6-digit verification code to the specified email address. Code is valid for 10 minutes.

**Request Body:**
```json
{
  "email": "user@univen.ac.za"
}
```

**Response (200 OK):**
```json
{
  "message": "Verification code sent to user@univen.ac.za",
  "code": "123456"  // Only for testing - remove in production
}
```

---

### 2. Verify Code
**POST** `/api/auth/verify-code`

Verifies the email verification code.

**Request Body:**
```json
{
  "email": "user@univen.ac.za",
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "message": "Code verified successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "valid": false,
  "error": "Invalid verification code"
}
```

---

### 3. Register User
**POST** `/api/auth/register`

Registers a new user (ADMIN, SUPERVISOR, or INTERN). Automatically creates corresponding profile.

**Request Body:**
```json
{
  "username": "user@univen.ac.za",
  "password": "SecurePassword123!",
  "role": "INTERN",  // ADMIN, SUPERVISOR, or INTERN
  "verificationCode": "123456",
  "name": "John",
  "surname": "Doe",
  "department": "ICT"  // Optional, defaults to "ICT"
}
```

**Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "userId": "1",
  "role": "INTERN"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Username already exists"
}
```

**Notes:**
- For INTERN role: Automatically creates Intern profile with department and supervisor assignment
- For SUPERVISOR role: Automatically creates Supervisor profile with department
- For ADMIN role: Automatically creates Admin profile

---

### 4. Login
**POST** `/api/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "username": "user@univen.ac.za",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "INTERN",
  "username": "user@univen.ac.za",
  "email": "user@univen.ac.za"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Username and password are required"
}
```

---

### 5. Get Current User
**GET** `/api/auth/me`

Returns information about the currently authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "user@univen.ac.za",
  "email": "user@univen.ac.za",
  "role": "INTERN"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Not authenticated"
}
```

---

## Intern Endpoints

### 1. Get All Interns
**GET** `/api/interns`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "internId": 1,
    "name": "John Doe",
    "email": "john@univen.ac.za",
    "department": {
      "departmentId": 1,
      "name": "ICT"
    },
    "supervisor": {
      "supervisorId": 1,
      "name": "Supervisor Name",
      "email": "supervisor@univen.ac.za"
    },
    "createdAt": "2024-11-01T10:00:00",
    "updatedAt": "2024-11-01T10:00:00"
  }
]
```

---

### 2. Search Interns (Paginated)
**GET** `/api/interns/search?name={name}&page={page}&size={size}`

**Query Parameters:**
- `name` (optional): Filter by intern name (partial match)
- `page` (default: 0): Page number (0-indexed)
- `size` (default: 10): Page size

**Example:**
```
GET /api/interns/search?name=John&page=0&size=10
```

**Response (200 OK):**
```json
{
  "content": [...],
  "totalElements": 50,
  "totalPages": 5,
  "number": 0,
  "size": 10
}
```

---

### 3. Get Intern by ID
**GET** `/api/interns/{id}`

**Response (200 OK):**
```json
{
  "internId": 1,
  "name": "John Doe",
  "email": "john@univen.ac.za",
  ...
}
```

---

### 4. Create Intern
**POST** `/api/interns`

**Request Body:**
```json
{
  "name": "New Intern",
  "email": "newintern@univen.ac.za",
  "departmentId": 1,
  "supervisorId": 1
}
```

---

### 5. Update Intern
**PUT** `/api/interns/{id}`

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@univen.ac.za",
  "departmentId": 1,
  "supervisorId": 1
}
```

---

### 6. Delete Intern
**DELETE** `/api/interns/{id}`

---

## Attendance Endpoints

### 1. Get All Attendance Records
**GET** `/api/attendance`

**Response (200 OK):**
```json
[
  {
    "attendanceId": 1,
    "intern": {...},
    "date": "2024-11-01T08:00:00",
    "status": "SIGNED_IN",
    "timeIn": "2024-11-01T08:00:00",
    "timeOut": null,
    "location": "Main Building"
  }
]
```

---

### 2. Get Attendance by Intern ID
**GET** `/api/attendance/intern/{internId}`

---

### 3. Sign In
**POST** `/api/attendance/signin`

**Request Body:**
```json
{
  "internId": 1,
  "location": "Main Building"
}
```

---

### 4. Sign Out
**PUT** `/api/attendance/signout/{attendanceId}`

---

## Leave Request Endpoints

### 1. Get All Leave Requests
**GET** `/api/leave`

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED)

**Example:**
```
GET /api/leave?status=PENDING
```

---

### 2. Get Leave Requests by Intern ID
**GET** `/api/leave/intern/{internId}`

---

### 3. Search Leave Requests (Paginated)
**GET** `/api/leave/search?status={status}&internId={id}&page={page}&size={size}`

---

### 4. Submit Leave Request
**POST** `/api/leave`

**Request Body:**
```json
{
  "internId": 1,
  "fromDate": "2024-12-01",
  "toDate": "2024-12-05",
  "reason": "Personal leave",
  "leaveType": "ANNUAL"  // ANNUAL, SICK, CASUAL, etc.
}
```

---

### 5. Upload Leave Attachment
**POST** `/api/leave/{id}/attachment`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: The file to upload

---

### 6. Download Leave Attachment
**GET** `/api/leave/attachment/{filename}`

**Response:** File download

---

### 7. Approve Leave Request
**PUT** `/api/leave/approve/{id}`

**Response (200 OK):**
```json
{
  "requestId": 1,
  "status": "APPROVED",
  ...
}
```

---

### 8. Reject Leave Request
**PUT** `/api/leave/reject/{id}`

**Response (200 OK):**
```json
{
  "requestId": 1,
  "status": "REJECTED",
  ...
}
```

---

## Report Endpoints

### 1. Generate Attendance Report - PDF
**GET** `/api/reports/attendance/pdf`

**Query Parameters:**
- `internName` (optional): Filter by intern name
- `department` (optional): Filter by department name
- `field` (optional): Filter by field

**Example:**
```
GET /api/reports/attendance/pdf?internName=John&department=ICT
```

**Response:** PDF file download

---

### 2. Generate Attendance Report - Excel
**GET** `/api/reports/attendance/excel`

**Query Parameters:** Same as PDF endpoint

**Response:** Excel (.xlsx) file download

---

## Department Endpoints

### 1. Get All Departments
**GET** `/api/departments`

---

### 2. Create Department
**POST** `/api/departments`

**Request Body:**
```json
{
  "name": "New Department"
}
```

---

### 3. Delete Department
**DELETE** `/api/departments/{id}`

---

## Supervisor Endpoints

### 1. Get All Supervisors
**GET** `/api/supervisors`

---

### 2. Get Supervisor by ID
**GET** `/api/supervisors/{id}`

---

### 3. Create Supervisor
**POST** `/api/supervisors`

**Request Body:**
```json
{
  "name": "Supervisor Name",
  "email": "supervisor@univen.ac.za",
  "departmentId": 1
}
```

---

### 4. Delete Supervisor
**DELETE** `/api/supervisors/{id}`

---

## Admin Endpoints

### 1. Get All Admins
**GET** `/api/admins`

---

### 2. Get Admin by ID
**GET** `/api/admins/{id}`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials" | "Not authenticated"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Swagger UI

Access interactive API documentation at:
```
http://localhost:8082/swagger-ui/index.html
```

OpenAPI JSON specification:
```
http://localhost:8082/v3/api-docs
```

---

## Testing

Use the provided `test-backend-endpoints.http` file for testing endpoints with REST Client extension in VS Code, or import into Postman/Insomnia.

### Quick Test Flow:

1. **Register a user:**
   ```
   POST /api/auth/send-verification-code
   POST /api/auth/register
   ```

2. **Login:**
   ```
   POST /api/auth/login
   (Save the token from response)
   ```

3. **Access protected endpoints:**
   ```
   GET /api/interns
   (Include: Authorization: Bearer <token>)
   ```

---

## Security Notes

- All passwords are hashed using BCrypt
- JWT tokens are valid for 24 hours
- Email verification codes expire after 10 minutes
- All protected endpoints require valid JWT token
- CORS is enabled for frontend communication

---

## Additional Information

For backend support or questions, refer to:
- Swagger UI: `http://localhost:8082/swagger-ui/index.html`
- Test file: `test-backend-endpoints.http`
- Backend logs: Check console output for detailed logging

