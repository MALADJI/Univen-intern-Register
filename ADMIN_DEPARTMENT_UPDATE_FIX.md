# Admin Department Update Fix

## Issue
Getting 404 error when trying to update admin department:
```
Failed to load resource: the server responded with a status of 404
Error updating admin department: Error: Resource not found.
```

## Root Cause
The backend endpoint `PUT /api/super-admin/admins/{adminId}/department` exists and works correctly, but the frontend `SuperAdminService` was missing the `updateAdminDepartment()` method.

## Fix Applied

### 1. Updated `SuperAdminService` (`frontend-files/super-admin.service.ts`)

**Added department fields to Admin interface:**
```typescript
export interface Admin {
  adminId: number;
  userId: number;
  name: string;
  email: string;
  createdAt: string;
  hasSignature: boolean;
  active?: boolean;
  departmentId?: number;      // ADDED
  departmentName?: string;    // ADDED
}
```

**Added updateAdminDepartment method:**
```typescript
/**
 * Update admin department (Super Admin only)
 * @param adminId The ID of the admin to update
 * @param departmentId The ID of the department to assign (null to remove department)
 */
updateAdminDepartment(adminId: number, departmentId: number | null): Observable<any> {
  return this.apiService.put(`${this.baseUrl}/admins/${adminId}/department`, {
    departmentId: departmentId
  });
}
```

## Backend Endpoint

The backend endpoint is already implemented and working:
- **Endpoint:** `PUT /api/super-admin/admins/{adminId}/department`
- **Controller:** `SuperAdminController.updateAdminDepartment()`
- **Authorization:** Only `SUPER_ADMIN` can update admin departments
- **Request Body:**
  ```json
  {
    "departmentId": 1  // or null to remove department
  }
  ```
- **Response:**
  ```json
  {
    "message": "Admin department updated successfully",
    "adminId": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "departmentId": 1,
    "departmentName": "Department Name"
  }
  ```

## Usage in Frontend

Now you can use the method in your dashboard component:

```typescript
// Update admin department
updateAdminDepartment(admin: Admin, departmentId: number | null): void {
  this.loading = true;
  this.superAdminService.updateAdminDepartment(admin.adminId, departmentId).subscribe({
    next: (response) => {
      this.snackBar.open('Admin department updated successfully', 'Close', { duration: 3000 });
      this.loadAdmins(); // Refresh the list
      this.loading = false;
    },
    error: (error) => {
      console.error('Error updating admin department:', error);
      const errorMessage = error.error?.message || 'Failed to update admin department';
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      this.loading = false;
    }
  });
}
```

## Testing

1. **Test with valid department ID:**
   ```typescript
   this.updateAdminDepartment(admin, 1); // Assign department ID 1
   ```

2. **Test removing department:**
   ```typescript
   this.updateAdminDepartment(admin, null); // Remove department
   ```

3. **Test with invalid admin ID:**
   - Should return 404 with "Admin not found"

4. **Test with invalid department ID:**
   - Should return 404 with "Department not found"

## Notes

- The endpoint accepts `null` for `departmentId` to remove a department assignment
- Only `SUPER_ADMIN` role can update admin departments
- The method returns the updated admin information including department details
- Department information is now included in the `Admin` interface for frontend use

