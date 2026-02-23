# Super Admin and Signature Feature Implementation

## Overview
This document describes the implementation of two major features:
1. **Signature Field**: Added to User entity for storing signatures (TEXT/VARCHAR MAX)
2. **Super Admin Role**: New role hierarchy where Super Admin can assign/manage other Admins

## Changes Made

### 1. Database Schema Changes

#### User Entity (`src/main/java/com/internregister/entity/User.java`)
- ✅ Added `signature` field (TEXT type) to store signature data
- ✅ Added `SUPER_ADMIN` role to Role enum
- ✅ Role hierarchy: `SUPER_ADMIN` > `ADMIN` > `SUPERVISOR` > `INTERN`

**Database Migration Required:**
```sql
-- Add signature column to users table
ALTER TABLE users ADD COLUMN signature TEXT;

-- Update role enum if needed (MySQL will handle this automatically with @Enumerated)
-- Existing ADMIN users remain as ADMIN
-- New SUPER_ADMIN users can be created via API
```

### 2. New Controllers

#### SuperAdminController (`src/main/java/com/internregister/controller/SuperAdminController.java`)
**Endpoints:**
- `POST /api/super-admin/admins` - Create a new admin (Super Admin only)
- `GET /api/super-admin/admins` - Get all admins (Super Admin only)
- `PUT /api/super-admin/admins/{adminId}/signature` - Update admin signature (Super Admin only)

**Features:**
- Only SUPER_ADMIN role can create/manage other admins
- Validates email uniqueness
- Creates both User and Admin profile
- Supports signature assignment during admin creation

#### UserController (`src/main/java/com/internregister/controller/UserController.java`)
**Endpoints:**
- `PUT /api/users/me/signature` - Update own signature (any authenticated user)
- `GET /api/users/me/signature` - Get own signature (any authenticated user)

**Features:**
- Users can update their own signature
- Returns signature status and data

### 3. Updated Controllers

#### SupervisorController (`src/main/java/com/internregister/controller/SupervisorController.java`)
**Updated Endpoints:**
- `POST /api/supervisors` - Now allows both SUPER_ADMIN and ADMIN to create supervisors
- `PUT /api/supervisors/{id}` - Now allows both SUPER_ADMIN and ADMIN to update supervisors
- `POST /api/supervisors/{id}/assign-interns` - Now allows both SUPER_ADMIN and ADMIN to assign interns

**Authorization:**
- Previously: Only ADMIN
- Now: SUPER_ADMIN and ADMIN

#### AdminController (`src/main/java/com/internregister/controller/AdminController.java`)
**Updated:**
- `GET /api/admins/users` - Now includes SUPER_ADMIN in role checks

### 4. New DTOs

#### AdminRequest (`src/main/java/com/internregister/dto/AdminRequest.java`)
**Fields:**
- `name` (required) - Admin name
- `email` (required, validated) - Admin email
- `password` (required, min 6 chars) - Admin password
- `signature` (optional) - Signature data

## Role Hierarchy

```
SUPER_ADMIN
  ├── Can create/manage other Admins
  ├── Can create/manage Supervisors
  ├── Can create/manage Interns
  └── Can access all admin features

ADMIN (ICT Admin, etc.)
  ├── Can create/manage Supervisors
  ├── Can create/manage Interns
  └── Can access admin dashboard features

SUPERVISOR
  ├── Can view/manage assigned Interns
  └── Can approve/reject leave requests

INTERN
  └── Can submit leave requests and sign in/out
```

## API Usage Examples

### 1. Create Super Admin User (Manual Database Insert)
```sql
-- First, create a Super Admin user manually in database
INSERT INTO users (username, email, password, role, name, created_at)
VALUES ('superadmin@univen.ac.za', 'superadmin@univen.ac.za', 
        '$2a$10$encrypted_password_here', 'SUPER_ADMIN', 'Super Admin', NOW());

-- Then create Admin profile
INSERT INTO admins (name, email, created_at)
VALUES ('Super Admin', 'superadmin@univen.ac.za', NOW());
```

### 2. Create Admin (via API - Super Admin only)
```http
POST /api/super-admin/admins
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "name": "ICT Admin",
  "email": "ictadmin@univen.ac.za",
  "password": "securepassword123",
  "signature": "base64_encoded_signature_data_optional"
}
```

### 3. Create Supervisor (via API - Super Admin or Admin)
```http
POST /api/supervisors
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "John Supervisor",
  "email": "supervisor@univen.ac.za",
  "departmentId": 1
}
```

### 4. Update Own Signature
```http
PUT /api/users/me/signature
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "signature": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### 5. Get Own Signature
```http
GET /api/users/me/signature
Authorization: Bearer <user_token>
```

## Frontend Integration

### Signature Field
- Add signature capture/upload component
- Store signature as base64 string
- Display signature in user profile
- Use signature in documents/reports

### Super Admin Dashboard
- Add "Manage Admins" section (Super Admin only)
- Show list of all admins
- Allow creating new admins
- Allow updating admin signatures

### Admin Dashboard
- Add "Create Supervisor" button (Admin and Super Admin)
- Existing supervisor management features remain

## Security Considerations

1. **Role-Based Access Control:**
   - All endpoints check user role before allowing access
   - SUPER_ADMIN has highest privileges
   - Regular ADMIN cannot create other admins

2. **Signature Storage:**
   - Signatures stored as TEXT (supports large data)
   - Can store base64 encoded images
   - Consider file size limits in production

3. **Password Security:**
   - Passwords are encrypted using BCrypt
   - Minimum 6 characters required
   - Consider stronger requirements in production

## Testing Checklist

- [ ] Create Super Admin user in database
- [ ] Login as Super Admin
- [ ] Create Admin via `/api/super-admin/admins`
- [ ] Login as created Admin
- [ ] Create Supervisor via `/api/supervisors` (as Admin)
- [ ] Update signature via `/api/users/me/signature`
- [ ] Verify signature retrieval via `/api/users/me/signature`
- [ ] Test role-based access restrictions
- [ ] Verify Admin cannot create other Admins
- [ ] Verify Super Admin can manage all Admins

## Database Migration Steps

1. **Add signature column:**
   ```sql
   ALTER TABLE users ADD COLUMN signature TEXT;
   ```

2. **Create Super Admin user:**
   ```sql
   -- Use BCrypt to hash password first
   INSERT INTO users (username, email, password, role, name, created_at)
   VALUES ('superadmin@univen.ac.za', 'superadmin@univen.ac.za', 
           '$2a$10$YOUR_BCRYPT_HASHED_PASSWORD', 'SUPER_ADMIN', 'Super Admin', NOW());
   
   INSERT INTO admins (name, email, created_at)
   VALUES ('Super Admin', 'superadmin@univen.ac.za', NOW());
   ```

3. **Verify:**
   ```sql
   SELECT * FROM users WHERE role = 'SUPER_ADMIN';
   SELECT * FROM admins WHERE email = 'superadmin@univen.ac.za';
   ```

## Notes

- The signature field uses TEXT type which can store up to 65,535 bytes (MySQL)
- For larger signatures, consider using MEDIUMTEXT or LONGTEXT
- Signature data should be base64 encoded for easy storage/retrieval
- Super Admin role is checked using enum comparison: `User.Role.SUPER_ADMIN`
- All existing ADMIN users remain functional - no migration needed for them

