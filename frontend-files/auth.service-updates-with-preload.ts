// ============================================
// UPDATES FOR: src/app/services/auth.service.ts
// ============================================
// Add data preloading functionality to auth service

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { DataPreloadService } from './data-preload.service';

// Add this import at the top
// import { DataPreloadService } from './data-preload.service';

// Add DataPreloadService to constructor:
constructor(
  private http: HttpClient,
  private router: Router,
  private apiService: ApiService,
  private dataPreloadService: DataPreloadService  // ADD THIS
) {
  // ... existing code
}

// Update login method to preload data:
login(username: string, password: string): Observable<LoginResponse> {
  return this.apiService.post<LoginResponse>('auth/login', { username, password }).pipe(
    tap(response => {
      if (response && response.token) {
        // Store token and user
        this.setToken(response.token);
        this.setCurrentUser(response.user);
        
        // Preload all data before redirecting
        console.log('🔄 Starting data preload...');
        this.dataPreloadService.preloadAllData().subscribe({
          next: (success) => {
            if (success) {
              console.log('✅ Data preload completed');
            } else {
              console.warn('⚠️ Data preload completed with warnings');
            }
            // Redirect after preload completes
            this.redirectAfterLogin(response.user.role);
          },
          error: (err) => {
            console.error('❌ Data preload failed:', err);
            // Still redirect even if preload fails
            this.redirectAfterLogin(response.user.role);
          }
        });
      }
    }),
    catchError(error => {
      console.error('Login error:', error);
      return throwError(() => error);
    })
  );
}

// Add helper method for redirect:
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

// Update logout method to clear cache:
logout(): void {
  this.tokenSubject.next(null);
  this.currentUserSubject.next(null);
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  
  // Clear preloaded data cache
  this.dataPreloadService.clearCache();
  
  this.router.navigate(['/login']);
}

