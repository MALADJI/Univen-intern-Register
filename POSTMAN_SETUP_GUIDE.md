# Postman Setup Guide - Super Admin & Signature Features

## 📋 Overview
This guide shows you exactly how to set up and test Super Admin features in Postman. Since Super Admin cannot be created through the sign-up page, you'll create it via SQL first, then test everything in Postman.

---

## 🔧 Step 1: Database Setup (MySQL Workbench / phpMyAdmin)

### Run These SQL Commands First:

```sql
-- 1. Update Role ENUM (MUST RUN FIRST!)
ALTER TABLE users 
MODIFY COLUMN role ENUM('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'INTERN') NOT NULL;

-- 2. Create Super Admin User
INSERT INTO users (username, email, password, role, name, created_at)
VALUES ('superadmin@univen.ac.za', 'superadmin@univen.ac.za', 
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
        'SUPER_ADMIN', 'Super Admin', NOW());

-- 3. Create Admin Profile
INSERT INTO admins (name, email, created_at)
VALUES ('Super Admin', 'superadmin@univen.ac.za', NOW());

-- 4. Verify it was created
SELECT * FROM users WHERE role = 'SUPER_ADMIN';
SELECT * FROM admins WHERE email = 'superadmin@univen.ac.za';
```

**Password:** `superadmin123` (already hashed in the SQL above)

> **⚠️ Getting 401 Error?** See `LOGIN_401_TROUBLESHOOTING.md` for detailed troubleshooting steps!

---

## 📬 Step 2: Import Postman Collection

### Option A: Import JSON Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **Raw text** tab
4. Copy and paste the JSON below
5. Click **Import**

### Option B: Create Collection Manually

Follow the steps below to create each request manually.

---

## 🚀 Step 3: Postman Collection JSON

Copy this entire JSON and import it into Postman:

```json
{
  "info": {
    "name": "Super Admin & Signature Features",
    "description": "Complete API collection for Super Admin and Signature features",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
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
    }
  ],
  "item": [
    {
      "name": "1. Authentication",
      "item": [
        {
          "name": "Login as Super Admin",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('superAdminToken', jsonData.token);",
                  "    console.log('Super Admin Token saved:', jsonData.token.substring(0, 50) + '...');",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"superadmin@univen.ac.za\",\n  \"password\": \"superadmin123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            },
            "description": "Login as Super Admin. Token will be automatically saved to collection variable."
          }
        },
        {
          "name": "Login as Regular Admin",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('adminToken', jsonData.token);",
                  "    console.log('Admin Token saved');",
                  "}"
                ],
                "type": "text/javascript"
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin@univen.ac.za\",\n  \"password\": \"admin123\"\n}"
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
          "name": "Create New Admin",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{superAdminToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"ICT Admin\",\n  \"email\": \"ictadmin@univen.ac.za\",\n  \"password\": \"ictadmin123\",\n  \"signature\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/super-admin/admins",
              "host": ["{{baseUrl}}"],
              "path": ["super-admin", "admins"]
            },
            "description": "Create a new admin. Only Super Admin can do this."
          }
        },
        {
          "name": "Get All Admins",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{superAdminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/super-admin/admins",
              "host": ["{{baseUrl}}"],
              "path": ["super-admin", "admins"]
            },
            "description": "Get list of all admins. Only Super Admin can access this."
          }
        },
        {
          "name": "Update Admin Signature",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{superAdminToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"signature\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/super-admin/admins/2/signature",
              "host": ["{{baseUrl}}"],
              "path": ["super-admin", "admins", "2", "signature"],
              "variable": [
                {
                  "key": "adminId",
                  "value": "2",
                  "description": "Admin ID to update signature for"
                }
              ]
            },
            "description": "Update signature for a specific admin. Change the adminId in the URL (currently 2)."
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
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{superAdminToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"signature\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/users/me/signature",
              "host": ["{{baseUrl}}"],
              "path": ["users", "me", "signature"]
            },
            "description": "Update your own signature. Works for any authenticated user."
          }
        },
        {
          "name": "Get Own Signature",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{superAdminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/users/me/signature",
              "host": ["{{baseUrl}}"],
              "path": ["users", "me", "signature"]
            },
            "description": "Get your own signature. Works for any authenticated user."
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
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Supervisor\",\n  \"email\": \"john.supervisor@univen.ac.za\",\n  \"departmentId\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/supervisors",
              "host": ["{{baseUrl}}"],
              "path": ["supervisors"]
            },
            "description": "Create a new supervisor. Admin or Super Admin can do this."
          }
        },
        {
          "name": "Assign Interns to Supervisor",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"field\": \"Software Development\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/supervisors/5/assign-interns",
              "host": ["{{baseUrl}}"],
              "path": ["supervisors", "5", "assign-interns"],
              "variable": [
                {
                  "key": "supervisorId",
                  "value": "5"
                }
              ]
            },
            "description": "Assign interns to a supervisor. Change supervisorId in URL (currently 5)."
          }
        }
      ]
    },
    {
      "name": "5. Error Testing",
      "item": [
        {
          "name": "Try Create Admin as Regular Admin (Should Fail)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Another Admin\",\n  \"email\": \"another@univen.ac.za\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/super-admin/admins",
              "host": ["{{baseUrl}}"],
              "path": ["super-admin", "admins"]
            },
            "description": "This should return 403 Forbidden - Regular Admin cannot create other admins."
          }
        },
        {
          "name": "Try Create Admin Without Token (Should Fail)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test Admin\",\n  \"email\": \"test@univen.ac.za\",\n  \"password\": \"test123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/super-admin/admins",
              "host": ["{{baseUrl}}"],
              "path": ["super-admin", "admins"]
            },
            "description": "This should return 401 Unauthorized - No token provided."
          }
        }
      ]
    }
  ]
}
```

