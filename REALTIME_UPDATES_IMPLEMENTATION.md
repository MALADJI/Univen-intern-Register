# Real-Time Updates Implementation Guide

## Overview
This guide explains how to implement real-time updates across all dashboards using WebSockets. When any user makes changes (create, update, delete), all connected users will see the changes instantly without refreshing.

## Architecture

### Backend (Spring Boot)
1. **WebSocketConfig** - Configures WebSocket endpoints
2. **WebSocketService** - Broadcasts events to all connected clients
3. **Controllers** - Emit events when data changes

### Frontend (Angular)
1. **WebSocketService** - Connects to WebSocket and subscribes to updates
2. **DataPreloadService** - Handles real-time cache updates
3. **Dashboard Components** - Subscribe to updates and refresh UI

## Implementation Steps

### Step 1: Install Frontend Dependencies

In your Angular project, install WebSocket dependencies:

```bash
npm install sockjs-client @types/sockjs-client
npm install @stomp/stompjs
```

### Step 2: Copy Frontend Files

Copy these files to your Angular project:

1. **`websocket.service.ts`** → `src/app/services/websocket.service.ts`
2. **Update `data-preload.service.ts`** with the real-time update handlers

### Step 3: Update Dashboard Components

For each dashboard component, add real-time update subscriptions:

#### Example: Supervisor Dashboard

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataPreloadService } from '../services/data-preload.service';
import { WebSocketService } from '../services/websocket.service';
import { Subscription } from 'rxjs';

export class SupervisorDashboardComponent implements OnInit, OnDestroy {
  leaveRequests: any[] = [];
  interns: any[] = [];
  private subscriptions = new Subscription();

  constructor(
    private dataPreloadService: DataPreloadService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Load initial data from cache
    this.leaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests') || [];
    this.interns = this.dataPreloadService.getCachedData<any[]>('interns') || [];

    // Subscribe to real-time leave request updates
    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('leaveRequests').subscribe(updatedRequests => {
        if (updatedRequests) {
          this.leaveRequests = updatedRequests;
          console.log('🔄 Leave requests updated in real-time');
        }
      })
    );

