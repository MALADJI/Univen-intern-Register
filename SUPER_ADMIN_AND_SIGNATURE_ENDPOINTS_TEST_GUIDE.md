# Super Admin and Signature Features - Testable Endpoints Guide

## Overview
This guide provides complete, testable examples for all Super Admin and Signature feature endpoints. Use these examples to test the implementation using Postman, curl, or any HTTP client.

## Prerequisites

1. **Backend Running:** Ensure Spring Boot backend is running on `http://localhost:8082`
2. **Database Setup:** Run the migration SQL (see below)
3. **Super Admin Created:** Create a Super Admin user in the database

---

## Database Setup

### Step 1: Add Signature Column (If Not Already Exists)
**Note:** Hibernate may have already created this column automatically. Check first:

```sql
-- Check if column exists (run this first)
SHOW COLUMNS FROM users LIKE 'signature';

-- If column doesn't exist, run this:
ALTER TABLE users ADD COLUMN signature TEXT;

-- If you get "Duplicate column name" error, the column already exists - skip this step
```

### Step 2: Update Role ENUM (IMPORTANT - Run This First!)
**The role column is an ENUM type and needs to be updated to include SUPER_ADMIN:**

```sql
-- Update the role enum to include SUPER_ADMIN
ALTER TABLE users 
MODIFY COLUMN role ENUM('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'INTERN') NOT NULL;

-- Verify the update
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'role';
```

### Step 3: Create Super Admin User
```sql
-- Generate BCrypt hash for password "superadmin123"
-- You can use an online BCrypt generator or Spring's BCryptPasswordEncoder
-- Example hash for "superadmin123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO users (username, email, password, role, name, created_at)
VALUES ('superadmin@univen.ac.za', 'superadmin@univen.ac.za', 
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
        'SUPER_ADMIN', 'Super Admin', NOW());

INSERT INTO admins (name, email, created_at)
VALUES ('Super Admin', 'superadmin@univen.ac.za', NOW());
```

### Step 4: Verify Super Admin Created
```sql
SELECT * FROM users WHERE role = 'SUPER_ADMIN';
SELECT * FROM admins WHERE email = 'superadmin@univen.ac.za';
```

---

## Authentication Endpoints

### 1. Login as Super Admin
**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin@univen.ac.za",
    "password": "superadmin123"
  }'
```

**Expected Response:**
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

**Save the token** from the response - you'll need it for all subsequent requests.

---

## Super Admin Endpoints

### 2. Create New Admin
**Endpoint:** `POST /api/super-admin/admins`  
**Authorization:** Required (Super Admin only)

**Request:**
```bash
curl -X POST http://localhost:8082/api/super-admin/admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "name": "ICT Admin",
    "email": "ictadmin@univen.ac.za",
    "password": "ictadmin123",
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANS..."
  }'
```

**Without Signature (Optional):**
```bash
curl -X POST http://localhost:8082/api/super-admin/admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "name": "HR Admin",
    "email": "hradmin@univen.ac.za",
    "password": "hradmin123"
  }'
```

**Expected Response (201 Created):**
```json
{
  "message": "Admin created successfully",
  "adminId": 2,
  "userId": 15,
  "email": "ictadmin@univen.ac.za",
  "name": "ICT Admin"
}
```

**Error Response (409 Conflict - Email Already Exists):**
```json
{
  "error": "Email already exists",
  "message": "An admin with this email already exists"
}
```

**Error Response (403 Forbidden - Not Super Admin):**
```json
{
  "error": "Forbidden",
  "message": "Only Super Admin can create other admins"
}
```

---

### 3. Get All Admins
**Endpoint:** `GET /api/super-admin/admins`  
**Authorization:** Required (Super Admin only)

**Request:**
```bash
curl -X GET http://localhost:8082/api/super-admin/admins \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
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
  },
  {
    "adminId": 2,
    "userId": 15,
    "name": "ICT Admin",
    "email": "ictadmin@univen.ac.za",
    "createdAt": "2025-11-13T10:30:00",
    "hasSignature": true
  }
]
```

---

### 4. Update Admin Signature
**Endpoint:** `PUT /api/super-admin/admins/{adminId}/signature`  
**Authorization:** Required (Super Admin only)

**Request:**
```bash
curl -X PUT http://localhost:8082/api/super-admin/admins/2/signature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Signature updated successfully",
  "adminId": 2
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Admin not found"
}
```

---

## User Signature Endpoints

### 5. Update Own Signature
**Endpoint:** `PUT /api/users/me/signature`  
**Authorization:** Required (Any authenticated user)

**Request:**
```bash
curl -X PUT http://localhost:8082/api/users/me/signature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Signature updated successfully",
  "hasSignature": true
}
```

---

### 6. Get Own Signature
**Endpoint:** `GET /api/users/me/signature`  
**Authorization:** Required (Any authenticated user)

**Request:**
```bash
curl -X GET http://localhost:8082/api/users/me/signature \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "hasSignature": true,
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

