# Functional Requirements Document (FRD)

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to detail the functional requirements for the **Intern Register System**. It serves as a guide for developers, testers, and stakeholders to understand the system's capabilities, user interactions, and interface specifications.

### 1.2 Scope
The **Intern Register System** is a web-based application designed to manage intern attendance, leave requests, and supervisor oversight at the University of Venda (Univen). The system facilitates:
- **Interns**: Marking daily attendance with geolocation, requesting leave, and viewing their history.
- **Supervisors**: Managing assigned interns, approving/declining leave requests, and monitoring attendance.
- **Admins**: System-wide management of users (Supervisors, Interns), departments, and reporting.

### 1.3 Definitions of Actors
The system interacts with the following primary actors:

| Actor | Description |
| :--- | :--- |
| **Super Admin** | The highest-level administrator responsible for system configuration, managing other Admins, and overseeing department structures. |
| **Administrator** | Department-level manager responsible for overseeing Supervisors and Interns within their department, managing fields, and generating reports. |
| **Supervisor** | A staff member assigned to mentor and monitor specific interns. Responsible for approving leave requests and verifying attendance for their assignees. |
| **Intern** | A student or trainee using the system to record daily attendance, submit leave requests, and view their own history. |


---

## 2. External Interface Requirements

### 2.1 User Interfaces
The following interfaces are defined based on the underlying database schema and entity relationships.

#### 2.1.1 Login Page (Users Table)
| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Username | Text | `users.username` | Unique username for efficient lookup. |
| Email | Email | `users.email` | Unique email used for login. |
| Password | Password | `users.password` | Encrypted password string. |

#### 2.1.2 Super Admin Dashboard - Manage Admins
**Note:** Only Super Admins can create and manage Administrator accounts.

| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Name | Text | `admins.name` | Full name of the Administrator. |
| Email | Email | `admins.email`, `users.email` | Unique email (must be `@univen.ac.za`). |
| Password | Password | `users.password` | Secure password for the Admin account. |
| Department | Dropdown | `admins.department_id` | Optional. Assign Admin to a specific department. |
| Active | Toggle | `users.active` | Activate/Deactivate Admin account access. |

#### 2.1.3 Intern Registration (Sign Up)
**Note:** Public account creation is restricted to **Interns only**. Supervisors and Admins must be created by an Administrator.

| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| First Name | Text | `interns.name` (Split) | Intern's first name. |
| Last Name | Text | `interns.name` (Split) | Intern's last name. |
| Email | Email | `users.email`, `interns.email` | Must be a valid `@univen.ac.za` address. |
| Verification Code | Text | (Temporary) | Code sent to email to verify ownership. |
| Password | Password | `users.password` | Secure password for the new account. |
| Department | Dropdown | `interns.department_id` | Select the department for the internship. |
| Field | Text | `interns.field` | Field of study/specialization. |
| ID Number | Text | `interns.id_number` | National ID or Passport Number. |
| Start Date | Date Picker | `interns.start_date` | Internship start date. |
| End Date | Date Picker | `interns.end_date` | Internship end date. |
| Employer | Text | `interns.employer` | External employer name (if applicable). |

#### 2.1.4 Supervisor Management (Supervisors Table)
**Note:** Supervisors are created and managed by **Admins**.

| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Name | Text | `supervisors.name` | Full name of the supervisor. |
| Email | Email | `supervisors.email` | Unique email for contact and login. |
| Department | Dropdown | `supervisors.department_id` | Links to `departments` table. Select from active departments. |
| Field | Text | `supervisors.field` | Specific field of expertise or study. |

#### 2.1.5 Intern Management (Interns Table)
| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Name | Text | `interns.name` | Full name of the intern. |
| Email | Email | `interns.email` | Unique email for contact and login. |
| ID Number | Text | `interns.id_number` | National ID or Passport number. |
| Department | Dropdown | `interns.department_id` | Links to `departments` table. |
| Supervisor | Dropdown | `interns.supervisor_id` | Links to `supervisors` table. Filtered by selected Department. |
| Location | Dropdown/Map | `interns.location_id` | Links to `locations` table. Assigned work location. |
| Field | Text | `interns.field` | Field of study or work. |
| Employer | Text | `interns.employer` | Name of external employer (if applicable). |
| Start Date | Date Picker | `interns.start_date` | Internship start date. |
| End Date | Date Picker | `interns.end_date` | Internship end date. |

