# Complete Endpoint Testing Guide

## 🧪 Test All New Endpoints

### Prerequisites
1. Backend running on `http://localhost:8082`
2. Super Admin user created in database
3. Postman or similar API testing tool

---

## 1️⃣ Authentication & Setup

### Step 1: Login as Super Admin
```http
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "superadmin@univen.ac.za",
  "password": "superadmin123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "superadmin@univen.ac.za",
    "email": "superadmin@univen.ac.za",
    "role": "SUPER_ADMIN",
    "name": "Super Admin"
  }
}
```

**Save the token** for subsequent requests.

---

## 2️⃣ Super Admin Endpoints

### Get All Admins
```http
GET http://localhost:8082/api/super-admin/admins
Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN
```

**Expected Response (200 OK):**
```json
[
  {
    "adminId": 1,
    "userId": 1,
    "name": "Super Admin",
    "email": "superadmin@univen.ac.za",
    "createdAt": "2025-11-13T10:00:00",
    "hasSignature": false
  }
]
```

### Create New Admin
```http
POST http://localhost:8082/api/super-admin/admins
Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "ICT Admin",
  "email": "ictadmin@univen.ac.za",
  "password": "password123",
  "signature": "optional_base64_signature_data"
}
```

**Expected Response (201 Created):**
```json
{
  "message": "Admin created successfully",
  "adminId": 2,
  "userId": 2,
  "email": "ictadmin@univen.ac.za",
  "name": "ICT Admin"
}
```

### Update Admin Signature
```http
PUT http://localhost:8082/api/super-admin/admins/2/signature
Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Signature updated successfully",
  "adminId": 2
}
```

---

## 3️⃣ User Signature Endpoints

### Get My Signature
```http
GET http://localhost:8082/api/users/me/signature
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200 OK):**
```json
{
  "hasSignature": true,
  "signature": "data:image/png;base64,iVBORw0KGgo..."
}
```

### Update My Signature
```http
PUT http://localhost:8082/api/users/me/signature
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Signature updated successfully",
  "hasSignature": true
}
```

---

## 4️⃣ Test Admin Can Create Supervisor

### Step 1: Login as Created Admin
```http
POST http://localhost:8082/api/auth/login
Content-Type: application/json

{
  "username": "ictadmin@univen.ac.za",
  "password": "password123"
}
```

### Step 2: Create Supervisor (as Admin)
```http
POST http://localhost:8082/api/supervisors
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "John Supervisor",
  "email": "supervisor@univen.ac.za",
  "departmentId": 1
}
```

**Expected Response (201 Created):**
```json
{
  "message": "Supervisor created successfully",
  "supervisorId": 1,
  "name": "John Supervisor",
  "email": "supervisor@univen.ac.za"
}
```

---

## 5️⃣ Error Testing

### Test Unauthorized Access (No Token)
```http
GET http://localhost:8082/api/super-admin/admins
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### Test Forbidden Access (Regular Admin trying to create admin)
```http
POST http://localhost:8082/api/super-admin/admins
Authorization: Bearer REGULAR_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Test Admin",
  "email": "test@univen.ac.za",
  "password": "password123"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "Forbidden",
  "message": "Only Super Admin can create other admins"
}
```

### Test Duplicate Email
```http
POST http://localhost:8082/api/super-admin/admins
Authorization: Bearer SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Duplicate Admin",
  "email": "superadmin@univen.ac.za",
  "password": "password123"
}
```

**Expected Response (409 Conflict):**
```json
{
  "error": "Email already exists",
  "message": "An admin with this email already exists"
}
```

---

## 6️⃣ Complete Test Flow

### Full Integration Test:

1. ✅ **Login as Super Admin**
2. ✅ **Get all admins** (should see Super Admin)
3. ✅ **Create new admin** (ICT Admin)
4. ✅ **Get all admins** (should see 2 admins)
5. ✅ **Update admin signature** (for ICT Admin)
6. ✅ **Login as ICT Admin**
7. ✅ **Get my signature** (should see signature)
8. ✅ **Update my signature** (as ICT Admin)
9. ✅ **Create supervisor** (as ICT Admin - should work)
10. ✅ **Login as Supervisor**
11. ✅ **Get my signature** (as Supervisor)

---

## 📊 Expected Results Summary

| Endpoint | Method | Auth Required | Role Required | Status |
|----------|--------|---------------|---------------|--------|
| `/api/super-admin/admins` | GET | ✅ | SUPER_ADMIN | ✅ |
| `/api/super-admin/admins` | POST | ✅ | SUPER_ADMIN | ✅ |
| `/api/super-admin/admins/{id}/signature` | PUT | ✅ | SUPER_ADMIN | ✅ |
| `/api/users/me/signature` | GET | ✅ | Any | ✅ |
| `/api/users/me/signature` | PUT | ✅ | Any | ✅ |
| `/api/supervisors` | POST | ✅ | ADMIN/SUPER_ADMIN | ✅ |

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
- **Check:** Token is valid and not expired
- **Check:** Authorization header format: `Bearer YOUR_TOKEN`
- **Check:** User exists in database

### Issue: 403 Forbidden
- **Check:** User has correct role in database
- **Check:** Role enum includes `SUPER_ADMIN`
- **Check:** Backend logs for role verification

### Issue: 409 Conflict (Email exists)
- **Check:** Email is unique in database
- **Solution:** Use different email or delete existing user

### Issue: 500 Internal Server Error
- **Check:** Backend logs for detailed error
- **Check:** Database connection
- **Check:** Required fields are provided

---

## ✅ Success Criteria

All tests pass when:
- ✅ Super Admin can login
- ✅ Super Admin can view all admins
- ✅ Super Admin can create new admins
- ✅ Super Admin can update admin signatures
- ✅ Users can get/update their own signatures
- ✅ Regular Admin can create supervisors
- ✅ Error handling works correctly
- ✅ Role-based access control works

---

**Ready to test!** Use Postman or your API client to test all endpoints.