**Response (No Signature):**
```json
{
  "hasSignature": false,
  "signature": ""
}
```

---

## Supervisor Management Endpoints (Admin & Super Admin)

### 7. Create Supervisor (as Admin)
**Endpoint:** `POST /api/supervisors`  
**Authorization:** Required (Admin or Super Admin)

**Request:**
```bash
curl -X POST http://localhost:8082/api/supervisors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "John Supervisor",
    "email": "john.supervisor@univen.ac.za",
    "departmentId": 1
  }'
```

**Expected Response (200 OK):**
```json
{
  "supervisorId": 5,
  "name": "John Supervisor",
  "email": "john.supervisor@univen.ac.za",
  "department": {
    "departmentId": 1,
    "name": "IT Department"
  },
  "createdAt": "2025-11-13T11:00:00"
}
```

**Error Response (403 Forbidden - Not Admin):**
```json
{
  "error": "Forbidden",
  "message": "Only Super Admin and Admin can create supervisors"
}
```

---

### 8. Update Supervisor (as Admin)
**Endpoint:** `PUT /api/supervisors/{id}`  
**Authorization:** Required (Admin or Super Admin)

**Request:**
```bash
curl -X PUT http://localhost:8082/api/supervisors/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "John Supervisor Updated",
    "email": "john.supervisor@univen.ac.za",
    "departmentId": 2
  }'
```

**Expected Response (200 OK):**
```json
{
  "supervisorId": 5,
  "name": "John Supervisor Updated",
  "email": "john.supervisor@univen.ac.za",
  "department": {
    "departmentId": 2,
    "name": "HR Department"
  }
}
```

---

### 9. Assign Interns to Supervisor (as Admin)
**Endpoint:** `POST /api/supervisors/{id}/assign-interns`  
**Authorization:** Required (Admin or Super Admin)

**Request (Assign all unassigned interns from department):**
```bash
curl -X POST http://localhost:8082/api/supervisors/5/assign-interns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{}'
```

**Request (Assign interns from specific field):**
```bash
curl -X POST http://localhost:8082/api/supervisors/5/assign-interns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "field": "Software Development"
  }'
```

**Expected Response (200 OK):**
```json
{
  "message": "Successfully assigned interns to supervisor",
  "assignedCount": 3
}
```

---

## Testing Scenarios

### Scenario 1: Complete Admin Creation Flow

1. **Login as Super Admin:**
   ```bash
   POST /api/auth/login
   Body: {
     "username": "superadmin@univen.ac.za",
     "password": "superadmin123"
   }
   ```
   **Save token:** `SUPER_ADMIN_TOKEN`

2. **Create ICT Admin:**
   ```bash
   POST /api/super-admin/admins
   Authorization: Bearer SUPER_ADMIN_TOKEN
   Body: {
     "name": "ICT Admin",
     "email": "ictadmin@univen.ac.za",
     "password": "ictadmin123"
   }
   ```

3. **Login as ICT Admin:**
   ```bash
   POST /api/auth/login
   Body: {
     "username": "ictadmin@univen.ac.za",
     "password": "ictadmin123"
   }
   ```
   **Save token:** `ICT_ADMIN_TOKEN`

4. **Create Supervisor (as ICT Admin):**
   ```bash
   POST /api/supervisors
   Authorization: Bearer ICT_ADMIN_TOKEN
   Body: {
     "name": "IT Supervisor",
     "email": "it.supervisor@univen.ac.za",
     "departmentId": 1
   }
   ```