---

## 📝 Step 4: Manual Setup in Postman (If Not Importing)

### Create Collection:

1. Click **New** → **Collection**
2. Name it: **"Super Admin & Signature Features"**

### Set Collection Variables:

1. Click on your collection
2. Go to **Variables** tab
3. Add these variables:
   - `baseUrl` = `http://localhost:8082/api`
   - `superAdminToken` = (leave empty - will be auto-filled after login)
   - `adminToken` = (leave empty - will be auto-filled after login)

---

## 🎯 Step 5: Create Requests

### Request 1: Login as Super Admin

1. Click **New** → **HTTP Request**
2. Name: **"Login as Super Admin"**
3. Method: **POST**
4. URL: `{{baseUrl}}/auth/login`
5. Headers:
   - `Content-Type: application/json`
6. Body (raw JSON):
   ```json
   {
     "username": "superadmin@univen.ac.za",
     "password": "superadmin123"
   }
   ```
7. **Tests Tab** (to auto-save token):
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.collectionVariables.set('superAdminToken', jsonData.token);
       console.log('Token saved:', jsonData.token.substring(0, 50) + '...');
   }
   ```
8. Click **Send**
9. Check **Variables** tab - `superAdminToken` should now be filled

---

### Request 2: Create Admin

1. Click **New** → **HTTP Request**
2. Name: **"Create New Admin"**
3. Method: **POST**
4. URL: `{{baseUrl}}/super-admin/admins`
5. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {{superAdminToken}}`
6. Body (raw JSON):
   ```json
   {
     "name": "ICT Admin",
     "email": "ictadmin@univen.ac.za",
     "password": "ictadmin123"
   }
   ```
7. Click **Send**
8. **Expected:** 201 Created with admin details

---

### Request 3: Get All Admins

1. Click **New** → **HTTP Request**
2. Name: **"Get All Admins"**
3. Method: **GET**
4. URL: `{{baseUrl}}/super-admin/admins`
5. Headers:
   - `Authorization: Bearer {{superAdminToken}}`
6. Click **Send**
7. **Expected:** 200 OK with array of admins

---

### Request 4: Update Own Signature

