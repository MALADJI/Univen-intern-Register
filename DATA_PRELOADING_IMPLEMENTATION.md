# Data Preloading Implementation Guide

## Overview
This implementation ensures all necessary data is loaded during login, so dashboards display data immediately without requiring refresh buttons or loading spinners.

## Architecture

### Components

1. **DataPreloadService** (`data-preload.service.ts`)
   - Fetches all role-specific data during login
   - Caches data for immediate dashboard access
   - Provides methods to get, set, and refresh cached data

2. **Updated AuthService**
   - Triggers data preloading after successful login
   - Clears cache on logout
   - Handles redirect after preload completes

3. **Updated Login Component**
   - Shows loading indicator during preload
   - Redirects automatically after preload

4. **Updated Dashboard Components**
   - Use cached data instead of fetching on init
   - Fallback to API if cache is empty
   - Optionally refresh in background

## Implementation Steps

### Step 1: Create DataPreloadService

Create `src/app/services/data-preload.service.ts` using the provided file:
- `frontend-files/data-preload.service.ts`

This service:
- Preloads data based on user role
- Caches data in memory
- Provides getter/setter methods

### Step 2: Update AuthService

Update `src/app/services/auth.service.ts`:

1. Import `DataPreloadService`:
```typescript
import { DataPreloadService } from './data-preload.service';
```

2. Inject in constructor:
```typescript
constructor(
  // ... existing params
  private dataPreloadService: DataPreloadService
) { }
```

3. Update `login()` method to preload data:
```typescript
login(username: string, password: string): Observable<LoginResponse> {
  return this.apiService.post<LoginResponse>('auth/login', { username, password }).pipe(
    tap(response => {
      if (response && response.token) {
        this.setToken(response.token);
        this.setCurrentUser(response.user);
        
        // Preload all data
        this.dataPreloadService.preloadAllData().subscribe({
          next: (success) => {
            this.redirectAfterLogin(response.user.role);
          },
          error: (err) => {
            // Still redirect even if preload fails
            this.redirectAfterLogin(response.user.role);
          }
        });
      }
    })
  );
}
```

4. Add `redirectAfterLogin()` helper method

5. Update `logout()` to clear cache:
```typescript
logout(): void {
  // ... existing code
  this.dataPreloadService.clearCache();
  this.router.navigate(['/login']);
}
```

### Step 3: Update Login Component

Update `src/app/auth/login/login.component.ts`:

The login component can be simplified since auth service handles preloading. See:
- `frontend-files/login.component-updates-with-preload.ts`

### Step 4: Update Dashboard Components

For each dashboard, update to use cached data:

#### Super Admin Dashboard
- Check cache for `admins` on init
- Use cached data if available
- Fallback to API if cache empty

#### Admin Dashboard
- Check cache for: `users`, `leaveRequests`, `interns`, `supervisors`, `departments`
- Load all from cache on init
- Optionally refresh in background

#### Supervisor Dashboard
- Check cache for: `interns`, `leaveRequests`
- Filter leave requests for supervisor's interns
- Use cached data if available

#### Intern Dashboard
- Check cache for: `leaveRequests`, `attendance`, `profile`
- Use cached data if available
- Fallback to API if needed

See `frontend-files/dashboard-data-loading-guide.md` for detailed examples.

## Data Preloaded by Role

### SUPER_ADMIN
- ✅ All admins

### ADMIN
- ✅ All users
- ✅ All leave requests
- ✅ All interns
- ✅ All supervisors
- ✅ All departments

### SUPERVISOR
- ✅ Assigned interns
- ✅ Leave requests for assigned interns

### INTERN
- ✅ Own leave requests
- ✅ Own attendance records
- ✅ Own profile

## API Endpoints Used

### Super Admin
- `GET /api/super-admin/admins`

### Admin
- `GET /api/admins/users`
- `GET /api/leave/all`
- `GET /api/interns`
- `GET /api/supervisors`
- `GET /api/departments`

### Supervisor
- `GET /api/supervisors/{id}/interns`
- `GET /api/leave/all` (filtered by intern IDs)

### Intern
- `GET /api/leave/my-leave` - Get intern's own leave requests
- `GET /api/interns` - Get all interns (to find current user's profile)
- `GET /api/attendance/intern/{internId}` - Get intern's attendance (requires internId)

## Testing

### Test Login Flow
1. Open browser DevTools (F12)
2. Go to Network tab
3. Login as any role
4. Verify all API calls complete before redirect
5. Check console for preload messages

### Test Dashboard Load
1. After login, navigate to dashboard
2. Verify data appears immediately (no loading spinner)
3. Check console for "Using preloaded data" messages
4. Verify no API calls on dashboard init (data from cache)

### Test Cache
1. Login and navigate to dashboard
2. Data should load from cache
3. Logout and login again
4. Data should be preloaded again

## Troubleshooting

### Data Not Loading
- Check console for preload errors
- Verify API endpoints are correct
- Check network tab for failed requests
- Ensure auth token is valid

### Cache Empty
- Preload might have failed silently
- Check console for errors
- Dashboard should fallback to API call

### Stale Data
- Cache is cleared on logout
- Use `refreshData()` to update specific data
- Or refresh entire cache by logging out and back in

## Benefits

✅ **Instant Dashboard Load** - No waiting for data
✅ **Better UX** - No loading spinners
✅ **Reduced API Calls** - Data cached after login
✅ **Faster Navigation** - Data already available
✅ **No Refresh Needed** - Everything loads on login

## Notes

- Cache is in-memory (cleared on page refresh)
- Preload happens once per login session
- Dashboard can still refresh data manually if needed
- Failed preloads don't block login (user still redirected)

