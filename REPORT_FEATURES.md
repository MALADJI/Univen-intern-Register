# Report Features Documentation

## Overview
This document outlines all report generation features available in the Intern Register System, including role-based access control and validation.

---

## 1. Report Endpoints

### For Interns (Own Reports Only)

#### Attendance Reports
- **PDF**: `GET /api/reports/attendance/pdf`
  - Interns can only download their own attendance report
  - Automatically filters to current intern's data
  - No query parameters needed (auto-filtered)
  
- **Excel**: `GET /api/reports/attendance/excel`
  - Interns can only download their own attendance report
  - Automatically filters to current intern's data
  - No query parameters needed (auto-filtered)

#### Leave Request Reports
- **PDF**: `GET /api/reports/leave/pdf`
  - Interns can only download their own leave request history
  - Automatically filters to current intern's data
  - Optional query parameters:
    - `status` (PENDING, APPROVED, REJECTED) - filter by status
    - `internId` - ignored for interns (auto-set to current intern)
  
- **Excel**: `GET /api/reports/leave/excel`
  - Interns can only download their own leave request history
  - Automatically filters to current intern's data
  - Optional query parameters:
    - `status` (PENDING, APPROVED, REJECTED) - filter by status
    - `internId` - ignored for interns (auto-set to current intern)

### For Supervisors

#### Attendance Reports
- **PDF**: `GET /api/reports/attendance/pdf`
  - Supervisors can view all interns' attendance
  - Optional query parameters:
    - `internName` - filter by intern name
    - `department` - filter by department
    - `field` - filter by field
  
- **Excel**: `GET /api/reports/attendance/excel`
  - Supervisors can view all interns' attendance
  - Optional query parameters:
    - `internName` - filter by intern name
    - `department` - filter by department
    - `field` - filter by field

#### Leave Request Reports
- **PDF**: `GET /api/reports/leave/pdf`
  - Supervisors can view all leave requests
  - Optional query parameters:
    - `status` (PENDING, APPROVED, REJECTED) - filter by status
    - `internId` - filter by specific intern ID
  
- **Excel**: `GET /api/reports/leave/excel`
  - Supervisors can view all leave requests
  - Optional query parameters:
    - `status` (PENDING, APPROVED, REJECTED) - filter by status
    - `internId` - filter by specific intern ID

### For Admins

#### Attendance Reports
- **PDF**: `GET /api/reports/attendance/pdf`
  - Admins can view all interns' attendance
  - Optional query parameters:
    - `internName` - filter by intern name
    - `department` - filter by department
    - `field` - filter by field
  
- **Excel**: `GET /api/reports/attendance/excel`
  - Admins can view all interns' attendance
  - Optional query parameters:
    - `internName` - filter by intern name
    - `department` - filter by department
    - `field` - filter by field

#### Leave Request Reports
- **PDF**: `GET /api/reports/leave/pdf`
  - Admins can view all leave requests
  - Optional query parameters:
    - `status` (PENDING, APPROVED, REJECTED) - filter by status
    - `internId` - filter by specific intern ID
  
- **Excel**: `GET /api/reports/leave/excel`
  - Admins can view all leave requests
  - Optional query parameters:
    - `status` (PENDING, APPROVED, REJECTED) - filter by status
    - `internId` - filter by specific intern ID

---

## 2. Role-Based Access Control

### Authentication
- All report endpoints require authentication
- Valid JWT token must be provided in `Authorization` header
- Format: `Authorization: Bearer <token>`

### Authorization Rules
- **Interns**: Can only access their own reports
  - Attendance reports automatically filtered to their data
  - Leave request reports automatically filtered to their data
  - Cannot access other interns' data
  
- **Supervisors**: Can access all reports
  - Can view all interns' attendance
  - Can view all leave requests
  - Can filter by various criteria
  
- **Admins**: Can access all reports
  - Can view all interns' attendance
  - Can view all leave requests
  - Can filter by various criteria

### Access Control Implementation
- Checks current user's role from JWT token
- Interns: Automatically sets `internId` to current intern's ID
- Supervisors & Admins: Can use query parameters to filter data
- Returns `401 Unauthorized` if not authenticated
- Returns `403 Forbidden` if trying to access unauthorized data

---

## 3. Validation

### Input Validation
- **Status Filter**: Must be one of: PENDING, APPROVED, REJECTED
  - Case-insensitive
  - Invalid values are ignored (returns all statuses)
  
- **Intern ID Filter**: Must be a valid positive integer
  - Only used by Supervisors and Admins
  - Interns cannot override their own ID
  
- **Intern Name Filter**: String search (case-insensitive partial match)
  
- **Department Filter**: Exact match (case-sensitive)
  
- **Field Filter**: String search (case-insensitive partial match)

### Error Handling
- **401 Unauthorized**: Not authenticated
  - Response: `{"error": "Authentication required"}`
  
- **403 Forbidden**: Access denied
  - Response: `{"error": "Intern profile not found"}` or similar
  