#### 2.1.6 Department Management (Departments Table)
| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Name | Text | `departments.name` | Unique name of the department. |
| Active | Checkbox | `departments.active` | Whether the department is currently active (Default: True). |

#### 2.1.7 Leave Request Form (LeaveRequests Table)
| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Leave Type | Dropdown | `leave_requests.leave_type` | Enum: `SICK`, `STUDY`, `FAMILY`, etc. |
| From Date | Date Picker | `leave_requests.from_date` | Start date of leave. |
| To Date | Date Picker | `leave_requests.to_date` | End date of leave. |
| Reason | Text Area | `leave_requests.reason` | Intern's justification for the request. |
| Attachment | File Upload | `leave_requests.attachment_path` | Optional supporting document (e.g., medical certificate). |
| Status | Label (ReadOnly) | `leave_requests.status` | Enum: `PENDING`, `APPROVED`, `DECLINED`. |

#### 2.1.8 Attendance Tracking (Attendance Table)
| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Date | Date (System) | `attendance.date` | Date of the attendance record. |
| Time In | Time (System) | `attendance.time_in` | Timestamp when user signed in. |
| Time Out | Time (System) | `attendance.time_out` | Timestamp when user signed out. |
| Location | Text (Auto) | `attendance.location` | Name of the location captured. |
| Coordinates | GPS (Hidden) | `attendance.latitude`, `attendance.longitude` | Geolocation data captured from device. |
| Status | Label (Auto) | `attendance.status` | Enum: `PRESENT`, `ABSENT`, `LATE`. |
| Signature | Canvas/Image | `attendance.signature` | Digital signature captured at sign-in/out. |

#### 2.1.9 Location Management (Locations Table)
| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Name | Text | `locations.name` | Name of the authorized location (e.g., "Main Campus"). |
| Coordinates | Map Pin | `locations.latitude`, `locations.longitude` | Central point of the location. |
| Radius | Number | `locations.radius` | Geofence radius in meters. |
| Active | Checkbox | `locations.active` | Whether location is active for tagging.

#### 2.1.10 Field Management (Fields Table)
| Field Name | Data Type (UI) | Database Mapping | Description |
|------------|----------------|------------------|-------------|
| Name | Text | `fields.name` | Name of the field of study (e.g., "Computer Science"). |
| Department | Dropdown | `fields.department_id` | Department this field belongs to. |
| Active | Checkbox | `fields.active` | Whether the field is currently offered. | |

### 2.2 Hardware Interfaces
- **Client Devices**: The system is designed to run on:
    - Desktop/Laptop computers (Admin/Supervisor/Intern).
    - Mobile devices (Smartphones/Tablets) - primarily for Interns to mark attendance.
- **Geolocation Sensors**: The application requires access to the device's GPS/Geolocation hardware to capture coordinates (Latitude, Longitude) when signing in/out.

### 2.3 Software Interfaces
- **Operating Systems**: Platform-independent (accessed via Web Browser).
- **Database**: **MySQL 8.0+** for data persistence.
- **Backend Framework**: **Spring Boot 3.5.7** (Java 17).
- **Frontend Framework**: **Angular 20**.
- **Browser Compatibility**: Chrome, Firefox, Edge, Safari (latest versions).

### 2.4 Communication Interfaces
- **HTTP/HTTPS**: The client communicates with the server via RESTful API endpoints over standard HTTP/HTTPS protocols.
- **JSON**: Data exchange format between client and server.
- **SMTP**: The system integrates with an SMTP server (e.g., Gmail SMTP) to send specific email notifications (e.g., Leave Request status updates).

---

## 3. Functional Requirements

