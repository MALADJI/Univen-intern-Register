# Quick Test Reference - Super Admin & Signature Features

## 🚀 Quick Start

### 1. Setup Database
**Note:** Signature column may already exist (created by Hibernate). If you get "Duplicate column" error, skip that step.

```sql
-- Step 1: Update Role ENUM (IMPORTANT - Must run first!)
ALTER TABLE users 
MODIFY COLUMN role ENUM('SUPER_ADMIN', 'ADMIN', 'SUPERVISOR', 'INTERN') NOT NULL;

-- Step 2: Create Super Admin User
INSERT INTO users (username, email, password, role, name, created_at)
VALUES ('superadmin@univen.ac.za', 'superadmin@univen.ac.za', 
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
        'SUPER_ADMIN', 'Super Admin', NOW());

-- Step 3: Create Admin Profile
INSERT INTO admins (name, email, created_at)
VALUES ('Super Admin', 'superadmin@univen.ac.za', NOW());
```

### 2. Get Super Admin Token
```bash
curl -X POST http://localhost:8082/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin@univen.ac.za","password":"superadmin123"}' \
  | jq -r '.token'
```

### 3. Test Endpoints

#### Create Admin
```bash
TOKEN="YOUR_SUPER_ADMIN_TOKEN"
curl -X POST http://localhost:8082/api/super-admin/admins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"ICT Admin","email":"ictadmin@univen.ac.za","password":"ictadmin123"}'
```

#### Get All Admins
```bash
curl -X GET http://localhost:8082/api/super-admin/admins \
  -H "Authorization: Bearer $TOKEN"
```

#### Update Signature
```bash
curl -X PUT http://localhost:8082/api/users/me/signature \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"signature":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```

---

## 📋 All Endpoints Summary

| Endpoint | Method | Auth | Role Required |
|----------|--------|------|---------------|
| `/api/auth/login` | POST | No | - |
| `/api/super-admin/admins` | POST | Yes | SUPER_ADMIN |
| `/api/super-admin/admins` | GET | Yes | SUPER_ADMIN |
| `/api/super-admin/admins/{id}/signature` | PUT | Yes | SUPER_ADMIN |
| `/api/users/me/signature` | PUT | Yes | Any |
| `/api/users/me/signature` | GET | Yes | Any |
| `/api/supervisors` | POST | Yes | ADMIN/SUPER_ADMIN |
| `/api/supervisors/{id}/assign-interns` | POST | Yes | ADMIN/SUPER_ADMIN |

---

## ✅ Test Checklist

- [ ] Backend running on port 8082
- [ ] Database migration completed
- [ ] Super Admin user created
- [ ] Login successful
- [ ] Create admin works
- [ ] Get admins works
- [ ] Update signature works
- [ ] Regular admin cannot create admins (403)
- [ ] Frontend dashboard accessible

---

See `SUPER_ADMIN_AND_SIGNATURE_ENDPOINTS_TEST_GUIDE.md` for detailed examples.

