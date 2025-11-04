# Postman Testing Guide with Authentication

## 🔐 Authentication Setup

### Step 1: Login to Get Token

**First, login to get your JWT token:**

```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "admin@univen.ac.za",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB1bml2ZW4uYWMuemEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjE4MTk4MjYsImV4cCI6MTc2MTkwNjIyNn0...",
  "role": "ADMIN",
  "username": "admin@univen.ac.za",
  "email": "admin@univen.ac.za"
}
```

**⚠️ IMPORTANT:** Copy the `token` value from the response!

---

### Step 2: Use Token in Authorization Header

**For all protected endpoints, add this header:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkB1bml2ZW4uYWMuemEiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjE4MTk4MjYsImV4cCI6MTc2MTkwNjIyNn0...
```

---

## 🧪 Testing Admin Features

### 1. Create Department

```
POST http://localhost:8082/api/departments
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Marketing"
}
```

### 2. Get All Departments

```
GET http://localhost:8082/api/departments
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Get Department by ID

```
GET http://localhost:8082/api/departments/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Update Department

```
PUT http://localhost:8082/api/departments/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Updated Marketing"
}
```

### 5. Delete Department

```
DELETE http://localhost:8082/api/departments/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 👥 Testing Supervisor Management

### 1. Create Supervisor

```
POST http://localhost:8082/api/supervisors
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "John Supervisor",
  "email": "john.supervisor@univen.ac.za",
  "departmentId": 1
}
```

### 2. Get All Supervisors

```
GET http://localhost:8082/api/supervisors
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Get Supervisor by ID

```
GET http://localhost:8082/api/supervisors/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Update Supervisor

```
PUT http://localhost:8082/api/supervisors/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@univen.ac.za",
  "departmentId": 1
}
```

### 5. Delete Supervisor

```
DELETE http://localhost:8082/api/supervisors/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🎓 Testing Intern Management

### 1. Create Intern

```
POST http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Jane Intern",
  "email": "jane.intern@univen.ac.za",
  "departmentId": 1,
  "supervisorId": 1
}
```

### 2. Get All Interns

```
GET http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN_HERE
```

### 3. Get Intern by ID

```
GET http://localhost:8082/api/interns/1
Authorization: Bearer YOUR_TOKEN_HERE
```

### 4. Update Intern

```
PUT http://localhost:8082/api/interns/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Jane Updated",
  "email": "jane.updated@univen.ac.za",
  "departmentId": 1,
  "supervisorId": 1
}
```

### 5. Delete Intern

```
DELETE http://localhost:8082/api/interns/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📍 Testing Attendance with Geolocation

### 1. Sign In (with Geolocation)

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

**Response:** Returns `attendanceId` - use this for sign out

### 2. Sign Out (with Geolocation)

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

---

## 🔧 Postman Collection Setup

### Option 1: Use Collection Variables

1. **Import Collection:** Import `Postman_Collection.json`
2. **Set Variables:**
   - `baseUrl` = `http://localhost:8082/api`
   - `token` = (leave empty, will be set after login)
3. **Login First:**
   - Run "Login" request
   - Copy token from response
   - Set `token` variable in collection
4. **Use Variables:**
   - All requests use `{{baseUrl}}` and `{{token}}`

### Option 2: Manual Setup

1. **Login First:**
   ```
   POST http://localhost:8082/api/auth/login
   ```
   Copy token from response

2. **Add Authorization Header:**
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

3. **Test Endpoints:**
   - Use the token in Authorization header for all requests

---

## ❌ Common Errors & Solutions

### Error: 401 Unauthorized

**Cause:** Missing or invalid token

**Solution:**
1. Login again to get a new token
2. Check if token is in Authorization header
3. Format: `Authorization: Bearer YOUR_TOKEN`
4. Make sure there are no spaces or newlines in the token

### Error: 403 Forbidden

**Cause:** Token is valid but user doesn't have permission

**Solution:**
1. Check if you're logged in as ADMIN
2. Try logging in again
3. Verify token is not expired (tokens expire after 24 hours)
4. Check server console for authentication details

### Error: 400 Bad Request

**Cause:** Invalid request body or missing fields

**Solution:**
1. Check request body format (JSON)
2. Verify all required fields are present
3. Check data types match expected format

---

## ✅ Quick Test Sequence

1. **Login** → Get token
2. **Create Department** → Get department ID
3. **Create Supervisor** → Get supervisor ID
4. **Create Intern** → Get intern ID
5. **Sign In** → Get attendance ID
6. **Sign Out** → Complete attendance

---

## 📝 Notes

- **Token Validity:** Tokens expire after 24 hours
- **Token Format:** Must be `Bearer YOUR_TOKEN` (with space after Bearer)
- **CORS:** All endpoints support CORS
- **Content-Type:** Use `application/json` for POST/PUT requests

---

## 🔗 Quick Links

- **Base URL:** `http://localhost:8082/api`
- **Login:** `POST /api/auth/login`
- **Get Token:** Copy from login response
- **Use Token:** Add to Authorization header

