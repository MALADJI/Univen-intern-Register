# Dashboard Data Loading Guide

## Overview
All dashboards should use preloaded data from `DataPreloadService` instead of fetching on initialization. This ensures data is available immediately when the dashboard loads.

## How It Works

1. **Login Flow:**
   - User logs in
   - Auth service stores token and user
   - `DataPreloadService.preloadAllData()` is called
   - All role-specific data is fetched and cached
   - User is redirected to dashboard
   - Dashboard uses cached data immediately

2. **Data Cache:**
   - Data is stored in `DataPreloadService` cache
   - Available via `getCachedData(key)` method
   - Can be refreshed using `refreshData(key, request)`

## Implementation for Each Dashboard

### Super Admin Dashboard

```typescript
import { DataPreloadService } from '../services/data-preload.service';

export class SuperAdminDashboardComponent implements OnInit {
  admins: Admin[] = [];
  loading = false;

  constructor(
    private superAdminService: SuperAdminService,
    private dataPreloadService: DataPreloadService,
    // ... other services
  ) {}

  ngOnInit(): void {
    // Try to load from cache first
    const cachedAdmins = this.dataPreloadService.getCachedData<Admin[]>('admins');
    
    if (cachedAdmins && cachedAdmins.length > 0) {
      console.log('✅ Using preloaded admins data');
      this.admins = cachedAdmins;
    } else {
      // Fallback: fetch if cache is empty
      console.log('⚠️ No cached data, fetching admins...');
      this.loadAdmins();
    }
  }

  loadAdmins(): void {
    this.loading = true;
    this.superAdminService.getAllAdmins().subscribe({
      next: (admins) => {
        this.admins = admins;
        // Update cache
        this.dataPreloadService.setCachedData('admins', admins);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading admins:', error);
        this.loading = false;
      }
    });
  }

  // Refresh admins (updates cache)
  refreshAdmins(): void {
    this.dataPreloadService.refreshData(
      'admins',
      this.superAdminService.getAllAdmins()
    ).subscribe({
      next: (admins) => {
        this.admins = admins || [];
      }
    });
  }
}
```

### Admin Dashboard

```typescript
import { DataPreloadService } from '../services/data-preload.service';

export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  leaveRequests: any[] = [];
  interns: any[] = [];
  supervisors: any[] = [];
  departments: any[] = [];
  loading = false;

  constructor(
    private apiService: ApiService,
    private dataPreloadService: DataPreloadService,
    // ... other services
  ) {}

  ngOnInit(): void {
    // Load all data from cache
    this.loadFromCache();
    
    // Optionally refresh in background
    this.refreshAllData();
  }

  loadFromCache(): void {
    // Users
    const cachedUsers = this.dataPreloadService.getCachedData<any[]>('users');
    if (cachedUsers) {
      this.users = cachedUsers;
      console.log(`✅ Loaded ${cachedUsers.length} users from cache`);
    }

    // Leave Requests
    const cachedLeaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests');
    if (cachedLeaveRequests) {
      this.leaveRequests = cachedLeaveRequests;
      console.log(`✅ Loaded ${cachedLeaveRequests.length} leave requests from cache`);
    }

    // Interns
    const cachedInterns = this.dataPreloadService.getCachedData<any[]>('interns');
    if (cachedInterns) {
      this.interns = cachedInterns;
      console.log(`✅ Loaded ${cachedInterns.length} interns from cache`);
    }

    // Supervisors
    const cachedSupervisors = this.dataPreloadService.getCachedData<any[]>('supervisors');
    if (cachedSupervisors) {
      this.supervisors = cachedSupervisors;
      console.log(`✅ Loaded ${cachedSupervisors.length} supervisors from cache`);
    }

    // Departments
    const cachedDepartments = this.dataPreloadService.getCachedData<any[]>('departments');
    if (cachedDepartments) {
      this.departments = cachedDepartments;
      console.log(`✅ Loaded ${cachedDepartments.length} departments from cache`);
    }
  }

  refreshAllData(): void {
    this.loading = true;
    
    // Refresh all data in parallel
    forkJoin({
      users: this.dataPreloadService.refreshData('users', this.apiService.get('admins/users')),
      leaveRequests: this.dataPreloadService.refreshData('leaveRequests', this.apiService.get('leave/all')),
      interns: this.dataPreloadService.refreshData('interns', this.apiService.get('interns')),
      supervisors: this.dataPreloadService.refreshData('supervisors', this.apiService.get('supervisors')),
      departments: this.dataPreloadService.refreshData('departments', this.apiService.get('departments'))
    }).subscribe({
      next: (data) => {
        this.users = data.users?.users || [];
        this.leaveRequests = data.leaveRequests || [];
        this.interns = data.interns || [];
        this.supervisors = data.supervisors || [];
        this.departments = data.departments || [];
        this.loading = false;
        console.log('✅ All data refreshed');
      },
      error: (error) => {
        console.error('Error refreshing data:', error);
        this.loading = false;
      }
    });
  }
}
```

