# Postman Quick Test Guide

## 🔗 Quick Access Links

### Import Postman Collection
1. **Download the collection**: `Postman_Collection.json` from this repository
2. **Open Postman** → Click **Import** → Select the JSON file
3. **Set Variables**:
   - `baseUrl` = `http://localhost:8082/api`
   - `token` = (will be auto-filled after login)

### Direct Postman Collection Link
If you want to share this collection, you can:
1. Export the collection from Postman
2. Upload to Postman Cloud
3. Share the public link

---

## 🚀 Quick Test Sequence

### Step 1: Login (Get Token)
```
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "admin@univen.ac.za",
  "password": "admin123"
}
```

**Response:** Copy the `token` from response

---

### Step 2: Test New Admin Features

#### Create Department
```
POST http://localhost:8082/api/departments
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Marketing"
}
```

#### Get All Departments
```
GET http://localhost:8082/api/departments
Authorization: Bearer YOUR_TOKEN
```

#### Update Department
```
PUT http://localhost:8082/api/departments/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Marketing"
}
```

#### Create Supervisor
```
POST http://localhost:8082/api/supervisors
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Supervisor",
  "email": "john.supervisor@univen.ac.za",
  "departmentId": 1
}
```

#### Update Supervisor
```
PUT http://localhost:8082/api/supervisors/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@univen.ac.za",
  "departmentId": 1
}
```

#### Create Intern
```
POST http://localhost:8082/api/interns
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Jane Intern",
  "email": "jane.intern@univen.ac.za",
  "departmentId": 1,
  "supervisorId": 1
}
```

#### Update Intern
```
PUT http://localhost:8082/api/interns/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Jane Updated",
  "email": "jane.updated@univen.ac.za",
  "departmentId": 1,
  "supervisorId": 1
}
```

---

### Step 3: Test Attendance with Geolocation

#### Sign In (with Geolocation)
```
POST http://localhost:8082/api/attendance/signin
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "internId": 1,
  "location": "Main Building, Room 101",
  "latitude": -22.9756,
  "longitude": 30.4475
}
```

**Response:** Returns attendance record with `attendanceId` - use this for sign out

#### Sign Out (with Geolocation)
```
PUT http://localhost:8082/api/attendance/signout/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "location": "Main Building, Exit",
  "latitude": -22.9756,
  "longitude": 30.4475
}
```

**Note:** Request body is optional for sign out. If provided, location and coordinates will be updated.

---

## 📋 Complete Endpoint List

### Departments
- `GET /api/departments` - Get all
- `GET /api/departments/{id}` - Get by ID
- `POST /api/departments` - Create
- `PUT /api/departments/{id}` - Update
- `DELETE /api/departments/{id}` - Delete

### Supervisors
- `GET /api/supervisors` - Get all
- `GET /api/supervisors/{id}` - Get by ID
- `POST /api/supervisors` - Create
- `PUT /api/supervisors/{id}` - Update
- `DELETE /api/supervisors/{id}` - Delete

### Interns
- `GET /api/interns` - Get all
- `GET /api/interns/{id}` - Get by ID
- `GET /api/interns/search` - Search
- `POST /api/interns` - Create
- `PUT /api/interns/{id}` - Update
- `DELETE /api/interns/{id}` - Delete

### Attendance
- `GET /api/attendance` - Get all
- `GET /api/attendance/intern/{internId}` - Get by intern
- `POST /api/attendance/signin` - Sign in (with geolocation)
- `PUT /api/attendance/signout/{id}` - Sign out (with geolocation)

---

## 🧪 Test Scenarios

### Test 1: Full CRUD for Department
1. Create department → Get ID from response
2. Get department by ID
3. Update department
4. Delete department (if no interns/supervisors)

### Test 2: Full CRUD for Supervisor
1. Create supervisor → Get ID from response
2. Get supervisor by ID
3. Update supervisor
4. Delete supervisor

### Test 3: Full CRUD for Intern
1. Create intern → Get ID from response
2. Get intern by ID
3. Update intern
4. Delete intern

### Test 4: Attendance with Geolocation
1. Sign in with geolocation → Get `attendanceId`
2. Get attendance by intern ID
3. Sign out with geolocation using `attendanceId`
4. Verify coordinates are saved

---

## 📝 Example Geolocation Coordinates

**University of Venda (Thohoyandou):**
- Latitude: `-22.9756`
- Longitude: `30.4475`

**Test Coordinates:**
- Main Building: `-22.9756, 30.4475`
- Library: `-22.9760, 30.4480`
- Admin Block: `-22.9750, 30.4470`

---

## 🔧 Troubleshooting

### 401 Unauthorized
- Check if token is valid
- Token expires after 24 hours
- Login again to get new token

### 400 Bad Request
- Check request body format
- Verify required fields are present
- Check for duplicate emails/names

### 404 Not Found
- Verify ID exists in database
- Check if resource was deleted

### 500 Internal Server Error
- Check server logs
- Verify database connection
- Check if all required fields are provided

---

## 📖 Complete Documentation

See `POSTMAN_TEST_LINKS.md` for complete API documentation with all endpoints.