- **404 Not Found**: Intern not found
  - Response: `{"error": "Intern not found"}`
  
- **500 Internal Server Error**: Server error
  - Response: `{"error": "Failed to generate report: <details>"}`

---

## 4. Report Content

### Attendance Reports
- **For Interns**: Personal attendance summary
  - Intern name
  - Email
  - Department
  - Present days
  - Absent days
  - On leave days
  - Attendance percentage
  
- **For Supervisors/Admins**: All interns' attendance
  - Intern name
  - Email
  - Department
  - Present days
  - Absent days
  - On leave days
  - Attendance percentage

### Leave Request Reports
- **For Interns**: Personal leave request history
  - Request ID
  - Leave type
  - Status
  - From date
  - To date
  
- **For Supervisors/Admins**: All leave requests
  - Request ID
  - Intern name
  - Intern email
  - Leave type
  - Status
  - From date
  - To date

---

## 5. Database Auto-Fix

### Enum Value Fix
- Automatically fixes invalid `leave_type` enum values before report generation
- Converts:
  - "Sick Leave" → "SICK"
  - "SICK_LEAVE" → "SICK"
  - "Annual Leave" → "ANNUAL"
- Prevents enum conversion errors during report generation
- Logs fixed values for debugging

---

## 6. Usage Examples

### Intern Downloading Own Attendance Report (PDF)
```http
GET /api/reports/attendance/pdf
Authorization: Bearer <intern_token>
```

### Supervisor Downloading All Leave Requests (Excel)
```http
GET /api/reports/leave/excel?status=PENDING
Authorization: Bearer <supervisor_token>
```

### Admin Downloading Specific Intern's Leave Requests (PDF)
```http
GET /api/reports/leave/pdf?internId=3&status=APPROVED
Authorization: Bearer <admin_token>
```

### Intern Downloading Own Leave History (Excel)
```http
GET /api/reports/leave/excel?status=APPROVED
Authorization: Bearer <intern_token>
```

---

## 7. Security Features

### Authentication
- JWT token-based authentication
- Token must be valid and not expired
- Token extracted from `Authorization` header

### Authorization
- Role-based access control (RBAC)
- Automatic data filtering for interns
- Explicit access checks for all roles

### Data Privacy
- Interns can only see their own data
- Supervisors and Admins can see all data
- No cross-user data leakage

---

## 8. Testing Guide

### Test Intern Reports
1. Login as intern
2. Get JWT token
3. Call report endpoints
4. Verify only own data is returned

### Test Supervisor Reports
1. Login as supervisor
2. Get JWT token
3. Call report endpoints with various filters
4. Verify all data is accessible

### Test Admin Reports
1. Login as admin
2. Get JWT token
3. Call report endpoints with various filters
4. Verify all data is accessible

### Test Access Control
1. Try accessing reports without token (should get 401)
2. Try accessing other intern's data as intern (should be auto-filtered)
3. Verify error messages are clear

---

## 9. Future Enhancements

### Possible Additions
- Date range filtering for reports
- Export to CSV format
- Email reports directly to users
- Scheduled report generation
- Report templates customization
- Charts and graphs in reports
- Multi-format export (PDF + Excel in one request)

---

## 10. Technical Implementation

### Services Used
- `AuthHelperService`: Authentication and role checking
- `DatabaseFixService`: Auto-fixing database enum values
- `LeaveRequestRepository`: Querying leave requests
- `AttendanceRepository`: Querying attendance records
- `InternRepository`: Querying intern data

### Libraries Used
- **iText PDF**: PDF generation
- **Apache POI**: Excel generation
- **Spring Security**: Authentication and authorization
- **JWT**: Token-based authentication

---

## 11. Troubleshooting

### Common Issues

#### 401 Unauthorized
- **Cause**: Missing or invalid JWT token
- **Solution**: Login again and get a new token

#### 403 Forbidden
- **Cause**: Trying to access unauthorized data
- **Solution**: Check role permissions and ensure correct token

#### 500 Internal Server Error
- **Cause**: Server error (check logs for details)
- **Solution**: Check server logs, verify database connection, check enum values

#### Empty Report
- **Cause**: No data matching filters
- **Solution**: Check filters, verify data exists in database

---

## 12. API Response Formats

### Success Response (PDF/Excel)
- **Content-Type**: `application/pdf` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Body**: Binary file content
- **Headers**: 
  - `Content-Disposition: attachment; filename="report.pdf"`

### Error Response (JSON)
- **Content-Type**: `application/json`
- **Body**: `{"error": "Error message"}`

---

## Summary

- ✅ Interns can download their own reports (attendance and leave history)
- ✅ Admins can download all reports (attendance and leave requests)
- ✅ Supervisors can download all reports (attendance and leave requests)
- ✅ Role-based access control implemented
- ✅ Input validation added
- ✅ Error handling improved
- ✅ Database auto-fix for enum values
- ✅ Clear error messages
- ✅ Security features implemented

