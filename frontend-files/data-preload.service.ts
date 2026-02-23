import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, Subject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { WebSocketService, WebSocketMessage } from './websocket.service';

/**
 * Service to preload all necessary data during login
 * This ensures dashboards have all data ready immediately
 */
@Injectable({
  providedIn: 'root'
})
export class DataPreloadService {
  private preloadCache: Map<string, any> = new Map();
  private updateSubject = new Subject<{ key: string; data: any }>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private webSocketService: WebSocketService
  ) {
    // Subscribe to WebSocket updates and refresh cache
    this.setupWebSocketListeners();
  }

  /**
   * Setup WebSocket listeners for real-time updates
   */
  private setupWebSocketListeners(): void {
    // Leave Request Updates
    this.webSocketService.leaveRequestUpdates$.subscribe((message: WebSocketMessage) => {
      console.log('🔄 Real-time leave request update received:', message);
      this.handleLeaveRequestUpdate(message);
    });

    // Admin Updates
    this.webSocketService.adminUpdates$.subscribe((message: WebSocketMessage) => {
      console.log('🔄 Real-time admin update received:', message);
      this.handleAdminUpdate(message);
    });

    // Intern Updates
    this.webSocketService.internUpdates$.subscribe((message: WebSocketMessage) => {
      console.log('🔄 Real-time intern update received:', message);
      this.handleInternUpdate(message);
    });

    // Supervisor Updates
    this.webSocketService.supervisorUpdates$.subscribe((message: WebSocketMessage) => {
      console.log('🔄 Real-time supervisor update received:', message);
      this.handleSupervisorUpdate(message);
    });

    // Attendance Updates
    this.webSocketService.attendanceUpdates$.subscribe((message: WebSocketMessage) => {
      console.log('🔄 Real-time attendance update received:', message);
      this.handleAttendanceUpdate(message);
    });

    // User Updates
    this.webSocketService.userUpdates$.subscribe((message: WebSocketMessage) => {
      console.log('🔄 Real-time user update received:', message);
      this.handleUserUpdate(message);
    });

    // Department Updates
    this.webSocketService.departmentUpdates$.subscribe((message: WebSocketMessage) => {
      console.log('🔄 Real-time department update received:', message);
      this.handleDepartmentUpdate(message);
    });
  }

  /**
   * Handle leave request updates
   */
  private handleLeaveRequestUpdate(message: WebSocketMessage): void {
    const cachedRequests = this.getCachedData<any[]>('leaveRequests') || [];
    const eventType = message.type;
    const data = message.data;

    if (eventType.includes('CREATED')) {
      // Add new leave request
      cachedRequests.push(data);
      this.setCachedData('leaveRequests', cachedRequests);
      this.updateSubject.next({ key: 'leaveRequests', data: cachedRequests });
    } else if (eventType.includes('APPROVED') || eventType.includes('REJECTED')) {
      // Update existing leave request
      const index = cachedRequests.findIndex((lr: any) => 
        (lr.requestId || lr.id) === (data.requestId || data.id)
      );
      if (index !== -1) {
        cachedRequests[index] = { ...cachedRequests[index], ...data };
        this.setCachedData('leaveRequests', cachedRequests);
        this.updateSubject.next({ key: 'leaveRequests', data: cachedRequests });
      } else {
        // If not in cache, refresh from server
        this.refreshLeaveRequests();
      }
    }
  }

  /**
   * Handle admin updates
   */
  private handleAdminUpdate(message: WebSocketMessage): void {
    const cachedAdmins = this.getCachedData<any[]>('admins') || [];
    const eventType = message.type;
    const data = message.data;

    if (eventType.includes('CREATED')) {
      cachedAdmins.push(data);
      this.setCachedData('admins', cachedAdmins);
      this.updateSubject.next({ key: 'admins', data: cachedAdmins });
    } else if (eventType.includes('UPDATED')) {
      const index = cachedAdmins.findIndex((a: any) => 
        (a.adminId || a.id) === (data.adminId || data.id)
      );
      if (index !== -1) {
        cachedAdmins[index] = { ...cachedAdmins[index], ...data };
        this.setCachedData('admins', cachedAdmins);
        this.updateSubject.next({ key: 'admins', data: cachedAdmins });
      }
    } else if (eventType.includes('DELETED')) {
      const filtered = cachedAdmins.filter((a: any) => 
        (a.adminId || a.id) !== (data.adminId || data.id)
      );
      this.setCachedData('admins', filtered);
      this.updateSubject.next({ key: 'admins', data: filtered });
    }
  }

  /**
   * Handle intern updates
   */
  private handleInternUpdate(message: WebSocketMessage): void {
    const cachedInterns = this.getCachedData<any[]>('interns') || [];
    const eventType = message.type;
    const data = message.data;

    if (eventType.includes('CREATED')) {
      cachedInterns.push(data);
      this.setCachedData('interns', cachedInterns);
      this.updateSubject.next({ key: 'interns', data: cachedInterns });
    } else if (eventType.includes('UPDATED')) {
      const index = cachedInterns.findIndex((i: any) => 
        (i.internId || i.id) === (data.internId || data.id)
      );
      if (index !== -1) {
        cachedInterns[index] = { ...cachedInterns[index], ...data };
        this.setCachedData('interns', cachedInterns);
        this.updateSubject.next({ key: 'interns', data: cachedInterns });
      }
    } else if (eventType.includes('DELETED')) {
      const filtered = cachedInterns.filter((i: any) => 
        (i.internId || i.id) !== (data.internId || data.id)
      );
      this.setCachedData('interns', filtered);
      this.updateSubject.next({ key: 'interns', data: filtered });
    }
  }

  /**
   * Handle supervisor updates
   */
  private handleSupervisorUpdate(message: WebSocketMessage): void {
    const cachedSupervisors = this.getCachedData<any[]>('supervisors') || [];
    const eventType = message.type;
    const data = message.data;

    if (eventType.includes('CREATED')) {
      cachedSupervisors.push(data);
      this.setCachedData('supervisors', cachedSupervisors);
      this.updateSubject.next({ key: 'supervisors', data: cachedSupervisors });
    } else if (eventType.includes('UPDATED')) {
      const index = cachedSupervisors.findIndex((s: any) => 
        (s.supervisorId || s.id) === (data.supervisorId || data.id)
      );
      if (index !== -1) {
        cachedSupervisors[index] = { ...cachedSupervisors[index], ...data };
        this.setCachedData('supervisors', cachedSupervisors);
        this.updateSubject.next({ key: 'supervisors', data: cachedSupervisors });
      }
    }
  }

  /**
   * Handle attendance updates
   */
  private handleAttendanceUpdate(message: WebSocketMessage): void {
    const cachedAttendance = this.getCachedData<any[]>('attendance') || [];
    const eventType = message.type;
    const data = message.data;

    if (eventType.includes('CREATED') || eventType.includes('UPDATED')) {
      const index = cachedAttendance.findIndex((a: any) => 
        (a.attendanceId || a.id) === (data.attendanceId || data.id)
      );
      if (index !== -1) {
        cachedAttendance[index] = { ...cachedAttendance[index], ...data };
      } else {
        cachedAttendance.push(data);
      }
      this.setCachedData('attendance', cachedAttendance);
      this.updateSubject.next({ key: 'attendance', data: cachedAttendance });
    }
  }

  /**
   * Handle user updates
   */
  private handleUserUpdate(message: WebSocketMessage): void {
    const cachedUsers = this.getCachedData<any[]>('users') || [];
    const eventType = message.type;
    const data = message.data;

    if (eventType.includes('CREATED')) {
      cachedUsers.push(data);
      this.setCachedData('users', cachedUsers);
      this.updateSubject.next({ key: 'users', data: cachedUsers });
    } else if (eventType.includes('UPDATED')) {
      const index = cachedUsers.findIndex((u: any) => 
        (u.id) === (data.id)
      );
      if (index !== -1) {
        cachedUsers[index] = { ...cachedUsers[index], ...data };
        this.setCachedData('users', cachedUsers);
        this.updateSubject.next({ key: 'users', data: cachedUsers });
      }
    }
  }

  /**
   * Handle department updates
   */
  private handleDepartmentUpdate(message: WebSocketMessage): void {
    const cachedDepartments = this.getCachedData<any[]>('departments') || [];
    const eventType = message.type;
    const data = message.data;

    if (eventType.includes('CREATED')) {
      cachedDepartments.push(data);
      this.setCachedData('departments', cachedDepartments);
      this.updateSubject.next({ key: 'departments', data: cachedDepartments });
    } else if (eventType.includes('UPDATED')) {
      const index = cachedDepartments.findIndex((d: any) => 
        (d.departmentId || d.id) === (data.departmentId || data.id)
      );
      if (index !== -1) {
        cachedDepartments[index] = { ...cachedDepartments[index], ...data };
        this.setCachedData('departments', cachedDepartments);
        this.updateSubject.next({ key: 'departments', data: cachedDepartments });
      }
    }
  }

  /**
   * Refresh leave requests from server
   */
  private refreshLeaveRequests(): void {
    this.apiService.get('leave/all').subscribe({
      next: (data) => {
        this.setCachedData('leaveRequests', data);
        this.updateSubject.next({ key: 'leaveRequests', data });
      },
      error: (err) => console.error('Error refreshing leave requests:', err)
    });
  }

  /**
   * Get update observable for a specific cache key
   */
  getUpdateObservable(key: string): Observable<any> {
    return this.updateSubject.asObservable().pipe(
      map(update => update.key === key ? update.data : null),
      switchMap(data => data !== null ? of(data) : of(null))
    );
  }

  /**
   * Preload all data based on user role
   * Returns Observable that completes when all data is loaded
   */
  preloadAllData(): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.warn('No current user found for data preloading');
      return of(false);
    }

    const role = currentUser.role;
    console.log(`🔄 Preloading data for role: ${role}`);

    switch (role) {
      case 'SUPER_ADMIN':
        return this.preloadSuperAdminData();
      case 'ADMIN':
        return this.preloadAdminData();
      case 'SUPERVISOR':
        return this.preloadSupervisorData();
      case 'INTERN':
        return this.preloadInternData();
      default:
        console.warn(`Unknown role for preloading: ${role}`);
        return of(true);
    }
  }

  /**
   * Preload Super Admin data
   */
  private preloadSuperAdminData(): Observable<boolean> {
    const requests: Observable<any>[] = [
      // Load all admins
      this.apiService.get('super-admin/admins').pipe(
        catchError(err => {
          console.error('Error preloading admins:', err);
          return of([]);
        })
      )
    ];

    return forkJoin(requests).pipe(
      map(([admins]) => {
        this.setCachedData('admins', admins);
        console.log(`✅ Preloaded ${admins?.length || 0} admins`);
        return true;
      }),
      catchError(err => {
        console.error('Error during Super Admin data preload:', err);
        return of(true); // Continue even if preload fails
      })
    );
  }

  /**
   * Preload Admin data
   */
  private preloadAdminData(): Observable<boolean> {
    const requests: Observable<any>[] = [
      // Load all users
      this.apiService.get('admins/users').pipe(
        catchError(err => {
          console.error('Error preloading users:', err);
          return of({ users: [], count: 0 });
        })
      ),
      // Load all leave requests
      this.apiService.get('leave/all').pipe(
        catchError(err => {
          console.error('Error preloading leave requests:', err);
          return of([]);
        })
      ),
      // Load all interns
      this.apiService.get('interns').pipe(
        catchError(err => {
          console.error('Error preloading interns:', err);
          return of([]);
        })
      ),
      // Load all supervisors
      this.apiService.get('supervisors').pipe(
        catchError(err => {
          console.error('Error preloading supervisors:', err);
          return of([]);
        })
      ),
      // Load all departments
      this.apiService.get('departments').pipe(
        catchError(err => {
          console.error('Error preloading departments:', err);
          return of([]);
        })
      )
    ];

    return forkJoin(requests).pipe(
      map(([usersResponse, leaveRequests, interns, supervisors, departments]) => {
        this.setCachedData('users', usersResponse?.users || []);
        this.setCachedData('usersCount', usersResponse?.count || 0);
        this.setCachedData('leaveRequests', leaveRequests || []);
        this.setCachedData('interns', interns || []);
        this.setCachedData('supervisors', supervisors || []);
        this.setCachedData('departments', departments || []);
        
        console.log(`✅ Preloaded Admin data:`);
        console.log(`   - ${usersResponse?.count || 0} users`);
        console.log(`   - ${leaveRequests?.length || 0} leave requests`);
        console.log(`   - ${interns?.length || 0} interns`);
        console.log(`   - ${supervisors?.length || 0} supervisors`);
        console.log(`   - ${departments?.length || 0} departments`);
        
        return true;
      }),
      catchError(err => {
        console.error('Error during Admin data preload:', err);
        return of(true);
      })
    );
  }

  /**
   * Preload Supervisor data
   */
  private preloadSupervisorData(): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    const supervisorId = currentUser?.id;

    const requests: Observable<any>[] = [
      // Load assigned interns
      this.apiService.get(`supervisors/${supervisorId}/interns`).pipe(
        catchError(err => {
          console.error('Error preloading supervisor interns:', err);
          return of([]);
        })
      ),
      // Load leave requests for supervisor's interns
      this.apiService.get('leave/all').pipe(
        catchError(err => {
          console.error('Error preloading supervisor leave requests:', err);
          return of([]);
        })
      )
    ];

    return forkJoin(requests).pipe(
      map(([interns, leaveRequests]) => {
        // Filter leave requests for supervisor's interns
        const internIds = interns.map((i: any) => i.internId || i.id);
        const filteredLeaveRequests = (leaveRequests || []).filter((lr: any) => 
          internIds.includes(lr.internId || lr.intern?.internId)
        );

        this.setCachedData('interns', interns || []);
        this.setCachedData('leaveRequests', filteredLeaveRequests);
        
        console.log(`✅ Preloaded Supervisor data:`);
        console.log(`   - ${interns?.length || 0} interns`);
        console.log(`   - ${filteredLeaveRequests?.length || 0} leave requests`);
        
        return true;
      }),
      catchError(err => {
        console.error('Error during Supervisor data preload:', err);
        return of(true);
      })
    );
  }

  /**
   * Preload Intern data
   */
  private preloadInternData(): Observable<boolean> {
    const currentUser = this.authService.getCurrentUser();
    const userEmail = currentUser?.email || currentUser?.username;

    // First, get all interns to find the current user's intern profile
    return this.apiService.get('interns').pipe(
      switchMap((interns: any[]) => {
        // Find intern by email
        const intern = interns.find((i: any) => 
          i.email?.toLowerCase() === userEmail?.toLowerCase()
        );
        
        if (!intern) {
          console.warn('⚠️ Intern profile not found for preloading');
          // Still try to load leave requests
          return this.apiService.get('leave/my-leave').pipe(
            map((leaveRequests: any[]) => {
              this.setCachedData('leaveRequests', leaveRequests || []);
              this.setCachedData('attendance', []);
              this.setCachedData('profile', null);
              console.log(`✅ Preloaded Intern data (partial):`);
              console.log(`   - ${leaveRequests?.length || 0} leave requests`);
              console.log(`   - 0 attendance records (profile not found)`);
              return true;
            }),
            catchError(() => {
              this.setCachedData('leaveRequests', []);
              this.setCachedData('attendance', []);
              this.setCachedData('profile', null);
              return of(true);
            })
          );
        }

        const internId = intern.internId || intern.id;
        console.log(`  Found intern ID: ${internId} for ${userEmail}`);
        
        // Load all intern data in parallel
        return forkJoin({
          leaveRequests: this.apiService.get('leave/my-leave').pipe(
            catchError(err => {
              console.error('Error preloading intern leave requests:', err);
              return of([]);
            })
          ),
          attendance: this.apiService.get(`attendance/intern/${internId}`).pipe(
            catchError(err => {
              console.error('Error preloading intern attendance:', err);
              return of([]);
            })
          ),
          profile: of(intern)
        }).pipe(
          map((data: any) => {
            this.setCachedData('leaveRequests', data.leaveRequests || []);
            this.setCachedData('attendance', data.attendance || []);
            this.setCachedData('profile', data.profile);
            
            console.log(`✅ Preloaded Intern data:`);
            console.log(`   - ${data.leaveRequests?.length || 0} leave requests`);
            console.log(`   - ${data.attendance?.length || 0} attendance records`);
            console.log(`   - Profile: ${data.profile ? 'Loaded' : 'Not found'}`);
            
            return true;
          }),
          catchError(() => of(true))
        );
      }),
      catchError(err => {
        console.error('Error during Intern data preload:', err);
        return of(true);
      })
    );
  }

  /**
   * Get cached data by key
   */
  getCachedData<T>(key: string): T | null {
    return this.preloadCache.get(key) || null;
  }

  /**
   * Set cached data
   */
  setCachedData(key: string, data: any): void {
    this.preloadCache.set(key, data);
  }

  /**
   * Check if data is cached
   */
  hasCachedData(key: string): boolean {
    return this.preloadCache.has(key);
  }

  /**
   * Clear all cached data (useful on logout)
   */
  clearCache(): void {
    this.preloadCache.clear();
    console.log('🗑️ Cleared data preload cache');
  }

  /**
   * Clear specific cached data
   */
  clearCachedData(key: string): void {
    this.preloadCache.delete(key);
  }

  /**
   * Refresh specific data and update cache
   */
  refreshData(key: string, request: Observable<any>): Observable<any> {
    return request.pipe(
      map(data => {
        this.setCachedData(key, data);
        return data;
      }),
      catchError(err => {
        console.error(`Error refreshing ${key}:`, err);
        return of(null);
      })
    );
  }
}

