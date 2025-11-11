import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private currentUser: any = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Load user from localStorage on initialization
    this.loadUserFromStorage();
  }

  // Load user data from localStorage
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        this.clearStorage();
      }
    }
  }

  // Save user data to localStorage
  private saveUserToStorage(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear storage
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  // Login method
  login(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.login(username, password).subscribe({
        next: (response) => {
          // Store token (trim any whitespace)
          const token = response.token ? response.token.trim() : null;
          if (token) {
            localStorage.setItem('token', token);
            
            // Store user data
            this.currentUser = {
              username: response.username,
              email: response.email,
              role: response.role,
              token: token
            };
            this.saveUserToStorage(this.currentUser);
            
            console.log('✅ Login successful:', {
              username: response.username,
              email: response.email,
              role: response.role,
              tokenLength: token.length,
              tokenPreview: token.substring(0, 20) + '...'
            });
            resolve(response);
          } else {
            console.error('❌ No token received in login response');
            reject(new Error('No token received from server'));
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          reject(error);
        }
      });
    });
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && this.currentUser !== null;
  }

  // Get current logged-in user info
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user role
  getUserRole(): string {
    return this.currentUser?.role || '';
  }

  // Get admin name
  getAdminName(): string {
    return this.currentUser?.name || this.currentUser?.username || '';
  }

  // Get admin email
  getAdminEmail(): string {
    return this.currentUser?.email || this.currentUser?.username || '';
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Logout
  logout(): void {
    this.clearStorage();
    this.router.navigate(['/login']);
    console.log('User logged out');
  }

  // Fetch current user from backend
  fetchCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.getCurrentUser().subscribe({
        next: (user) => {
          this.currentUser = {
            ...this.currentUser,
            ...user
          };
          this.saveUserToStorage(this.currentUser);
          resolve(user);
        },
        error: (error) => {
          console.error('Error fetching current user:', error);
          // Don't auto-logout on 401 - might be backend issue
          // Only logout if explicitly told to by the error
          if (error.status === 401) {
            const errorMessage = error.error?.error || error.error?.message || '';
            // Only logout if error explicitly says token is invalid/expired
            if (errorMessage.toLowerCase().includes('token') && 
                (errorMessage.toLowerCase().includes('expired') || 
                 errorMessage.toLowerCase().includes('invalid'))) {
              console.warn('⚠️ Token expired or invalid, logging out');
              this.logout();
            } else {
              console.warn('⚠️ 401 error but keeping session - might be backend issue');
            }
          }
          reject(error);
        }
      });
    });
  }

  // ✅ Optional: save login data (for testing) - kept for backward compatibility
  saveUser(user: any) {
    this.currentUser = user;
    this.saveUserToStorage(user);
    console.log('User saved:', user);
  }
}