    // Subscribe to real-time intern updates
    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('interns').subscribe(updatedInterns => {
        if (updatedInterns) {
          this.interns = updatedInterns;
          console.log('🔄 Interns updated in real-time');
        }
      })
    );

    // Also subscribe directly to WebSocket for immediate updates
    this.subscriptions.add(
      this.webSocketService.leaveRequestUpdates$.subscribe(message => {
        console.log('📨 Real-time leave request event:', message);
        // Optionally show a notification to user
        this.showNotification('Leave request updated');
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private showNotification(message: string): void {
    // Implement your notification logic here
    console.log('🔔', message);
  }
}
```

#### Example: Admin Dashboard

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataPreloadService } from '../services/data-preload.service';
import { WebSocketService } from '../services/websocket.service';
import { Subscription } from 'rxjs';

export class AdminDashboardComponent implements OnInit, OnDestroy {
  users: any[] = [];
  leaveRequests: any[] = [];
  interns: any[] = [];
  supervisors: any[] = [];
  departments: any[] = [];
  private subscriptions = new Subscription();

  constructor(
    private dataPreloadService: DataPreloadService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Load initial data
    this.users = this.dataPreloadService.getCachedData<any[]>('users') || [];
    this.leaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests') || [];
    this.interns = this.dataPreloadService.getCachedData<any[]>('interns') || [];
    this.supervisors = this.dataPreloadService.getCachedData<any[]>('supervisors') || [];
    this.departments = this.dataPreloadService.getCachedData<any[]>('departments') || [];

    // Subscribe to all real-time updates
    this.subscribeToUpdates();
  }

  private subscribeToUpdates(): void {
    // Users
    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('users').subscribe(updated => {
        if (updated) this.users = updated;
      })
    );

    // Leave Requests
    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('leaveRequests').subscribe(updated => {
        if (updated) this.leaveRequests = updated;
      })
    );

    // Interns
    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('interns').subscribe(updated => {
        if (updated) this.interns = updated;
      })
    );

    // Supervisors
    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('supervisors').subscribe(updated => {
        if (updated) this.supervisors = updated;
      })
    );

    // Departments
    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('departments').subscribe(updated => {
        if (updated) this.departments = updated;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
```

#### Example: Intern Dashboard

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataPreloadService } from '../services/data-preload.service';
import { WebSocketService } from '../services/websocket.service';
import { Subscription } from 'rxjs';

export class InternDashboardComponent implements OnInit, OnDestroy {
  leaveRequests: any[] = [];
  attendance: any[] = [];
  private subscriptions = new Subscription();

  constructor(
    private dataPreloadService: DataPreloadService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Load initial data
    this.leaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests') || [];
    this.attendance = this.dataPreloadService.getCachedData<any[]>('attendance') || [];

    // Subscribe to real-time updates
    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('leaveRequests').subscribe(updated => {
        if (updated) {
          this.leaveRequests = updated;
          console.log('🔄 Leave requests updated');
        }
      })
    );

    this.subscriptions.add(
      this.dataPreloadService.getUpdateObservable('attendance').subscribe(updated => {
        if (updated) {
          this.attendance = updated;
          console.log('🔄 Attendance updated');
        }
      })
    );

    // Subscribe to leave request status changes
    this.subscriptions.add(
      this.webSocketService.leaveRequestUpdates$.subscribe(message => {
        if (message.type.includes('APPROVED') || message.type.includes('REJECTED')) {
          // Show notification when leave request is approved/rejected
          const status = message.type.includes('APPROVED') ? 'approved' : 'rejected';
          this.showNotification(`Your leave request has been ${status}`);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private showNotification(message: string): void {
    // Implement notification logic
    console.log('🔔', message);
  }
}
```

### Step 4: Update AuthService

Make sure WebSocket connects on login and disconnects on logout:

```typescript
import { WebSocketService } from './websocket.service';

export class AuthService {
  constructor(
    // ... existing services
    private webSocketService: WebSocketService
  ) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(response => {
          // ... existing login logic
          
          // Connect WebSocket after successful login
          this.webSocketService.connect();
        })
      );
  }

  logout(): void {
    // ... existing logout logic
    
    // Disconnect WebSocket
    this.webSocketService.disconnect();
  }
}
```

## Events Broadcasted

### Leave Requests
- `LEAVE_REQUEST_CREATED` - When a new leave request is submitted
- `LEAVE_REQUEST_APPROVED` - When a leave request is approved
- `LEAVE_REQUEST_REJECTED` - When a leave request is rejected

### Attendance
- `ATTENDANCE_SIGNED_IN` - When an intern signs in
- `ATTENDANCE_SIGNED_OUT` - When an intern signs out

### Admins
- `ADMIN_CREATED` - When a new admin is created
- `ADMIN_UPDATED` - When an admin is updated
- `ADMIN_DELETED` - When an admin is deleted

### Interns
- `INTERN_CREATED` - When a new intern is created
- `INTERN_UPDATED` - When an intern is updated
- `INTERN_DELETED` - When an intern is deleted

### Supervisors
- `SUPERVISOR_CREATED` - When a new supervisor is created
- `SUPERVISOR_UPDATED` - When a supervisor is updated

### Users
- `USER_CREATED` - When a new user is created
- `USER_UPDATED` - When a user is updated

### Departments
- `DEPARTMENT_CREATED` - When a new department is created
- `DEPARTMENT_UPDATED` - When a department is updated

## Testing

1. **Start Backend**: The backend should already be running with WebSocket support
2. **Start Frontend**: Make sure WebSocket service is imported and initialized
3. **Open Multiple Browsers**: 
   - Open dashboard in Browser 1 (e.g., Admin)
   - Open dashboard in Browser 2 (e.g., Supervisor)
   - Make a change in Browser 1
   - Verify Browser 2 updates automatically

## Troubleshooting

### WebSocket Not Connecting
- Check browser console for connection errors
- Verify backend is running on port 8082
- Check CORS settings in WebSocketConfig

### Updates Not Showing
- Verify WebSocket connection is established (check console logs)
- Check that dashboard components are subscribing to updates
- Verify DataPreloadService is handling updates correctly

### Performance Issues
- WebSocket connections are lightweight, but monitor for memory leaks
- Make sure to unsubscribe in `ngOnDestroy`
- Consider debouncing rapid updates if needed

## Benefits

✅ **Instant Updates** - No need to refresh pages
✅ **Better UX** - Users see changes immediately
✅ **Collaborative** - Multiple users can work simultaneously
✅ **Efficient** - Only changed data is transmitted
✅ **Scalable** - WebSocket handles many concurrent connections

## Next Steps

1. Add WebSocket events to other controllers (InternController, AdminController, etc.)
2. Add user-specific notifications (e.g., notify intern when leave is approved)
3. Add typing indicators or presence indicators if needed
4. Consider adding WebSocket authentication/authorization


