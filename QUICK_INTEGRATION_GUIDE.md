# Quick Integration Guide - Data Preloading

## 🚀 Quick Start

### 1. Copy Files to Frontend

Copy these files to your Angular frontend project:

```
frontend-files/data-preload.service.ts
  → src/app/services/data-preload.service.ts
```

### 2. Update Auth Service

Update `src/app/services/auth.service.ts`:

**Add import:**
```typescript
import { DataPreloadService } from './data-preload.service';
```

**Add to constructor:**
```typescript
constructor(
  // ... existing params
  private dataPreloadService: DataPreloadService
) { }
```

**Update login() method:**
```typescript
login(username: string, password: string): Observable<LoginResponse> {
  return this.apiService.post<LoginResponse>('auth/login', { username, password }).pipe(
    tap(response => {
      if (response && response.token) {
        this.setToken(response.token);
        this.setCurrentUser(response.user);
        
        // Preload all data
        console.log('🔄 Preloading data...');
        this.dataPreloadService.preloadAllData().subscribe({
          next: () => {
            console.log('✅ Data preloaded');
            this.redirectAfterLogin(response.user.role);
          },
          error: (err) => {
            console.error('Preload error:', err);
            this.redirectAfterLogin(response.user.role);
          }
        });
      }
    })
  );
}

private redirectAfterLogin(role: string): void {
  switch (role) {
    case 'SUPER_ADMIN':
      this.router.navigate(['/super-admin/super-admin-dashboard']);
      break;
    case 'ADMIN':
      this.router.navigate(['/admin/admin-dashboard']);
      break;
    case 'SUPERVISOR':
      this.router.navigate(['/supervisor/supervisor-dashboard']);
      break;
    case 'INTERN':
      this.router.navigate(['/intern/intern-dashboard']);
      break;
    default:
      this.router.navigate(['/']);
  }
}
```

**Update logout() method:**
```typescript
logout(): void {
  // ... existing code
  this.dataPreloadService.clearCache();
  this.router.navigate(['/login']);
}
```

### 3. Update Dashboard Components

For each dashboard, update `ngOnInit()` to use cached data:

#### Super Admin Dashboard
```typescript
ngOnInit(): void {
  const cachedAdmins = this.dataPreloadService.getCachedData<Admin[]>('admins');
  if (cachedAdmins) {
    this.admins = cachedAdmins;
  } else {
    this.loadAdmins();
  }
}
```

#### Admin Dashboard
```typescript
ngOnInit(): void {
  // Load from cache
  this.users = this.dataPreloadService.getCachedData<any[]>('users') || [];
  this.leaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests') || [];
  this.interns = this.dataPreloadService.getCachedData<any[]>('interns') || [];
  this.supervisors = this.dataPreloadService.getCachedData<any[]>('supervisors') || [];
  this.departments = this.dataPreloadService.getCachedData<any[]>('departments') || [];
  
  // Optionally refresh in background
  this.refreshAllData();
}
```

#### Supervisor Dashboard
```typescript
ngOnInit(): void {
  const cachedInterns = this.dataPreloadService.getCachedData<any[]>('interns');
  const cachedLeaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests');
  
  if (cachedInterns) this.interns = cachedInterns;
  if (cachedLeaveRequests) this.leaveRequests = cachedLeaveRequests;
  
  if (!cachedInterns || !cachedLeaveRequests) {
    this.loadData();
  }
}
```

#### Intern Dashboard
```typescript
ngOnInit(): void {
  const cachedLeaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests');
  const cachedAttendance = this.dataPreloadService.getCachedData<any[]>('attendance');
  const cachedProfile = this.dataPreloadService.getCachedData<any>('profile');
  
  if (cachedLeaveRequests) this.leaveRequests = cachedLeaveRequests;
  if (cachedAttendance) this.attendance = cachedAttendance;
  if (cachedProfile) this.profile = cachedProfile;
  
  if (!cachedLeaveRequests || !cachedAttendance || !cachedProfile) {
    this.loadData();
  }
}
```

### 4. Add DataPreloadService to Module/Standalone

If using modules, add to `providers`:
```typescript
providers: [DataPreloadService]
```

If using standalone components, import in component:
```typescript
import { DataPreloadService } from '../services/data-preload.service';
```

## ✅ What This Does

1. **On Login:**
   - Fetches all role-specific data
   - Caches data in memory
   - Redirects to dashboard

2. **On Dashboard Load:**
   - Uses cached data immediately
   - No loading spinners
   - Instant display

3. **On Logout:**
   - Clears cache
   - Fresh data on next login

## 🧪 Test

1. Login as any role
2. Check browser console for preload messages
3. Navigate to dashboard
4. Data should appear immediately
5. Check Network tab - no API calls on dashboard init (data from cache)

## 📝 Notes

- Cache is in-memory (cleared on page refresh)
- Preload happens once per login
- Dashboard can still refresh manually if needed
- Failed preloads don't block login

