# Admin Deactivate/Activate Feature

## Overview
This feature allows Super Admins to deactivate (disable) or activate (re-enable) admin accounts instead of permanently deleting them. Deactivated admins cannot log in to the system.

## Changes Made

### Backend Changes

#### 1. Admin Entity (`src/main/java/com/internregister/entity/Admin.java`)
- Added `active` field: `private Boolean active = true;` (defaults to active)
- This field tracks whether the admin account is enabled or disabled

#### 2. SuperAdminController (`src/main/java/com/internregister/controller/SuperAdminController.java`)
- **Removed:** `DELETE /api/super-admin/admins/{adminId}` endpoint
- **Added:** `PUT /api/super-admin/admins/{adminId}/deactivate` - Deactivates an admin account
- **Added:** `PUT /api/super-admin/admins/{adminId}/activate` - Activates a deactivated admin account
- Updated `getAllAdmins()` to include `active` status in the response

#### 3. AuthController (`src/main/java/com/internregister/controller/AuthController.java`)
- Added login validation to check if ADMIN users have an active account
- If an admin account is deactivated, login is blocked with a 403 error and message: "Your account has been deactivated. Please contact the Super Admin for assistance."

### Frontend Changes

#### 1. SuperAdminService (`frontend-files/super-admin.service.ts`)
- **Removed:** `deleteAdmin()` method
- **Added:** `deactivateAdmin(adminId: number)` method
- **Added:** `activateAdmin(adminId: number)` method
- Updated `Admin` interface to include `active?: boolean` field

#### 2. SuperAdminDashboardComponent (`frontend-files/super-admin-dashboard.component.ts`)
- Added `deactivateAdmin(admin: Admin)` method with confirmation dialog
- Added `activateAdmin(admin: Admin)` method
- Updated `displayedColumns` to include `'active'` status column

#### 3. SuperAdminDashboardComponent HTML (`frontend-files/super-admin-dashboard.component.html`)
- Added "Status" column showing "Active" or "Inactive" with color coding
- Added activate/deactivate button in actions column:
  - Red "block" icon for active admins (to deactivate)
  - Green "check_circle" icon for inactive admins (to activate)

#### 4. SuperAdminDashboardComponent CSS (`frontend-files/super-admin-dashboard.component.css`)
- Added `.status-active` class (green color: #4caf50)
- Added `.status-inactive` class (red color: #f44336)

## API Endpoints

### Deactivate Admin
```
PUT /api/super-admin/admins/{adminId}/deactivate
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Response:**
```json
{
  "message": "Admin deactivated successfully",
  "adminId": 1,
  "active": false
}
```

### Activate Admin
```
PUT /api/super-admin/admins/{adminId}/activate
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Response:**
```json
{
  "message": "Admin activated successfully",
  "adminId": 1,
  "active": true
}
```

## Database Changes

The `admins` table now includes an `active` column:
- Type: `BOOLEAN` (or `TINYINT(1)` in MySQL)
- Default: `true` (active)
- Nullable: Yes (but defaults to true)

**Note:** If the column doesn't exist, Hibernate will create it automatically on next application startup. Alternatively, you can add it manually:

```sql
ALTER TABLE admins ADD COLUMN active BOOLEAN DEFAULT TRUE;
```

## Security

1. **Authorization:** Only `SUPER_ADMIN` role can activate/deactivate admins
2. **Login Protection:** Deactivated admins cannot log in (403 Forbidden)
3. **Rate Limiting:** Failed login attempts due to deactivation still count toward rate limiting

## User Experience

### Super Admin Dashboard
- Admins are displayed with their status (Active/Inactive)
- Status is color-coded (green for active, red for inactive)
- Action buttons allow quick activation/deactivation
- Confirmation dialog prevents accidental deactivation

### Deactivated Admin Login Attempt
- User receives clear error message: "Your account has been deactivated. Please contact the Super Admin for assistance."
- HTTP Status: 403 Forbidden
- Error type: "Account deactivated"

## Testing

### Test Deactivation
1. Login as Super Admin
2. Navigate to Super Admin Dashboard
3. Find an admin in the list
4. Click the red "block" icon to deactivate
5. Confirm the action
6. Verify status changes to "Inactive" (red)

### Test Login Block
1. Try to login as the deactivated admin
2. Should receive 403 error with deactivation message

### Test Reactivation
1. Login as Super Admin
2. Find the deactivated admin
3. Click the green "check_circle" icon to activate
4. Verify status changes to "Active" (green)
5. Try logging in as the reactivated admin - should succeed

## Migration Notes

- Existing admin records will have `active = true` by default (due to entity default)
- No data migration needed if using Hibernate auto-DDL
- If manually adding the column, set default value: `ALTER TABLE admins MODIFY COLUMN active BOOLEAN DEFAULT TRUE;`