5. **Verify ICT Admin Cannot Create Other Admins:**
   ```bash
   POST /api/super-admin/admins
   Authorization: Bearer ICT_ADMIN_TOKEN
   Body: {
     "name": "Another Admin",
     "email": "another@univen.ac.za",
     "password": "password123"
   }
   ```
   **Expected:** 403 Forbidden - "Only Super Admin can create other admins"

---

### Scenario 2: Signature Management Flow

1. **Update Super Admin Signature:**
   ```bash
   PUT /api/users/me/signature
   Authorization: Bearer SUPER_ADMIN_TOKEN
   Body: {
     "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
   }
   ```

2. **Get Super Admin Signature:**
   ```bash
   GET /api/users/me/signature
   Authorization: Bearer SUPER_ADMIN_TOKEN
   ```
   **Expected:** Returns signature data

3. **Update Admin Signature (as Super Admin):**
   ```bash
   PUT /api/super-admin/admins/2/signature
   Authorization: Bearer SUPER_ADMIN_TOKEN
   Body: {
     "signature": "data:image/png;base64,..."
   }
   ```

4. **Verify Admin Signature Status:**
   ```bash
   GET /api/super-admin/admins
   Authorization: Bearer SUPER_ADMIN_TOKEN
   ```
   **Expected:** Admin with `hasSignature: true`

---

## Postman Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "Super Admin & Signature Features",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Authentication",
      "item": [
        {
          "name": "Login as Super Admin",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"superadmin@univen.ac.za\",\n  \"password\": \"superadmin123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "2. Super Admin - Manage Admins",
      "item": [
        {
          "name": "Create Admin",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{superAdminToken}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"ICT Admin\",\n  \"email\": \"ictadmin@univen.ac.za\",\n  \"password\": \"ictadmin123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/super-admin/admins",
              "host": ["{{baseUrl}}"],
              "path": ["super-admin", "admins"]
            }
          }
        },
        {
          "name": "Get All Admins",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Authorization", "value": "Bearer {{superAdminToken}}"}
            ],
            "url": {
              "raw": "{{baseUrl}}/super-admin/admins",
              "host": ["{{baseUrl}}"],
              "path": ["super-admin", "admins"]
            }
          }
        },
        {
          "name": "Update Admin Signature",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{superAdminToken}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"signature\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/super-admin/admins/2/signature",
              "host": ["{{baseUrl}}"],
              "path": ["super-admin", "admins", "2", "signature"]
            }
          }
        }
      ]
    },
    {
      "name": "3. User Signature",
      "item": [
        {
          "name": "Update Own Signature",
          "request": {
            "method": "PUT",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"signature\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/users/me/signature",
              "host": ["{{baseUrl}}"],
              "path": ["users", "me", "signature"]
            }
          }
        },
        {
          "name": "Get Own Signature",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"}
            ],
            "url": {
              "raw": "{{baseUrl}}/users/me/signature",
              "host": ["{{baseUrl}}"],
              "path": ["users", "me", "signature"]
            }
          }
        }
      ]
    },
    {
      "name": "4. Supervisor Management (Admin)",
      "item": [
        {
          "name": "Create Supervisor",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{adminToken}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Supervisor\",\n  \"email\": \"john.supervisor@univen.ac.za\",\n  \"departmentId\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/supervisors",
              "host": ["{{baseUrl}}"],
              "path": ["supervisors"]
            }
          }
        },
        {
          "name": "Assign Interns to Supervisor",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json"},
              {"key": "Authorization", "value": "Bearer {{adminToken}}"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"field\": \"Software Development\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/supervisors/5/assign-interns",
              "host": ["{{baseUrl}}"],
              "path": ["supervisors", "5", "assign-interns"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8082/api",
      "type": "string"
    },
    {
      "key": "superAdminToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "adminToken",
      "value": "",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ]
}
```

---

## Quick Test Script (Bash)

Save this as `test-super-admin.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8082/api"

echo "=== Testing Super Admin & Signature Features ==="
echo ""

# 1. Login as Super Admin
echo "1. Logging in as Super Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin@univen.ac.za",
    "password": "superadmin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:50}..."
echo ""

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to login. Please check credentials."
  exit 1
fi

# 2. Get All Admins
echo "2. Getting all admins..."
curl -s -X GET "$BASE_URL/super-admin/admins" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 3. Create New Admin
echo "3. Creating new admin..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/super-admin/admins" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Admin",
    "email": "testadmin@univen.ac.za",
    "password": "testadmin123"
  }')
