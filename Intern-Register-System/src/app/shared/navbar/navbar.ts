import {Component, OnInit, OnDestroy } from '@angular/core';
import {RouterLink, Router} from '@angular/router';
import {NgIf, NgOptimizedImage} from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy{
  currentTime: string = '';
  private timer: any;
  showProfile = false;

  user = {
    fullName: 'Loading...',
    email: ''
  };

  constructor(
    private apiService: ApiService,
    private authService: Auth,
    private router: Router
  ) {}


  ngOnInit(): void{
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    if (!this.authService.isLoggedIn()) {
      // If not logged in, set default values
      this.user.email = '';
      this.user.fullName = 'Guest';
      return;
    }

    // Always try to get from stored user first (fastest)
    const storedUser = this.authService.getCurrentUser();
    if (storedUser) {
      this.user.email = storedUser.email || storedUser.username || '';
      // Try to extract name from stored user
      if (storedUser.name) {
        this.user.fullName = storedUser.name;
      } else if (storedUser.username) {
        // Extract name from email/username (e.g., "john.doe@univen.ac.za" -> "john.doe")
        const namePart = storedUser.username.split('@')[0];
        this.user.fullName = namePart.split('.').map((part: string) => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
      } else {
        this.user.fullName = 'User';
      }
    }

    // Fetch full profile from backend (optional - only if endpoint is available)
    // This will enhance the profile with additional data if available
    const token = this.authService.getToken();
    if (token) {
      this.apiService.getProfile().subscribe({
        next: (profile) => {
          // Successfully loaded profile from backend
          if (profile.name && profile.surname) {
            this.user.fullName = `${profile.name} ${profile.surname}`;
          } else if (profile.name) {
            this.user.fullName = profile.name;
          } else if (profile.username) {
            // Fallback to username if name not available
            const namePart = profile.username.split('@')[0];
            this.user.fullName = namePart.split('.').map((part: string) => 
              part.charAt(0).toUpperCase() + part.slice(1)
            ).join(' ');
          }
          this.user.email = profile.email || profile.username || this.user.email;
        },
        error: (error) => {
          // Silently handle 403/401 errors - profile endpoint might not be accessible
          // We already have user data from stored user, so this is just an enhancement
          if (error.status !== 403 && error.status !== 401) {
            console.warn('Could not load enhanced profile:', error.status, error.statusText);
          }
          // Keep using stored user data (already set above)
        }
      });
    }
  }

  ngOnDestroy(): void{
    if(this.timer){
      clearInterval(this.timer);
    }
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
  }

  private updateTime(): void{
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