### 3.1 Super Admin Role
The Super Admin has the highest level of access, primarily for system configuration and user management.

#### 3.1.1 Admin Management
- **FR-SADM-01**: Super Admin shall be able to view a list of all Admins.
- **FR-SADM-02**: Super Admin shall be able to create new Admin accounts.
- **FR-SADM-03**: Super Admin shall be able to update Admin details (Name, Email, Password, Department).
- **FR-SADM-04**: Super Admin shall be able to deactivate/delete Admin accounts.

#### 3.1.2 Department Management
- **FR-SADM-05**: Super Admin shall be able to create, update, and delete Departments.
- **FR-SADM-06**: Super Admin shall be able to view all departments and their status.

### 3.2 Administrator Role
The Admin has full control over the system's administrative functions within their purview.

#### 3.2.1 Supervisor Management
- **FR-ADM-01**: Admin shall be able to view a list of all Supervisors.
- **FR-ADM-02**: Admin shall be able to create a new Supervisor account (Name, Email, Department).
- **FR-ADM-03**: Admin shall be able to update Supervisor details.
- **FR-ADM-04**: Admin shall be able to delete a Supervisor (with safety checks for assigned interns).

#### 3.2.2 Intern Management
- **FR-ADM-05**: Admin shall be able to view a list of all Interns in their department.
- **FR-ADM-06**: Admin shall be able to register a new Intern (Name, Email, Department, Supervisor).
- **FR-ADM-07**: Admin shall be able to update Intern details, including **Assigning Sign-in Location**.
- **FR-ADM-08**: Admin shall be able to delete an Intern account.
- **FR-ADM-09**: Admin shall be able to search for interns by name or email.
- **FR-ADM-10**: Admin shall be able to view **Attendance History** of any intern in their department.

#### 3.2.3 Field Management
- **FR-ADM-13**: Admin shall be able to **Manage Fields** (create/edit/delete fields of study) associated with departments.

#### 3.2.4 Leave Management
- **FR-ADM-14**: Admin shall be able to view pending leave requests for their department.
- **FR-ADM-15**: Admin shall be able to **Approve or Reject** leave requests.

#### 3.2.5 Reporting
- **FR-ADM-16**: Admin shall be able to generate attendance and leave reports for interns in their department.

### 3.3 Supervisor Role
Supervisors manage the day-to-day activities of their assigned interns.

#### 3.3.1 Intern Management
- **FR-SUP-01**: Supervisor shall be able to view a list of interns assigned to them or within their field.
- **FR-SUP-02**: Supervisor shall be able to **Manage Interns** in their field (Update details).
- **FR-SUP-03**: Supervisor shall be able to **Assign Sign-in Locations** to their interns.
- **FR-SUP-04**: Supervisor shall be able to view the detailed **Attendance History** of their assigned interns.

#### 3.3.2 Field Management
- **FR-SUP-05**: Supervisor shall be able to **Manage Fields** (create/edit details) relevant to their department/expertise.

#### 3.3.3 Leave Management
- **FR-SUP-06**: Supervisor shall receive notifications of new leave requests.
- **FR-SUP-07**: Supervisor shall be able to view pending leave requests.
- **FR-SUP-08**: Supervisor shall be able to **Approve or Reject** leave requests, providing a reason for rejection.

#### 3.3.4 Reporting
- **FR-SUP-09**: Supervisor shall be able to **Generate Reports** (Attendance, Leave) for interns in their fields.

### 3.4 Intern Role
Interns are the primary users for attendance tracking.

#### 3.4.1 Attendance Tracking
- **FR-INT-01**: Intern shall be able to **Sign In** for the day, but **only at their assigned location**.
    - System must capture current timestamp.
    - System must capture GPS coordinates and **validate them against the assigned location's geofence**.
    - System must capture location name.
- **FR-INT-02**: Intern shall be able to **Sign Out** for the day.
    - Updates the daily record with sign-out time and location.
- **FR-INT-03**: System shall validate that an Intern cannot sign in twice without signing out (or vice versa, logic dependent).

