# Signature and Attendance Implementation Guide

## Overview
This document describes the implementation of signature persistence and early sign-out notifications in the Intern Register System.

## Features Implemented

### 1. Signature Persistence
- **Backend Storage**: Signatures are stored in the `users` table as base64-encoded images (TEXT column)
- **Frontend Loading**: On login, the saved signature is automatically loaded from the backend
- **Auto-Use**: Once saved, the signature is automatically used for all sign-in/sign-out operations
- **No Repeated Signing**: Users don't need to sign every time - the saved signature is reused

### 2. Early Sign-Out Detection
- **Normal Hours**: 08:00 AM to 16:45 PM (4:45 PM)
- **Early Sign-Out**: Any sign-out before 16:45 PM triggers a supervisor notification
- **Normal Sign-Out**: Sign-outs at or after 16:45 PM work normally without notifications

### 3. Supervisor Notifications
- **Email**: Supervisors receive email notifications when interns sign out early
- **Notification Content**: Includes intern name, sign-out time, and normal end time

## Backend Changes

### Database
- `users.signature` column (TEXT) - stores base64-encoded signature images
- `attendance.signature` column (TEXT) - stores signature for each attendance record

### API Endpoints

#### User Signature
- `GET /api/users/me/signature` - Get current user's saved signature
- `PUT /api/users/me/signature` - Update current user's signature

#### Attendance
- `POST /api/attendance/signin` - Sign in (now accepts `signature` parameter)
- `PUT /api/attendance/signout/{attendanceId}` - Sign out (now accepts `signature` parameter)

### Service Updates

#### AttendanceService
- `signIn()` - Now accepts and stores signature
- `signOut()` - Now accepts signature and detects early sign-out (before 16:45 PM)
- Automatically sends notification to supervisor if early sign-out detected

#### EmailService
- `sendEarlySignOutNotification()` - Sends email to supervisor about early sign-out

#### NotificationService
- `notifyEarlySignOut()` - Manages early sign-out notifications

## Frontend Changes

### API Service (`api.service.ts`)
- Added `getMySignature()` - Fetch saved signature from backend
- Added `updateMySignature(signature)` - Save signature to backend
- Updated `signIn()` - Now accepts signature, latitude, longitude parameters
- Updated `signOut()` - Now accepts signature, location, latitude, longitude parameters
- Added `getAttendanceByIntern(internId)` - Fetch attendance records from backend

### Intern Dashboard (`intern-dashboard.ts`)

#### New Methods
- `loadUserData()` - Loads user/intern data from backend
- `loadSavedSignature()` - Loads saved signature from backend on component init
- `loadAttendanceFromBackend()` - Loads attendance records from backend

#### Updated Methods
- `saveSignature()` - Now saves to backend via API
- `signIn()` - Now calls backend API with signature and geolocation
- `signOut()` - Now calls backend API, detects early sign-out, shows appropriate message

#### Key Features
- Signature is loaded automatically on component initialization
- If signature exists, user can sign in/out without opening signature pad
- Early sign-out detection with user-friendly messages
- Supervisor notification happens automatically in the background

## Usage Flow

### First Time Setup
1. User logs in
2. Navigates to Signature section
3. Opens signature pad
4. Draws signature
5. Clicks "Save"
6. Signature is saved to backend and persists

### Daily Sign-In/Out
1. User logs in (signature loads automatically)
2. Navigates to Signature section
3. Clicks "Sign In" (uses saved signature automatically)
4. At end of day, clicks "Sign Out"
   - If before 16:45 PM: Supervisor is notified automatically
   - If at/after 16:45 PM: Normal sign-out, no notification

### Updating Signature
1. User opens signature pad
2. Draws new signature
3. Clicks "Save"
4. New signature replaces old one in backend

## Configuration

### Normal Working Hours
Defined in `AttendanceService.java`:
```java
private static final LocalTime NORMAL_END_TIME = LocalTime.of(16, 45); // 4:45 PM
```

### Email Configuration
Ensure SMTP settings are configured in `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## Testing

### Test Signature Persistence
1. Save a signature
2. Log out and log back in
3. Verify signature is still there
4. Sign in without opening signature pad

### Test Early Sign-Out
1. Sign in normally
2. Sign out before 16:45 PM
3. Check supervisor's email for notification
4. Verify notification includes correct times

### Test Normal Sign-Out
1. Sign in normally
2. Sign out at or after 16:45 PM
3. Verify no notification is sent
4. Verify sign-out works normally

## Notes
- Signatures are stored as base64-encoded PNG images
- Signature persistence works across sessions
- Early sign-out notifications are sent automatically
- Normal sign-out (16:45 PM or later) works without notifications
- All attendance records include signature images

