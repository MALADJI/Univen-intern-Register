# Department Deactivate/Activate Feature

## Issue
Getting 404 error when trying to deactivate a department:
```
Failed to load resource: the server responded with a status of 404
Error deactivating department: Error: Resource not found.
```

## Root Cause
The frontend was trying to call a deactivate endpoint for departments that didn't exist. The Department entity didn't have an `active` field, and there were no deactivate/activate endpoints.

## Solution

### Backend Changes

#### 1. Department Entity (`src/main/java/com/internregister/entity/Department.java`)
- Added `active` field: `private Boolean active = true;` (defaults to active)
- This field tracks whether the department is enabled or disabled

#### 2. DepartmentController (`src/main/java/com/internregister/controller/DepartmentController.java`)
- **Added:** `PUT /api/departments/{id}/deactivate` - Deactivates a department
- **Added:** `PUT /api/departments/{id}/activate` - Activates a deactivated department

#### 3. DepartmentService (`src/main/java/com/internregister/service/DepartmentService.java`)
- **Added:** `deactivateDepartment(Long id)` method
- **Added:** `activateDepartment(Long id)` method

### Frontend Changes

#### 1. Created DepartmentService (`frontend-files/department.service.ts`)
- New service file with methods for department management
- Includes `deactivateDepartment()` and `activateDepartment()` methods
- Also includes CRUD operations for departments

## API Endpoints

### Deactivate Department
```
PUT /api/departments/{id}/deactivate
```

**Response:**
```json
{
  "message": "Department deactivated successfully",
  "departmentId": 1,
  "active": false
}
```

### Activate Department
```
PUT /api/departments/{id}/activate
```

**Response:**
```json
{
  "message": "Department activated successfully",
  "departmentId": 1,
  "active": true
}
```

## Usage in Frontend

### Import the Service
```typescript
import { DepartmentService } from '../services/department.service';

constructor(
  private departmentService: DepartmentService
) {}
```

### Deactivate Department
```typescript
deactivateDepartment(department: Department): void {
  if (confirm(`Are you sure you want to deactivate ${department.name}?`)) {
    this.loading = true;
    this.departmentService.deactivateDepartment(department.departmentId).subscribe({
      next: () => {
        this.snackBar.open('Department deactivated successfully', 'Close', { duration: 3000 });
        this.loadDepartments(); // Refresh the list
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deactivating department:', error);
        const errorMessage = error.error?.message || 'Failed to deactivate department';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }
}
```

### Activate Department
```typescript
activateDepartment(department: Department): void {
  this.loading = true;
  this.departmentService.activateDepartment(department.departmentId).subscribe({
    next: () => {
      this.snackBar.open('Department activated successfully', 'Close', { duration: 3000 });
      this.loadDepartments(); // Refresh the list
      this.loading = false;
    },
    error: (error) => {
      console.error('Error activating department:', error);
      const errorMessage = error.error?.message || 'Failed to activate department';
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      this.loading = false;
    }
  });
}
```

## Database Changes

The `departments` table now includes an `active` column:
- Type: `BOOLEAN` (or `TINYINT(1)` in MySQL)
- Default: `true` (active)
- Nullable: Yes (but defaults to true)

**Note:** If the column doesn't exist, Hibernate will create it automatically on next application startup. Alternatively, you can add it manually:

```sql
ALTER TABLE departments ADD COLUMN active BOOLEAN DEFAULT TRUE;
```

## Benefits

- ✅ Departments can be disabled without losing historical data
- ✅ Deactivated departments won't appear in dropdowns for new assignments
- ✅ Can be reactivated later if needed
- ✅ Better than permanent deletion which requires reassigning all interns/supervisors

## Notes

- Deactivated departments still exist in the database
- Historical data (interns, supervisors, attendance) remains linked to deactivated departments
- New assignments should filter out inactive departments
- The `DELETE` endpoint still exists for permanent deletion (requires no interns/supervisors)