#### 3.4.2 Leave Requests
- **FR-INT-04**: Intern shall be able to submit a Leave Request (Start Date, End Date, Reason, Type).
- **FR-INT-05**: Intern shall be able to view the status (Pending, Approved, Declined) of their requests.

#### 3.4.3 Profile, History & Reporting
- **FR-INT-06**: Intern shall be able to view their own attendance history.
- **FR-INT-07**: Intern shall be able to view their own profile details.
- **FR-INT-08**: Intern shall be able to **Generate Reports** of their own attendance history.

### 3.5 Common System Functions

#### 3.5.1 Authentication & Security
- **FR-SYS-01**: All users must log in with valid credentials (Email/Password).
- **FR-SYS-02**: System shall use JWT (JSON Web Tokens) for secure session management.
- **FR-SYS-03**: Passwords shall be stored utilizing secure hashing algorithms (e.g., BCrypt).
- **FR-SYS-04**: Access to API endpoints shall be restricted based on User Role (RBAC).

#### 3.5.2 Notifications
- **FR-SYS-05**: System shall send email notifications for critical actions (e.g., Leave status change).

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **NFR-PER-01**: **Response Time**: The system dashboard and main navigation pages shall load within **2 seconds** over a standard broadband connection (4G/Fiber).
- **NFR-PER-02**: **Transaction Processing**: Sign-in/Sign-out requests shall be processed and confirmed within **1 second** to prevent queuing during peak hours (8:00 AM - 9:00 AM).
- **NFR-PER-03**: **Database Optimization**: Queries for reports (attendance/leave) spanning up to 1 year of data shall execute and return results within **5 seconds**.

### 4.2 Reliability & Availability
- **NFR-REL-01**: **Availability**: The system shall be available **99.9%** of the time during core business hours (07:00 AM - 18:00 PM, Mon-Fri).
- **NFR-REL-02**: **Data Integrity**: The system shall ensure zero data loss during transaction processing. All attendance records must be persisted strictly to the database.
- **NFR-REL-03**: **Fault Tolerance**: The system shall gracefully handle temporary network failures on the client side (e.g., allow offline queuing of sign-in if network drops, pending sync).

### 4.3 Scalability
- **NFR-SCL-01**: **User Scalability**: The system architecture shall support scaling to accommodate up to **5,000 active interns** and **500 supervisors** without architectural changes.
- **NFR-SCL-02**: **Data Scalability**: The database design shall support the storage of at least **5 years** of historical attendance data without significant performance degradation.

### 4.4 Usability
- **NFR-USE-01**: **Learning Curve**: New interns shall be able to perform critical tasks (Sign In, Request Leave) with less than **10 minutes** of training or by following a simple 1-page guide.
- **NFR-USE-02**: **Mobile Responsiveness**: The Intern Dashboard shall be fully responsive and functional on mobile devices with screen widths as small as **320px**.
- **NFR-USE-03**: **Accessibility**: The user interface should comply with basic accessibility standards (e.g., WCAG 2.1 Level A) regarding contrast and keyboard navigation.

### 4.5 Security & Privacy
- **NFR-SEC-01**: **Data Encryption**: All sensitive user data (passwords, personal IDs) shall be encrypted at rest and in transit using industry-standard protocols (e.g., TLS 1.3, BCrypt for passwords).
- **NFR-SEC-02**: **Session Management**: User sessions shall automatically expire after **30 minutes** of inactivity to prevent unauthorized access.
- **NFR-SEC-03**: **Privacy Compliance**: The system shall only collect location data strictly at the moment of Sign-in/Sign-out and shall not track users continuously.

### 4.6 Maintainability
- **NFR-MNT-01**: **Code Documentation**: The codebase shall follow standard Java/Spring and TypeScript/Angular documentation practices (Javadocs, inline comments).
- **NFR-MNT-02**: **Modular Architecture**: The backend shall strictly follow a layered architecture (Controller, Service, Repository) to facilitate easy updates and testing.