1. Click **New** → **HTTP Request**
2. Name: **"Update Own Signature"**
3. Method: **PUT**
4. URL: `{{baseUrl}}/users/me/signature`
5. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {{superAdminToken}}`
6. Body (raw JSON):
   ```json
   {
     "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
   }
   ```
7. Click **Send**
8. **Expected:** 200 OK

---

### Request 5: Get Own Signature

1. Click **New** → **HTTP Request**
2. Name: **"Get Own Signature"**
3. Method: **GET**
4. URL: `{{baseUrl}}/users/me/signature`
5. Headers:
   - `Authorization: Bearer {{superAdminToken}}`
6. Click **Send**
7. **Expected:** 200 OK with signature data

---

### Request 6: Create Supervisor (as Admin)

1. First, login as a regular admin (or use the admin token)
2. Click **New** → **HTTP Request**
3. Name: **"Create Supervisor"**
4. Method: **POST**
5. URL: `{{baseUrl}}/supervisors`
6. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer {{adminToken}}`
7. Body (raw JSON):
   ```json
   {
     "name": "John Supervisor",
     "email": "john.supervisor@univen.ac.za",
     "departmentId": 1
   }
   ```
8. Click **Send**
9. **Expected:** 200 OK with supervisor details

---

## 🔍 Testing Flow

### Complete Testing Sequence:

1. **Login as Super Admin**
   - Run "Login as Super Admin" request
   - Token automatically saved to `{{superAdminToken}}`

2. **Get All Admins**
   - Run "Get All Admins" request
   - Should see list of admins

3. **Create New Admin**
   - Run "Create New Admin" request
   - Change email if needed (must be unique)
   - Should get 201 Created

4. **Update Own Signature**
   - Run "Update Own Signature" request
   - Should get 200 OK

5. **Get Own Signature**
   - Run "Get Own Signature" request
   - Should see your signature data

6. **Test Error Cases**
   - Try "Try Create Admin as Regular Admin" (should get 403)
   - Try "Try Create Admin Without Token" (should get 401)

---

## 📸 Screenshots Guide

### How to Set Authorization Header:

1. Go to your request
2. Click **Authorization** tab
3. Select **Bearer Token** from dropdown
4. Paste token in the Token field: `{{superAdminToken}}`
   - Or manually type: `Bearer {{superAdminToken}}`

### Alternative: Set in Headers Tab:

1. Go to **Headers** tab
2. Add header:
   - Key: `Authorization`
   - Value: `Bearer {{superAdminToken}}`

---

## ⚠️ Common Issues

### Issue: "401 Unauthorized"
**Solution:**
- Make sure you ran "Login as Super Admin" first
- Check that `{{superAdminToken}}` variable is set
- Verify token format: `Bearer {{superAdminToken}}`

### Issue: "403 Forbidden"
**Solution:**
- Verify you're using Super Admin token (not regular admin)
- Check user role in database: `SELECT role FROM users WHERE email = 'your@email.com'`

### Issue: "409 Conflict"
**Solution:**
- Email already exists
- Use a different email address

### Issue: Token Not Saving
**Solution:**
- Make sure Tests script is added to login request
- Check Postman Console (View → Show Postman Console)
- Manually set variable: Collection → Variables → `superAdminToken`

---

## 🎓 Quick Reference

| What You Want | Postman Request | Token Needed |
|---------------|----------------|--------------|
| Create Admin | POST `/super-admin/admins` | Super Admin |
| View All Admins | GET `/super-admin/admins` | Super Admin |
| Update Admin Signature | PUT `/super-admin/admins/{id}/signature` | Super Admin |
| Update My Signature | PUT `/users/me/signature` | Any User |
| Get My Signature | GET `/users/me/signature` | Any User |
| Create Supervisor | POST `/supervisors` | Admin or Super Admin |

---

## ✅ Success Checklist

- [ ] Super Admin created in database (via SQL)
- [ ] Postman collection imported/created
- [ ] Login as Super Admin works
- [ ] Token saved to collection variable
- [ ] Create Admin endpoint works
- [ ] Get All Admins endpoint works
- [ ] Update Signature endpoint works
- [ ] Error cases tested (403, 401)

---

**Need Help?** Check the console logs in Postman (View → Show Postman Console) for detailed error messages.