echo "$CREATE_RESPONSE" | jq '.'
echo ""

# 4. Update Own Signature
echo "4. Updating own signature..."
curl -s -X PUT "$BASE_URL/users/me/signature" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }' | jq '.'
echo ""

# 5. Get Own Signature
echo "5. Getting own signature..."
curl -s -X GET "$BASE_URL/users/me/signature" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

echo "=== Testing Complete ==="
```

**Make it executable:**
```bash
chmod +x test-super-admin.sh
./test-super-admin.sh
```

---

## Error Testing

### Test 1: Regular Admin Cannot Create Other Admins
```bash
# Login as regular admin first
POST /api/auth/login
Body: {"username": "ictadmin@univen.ac.za", "password": "ictadmin123"}
# Save token as ADMIN_TOKEN

# Try to create admin (should fail)
POST /api/super-admin/admins
Authorization: Bearer ADMIN_TOKEN
Body: {
  "name": "Another Admin",
  "email": "another@univen.ac.za",
  "password": "password123"
}
# Expected: 403 Forbidden
```

### Test 2: Duplicate Email Prevention
```bash
POST /api/super-admin/admins
Authorization: Bearer SUPER_ADMIN_TOKEN
Body: {
  "name": "Duplicate Admin",
  "email": "ictadmin@univen.ac.za",  # Already exists
  "password": "password123"
}
# Expected: 409 Conflict
```

### Test 3: Unauthenticated Access
```bash
GET /api/super-admin/admins
# No Authorization header
# Expected: 401 Unauthorized
```

---

## Expected HTTP Status Codes

| Endpoint | Method | Success | Error Cases |
|----------|--------|---------|-------------|
| `/api/super-admin/admins` | POST | 201 Created | 400 Bad Request, 403 Forbidden, 409 Conflict, 401 Unauthorized |
| `/api/super-admin/admins` | GET | 200 OK | 401 Unauthorized, 403 Forbidden |
| `/api/super-admin/admins/{id}/signature` | PUT | 200 OK | 401 Unauthorized, 403 Forbidden, 404 Not Found |
| `/api/users/me/signature` | PUT | 200 OK | 401 Unauthorized, 404 Not Found |
| `/api/users/me/signature` | GET | 200 OK | 401 Unauthorized |
| `/api/supervisors` | POST | 200 OK | 400 Bad Request, 401 Unauthorized, 403 Forbidden |

---

## Testing Checklist

- [ ] ✅ Database migration completed (signature column added)
- [ ] ✅ Super Admin user created in database
- [ ] ✅ Login as Super Admin works
- [ ] ✅ Create Admin endpoint works (with Super Admin token)
- [ ] ✅ Create Admin fails with regular Admin token (403)
- [ ] ✅ Get All Admins endpoint works
- [ ] ✅ Update Admin Signature endpoint works
- [ ] ✅ Update Own Signature endpoint works
- [ ] ✅ Get Own Signature endpoint works
- [ ] ✅ Create Supervisor works (as Admin)
- [ ] ✅ Duplicate email prevention works (409)
- [ ] ✅ Unauthenticated access blocked (401)
- [ ] ✅ Frontend Super Admin dashboard accessible
- [ ] ✅ Frontend redirects Super Admin to correct dashboard

---

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** 
- Check token is valid and not expired
- Ensure Authorization header format: `Bearer <token>`
- Verify token is from correct user role

### Issue: 403 Forbidden
**Solution:**
- Verify user has correct role (SUPER_ADMIN for admin management)
- Check role in database: `SELECT role FROM users WHERE email = 'your@email.com'`

### Issue: 409 Conflict (Email Already Exists)
**Solution:**
- Email is already registered
- Use a different email or check existing users

### Issue: 500 Internal Server Error
**Solution:**
- Check backend logs for detailed error
- Verify database connection
- Ensure all required fields are provided

---

## Notes

- All timestamps are in ISO 8601 format
- Signature data should be base64 encoded
- Tokens expire after 30 days (configurable)
- Password minimum length: 6 characters
- Email validation is performed on backend
- All endpoints require authentication except `/api/auth/**`