### Supervisor Dashboard

```typescript
import { DataPreloadService } from '../services/data-preload.service';

export class SupervisorDashboardComponent implements OnInit {
  interns: any[] = [];
  leaveRequests: any[] = [];
  loading = false;

  constructor(
    private apiService: ApiService,
    private dataPreloadService: DataPreloadService,
    private authService: AuthService,
    // ... other services
  ) {}

  ngOnInit(): void {
    // Load from cache
    const cachedInterns = this.dataPreloadService.getCachedData<any[]>('interns');
    const cachedLeaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests');

    if (cachedInterns) {
      this.interns = cachedInterns;
      console.log(`✅ Loaded ${cachedInterns.length} interns from cache`);
    }

    if (cachedLeaveRequests) {
      this.leaveRequests = cachedLeaveRequests;
      console.log(`✅ Loaded ${cachedLeaveRequests.length} leave requests from cache`);
    }

    // Refresh in background if needed
    if (!cachedInterns || !cachedLeaveRequests) {
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    const supervisorId = currentUser?.id;

    forkJoin({
      interns: this.apiService.get(`supervisors/${supervisorId}/interns`),
      leaveRequests: this.apiService.get('leave/all')
    }).subscribe({
      next: (data) => {
        this.interns = data.interns || [];
        // Filter leave requests for supervisor's interns
        const internIds = this.interns.map(i => i.internId || i.id);
        this.leaveRequests = (data.leaveRequests || []).filter((lr: any) => 
          internIds.includes(lr.internId || lr.intern?.internId)
        );
        
        // Update cache
        this.dataPreloadService.setCachedData('interns', this.interns);
        this.dataPreloadService.setCachedData('leaveRequests', this.leaveRequests);
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.loading = false;
      }
    });
  }
}
```

### Intern Dashboard

```typescript
import { DataPreloadService } from '../services/data-preload.service';

export class InternDashboardComponent implements OnInit {
  leaveRequests: any[] = [];
  attendance: any[] = [];
  profile: any = null;
  loading = false;

  constructor(
    private apiService: ApiService,
    private dataPreloadService: DataPreloadService,
    // ... other services
  ) {}

  ngOnInit(): void {
    // Load from cache
    const cachedLeaveRequests = this.dataPreloadService.getCachedData<any[]>('leaveRequests');
    const cachedAttendance = this.dataPreloadService.getCachedData<any[]>('attendance');
    const cachedProfile = this.dataPreloadService.getCachedData<any>('profile');

    if (cachedLeaveRequests) {
      this.leaveRequests = cachedLeaveRequests;
      console.log(`✅ Loaded ${cachedLeaveRequests.length} leave requests from cache`);
    }

    if (cachedAttendance) {
      this.attendance = cachedAttendance;
      console.log(`✅ Loaded ${cachedAttendance.length} attendance records from cache`);
    }

    if (cachedProfile) {
      this.profile = cachedProfile;
      console.log('✅ Loaded profile from cache');
    }

    // Refresh in background if needed
    if (!cachedLeaveRequests || !cachedAttendance || !cachedProfile) {
      this.loadData();
    }
  }

  loadData(): void {
    this.loading = true;

    // First get intern profile to get internId
    this.apiService.get('interns').subscribe({
      next: (interns: any[]) => {
        const currentUser = this.authService.getCurrentUser();
        const intern = interns.find((i: any) => 
          i.email?.toLowerCase() === (currentUser?.email || currentUser?.username)?.toLowerCase()
        );
        
        if (!intern) {
          console.warn('Intern profile not found');
          return;
        }

        const internId = intern.internId || intern.id;
        
        forkJoin({
          leaveRequests: this.apiService.get('leave/my-leave'),
          attendance: this.apiService.get(`attendance/intern/${internId}`),
          profile: of(intern)
        }).subscribe({
      next: (data) => {
        this.leaveRequests = data.leaveRequests || [];
        this.attendance = data.attendance || [];
        this.profile = data.profile;

        // Update cache
        this.dataPreloadService.setCachedData('leaveRequests', this.leaveRequests);
        this.dataPreloadService.setCachedData('attendance', this.attendance);
        this.dataPreloadService.setCachedData('profile', this.profile);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.loading = false;
      }
    });
  }
}
```

## Key Points

1. **Always check cache first** - Use `getCachedData()` before making API calls
2. **Fallback to API** - If cache is empty, fetch from API
3. **Update cache** - After fetching, update cache with `setCachedData()`
4. **Background refresh** - Optionally refresh data in background to keep it current
5. **Clear cache on logout** - Handled automatically by auth service

## Benefits

- ✅ No loading spinners on dashboard load
- ✅ Instant data display
- ✅ Better user experience
- ✅ Reduced API calls
- ✅ Faster page loads

