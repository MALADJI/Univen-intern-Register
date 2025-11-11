import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Auth } from '../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  profile: any = {
    name: '',
    surname: '',
    email: '',
    username: '',
    role: '',
    department: '',
    field: '',
    supervisor: ''
  };

  // Profile edit
  editMode = false;
  editedProfile: any = {};

  // Password change
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  isLoading = false;
  isChangingPassword = false;

  constructor(
    private apiService: ApiService,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    
    // First, try to get basic user info from stored data
    const storedUser = this.authService.getCurrentUser();
    if (storedUser) {
      // Set initial profile from stored user data
      this.profile.email = storedUser.email || storedUser.username || '';
      this.profile.username = storedUser.username || '';
      this.profile.role = storedUser.role || '';
      // Try to extract name from username if available
      if (storedUser.username) {
        const namePart = storedUser.username.split('@')[0];
        const nameParts = namePart.split('.');
        if (nameParts.length >= 2) {
          this.profile.name = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : '';
          this.profile.surname = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';
        } else {
          this.profile.name = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : '';
        }
      }
    }
    
    // Then try to load full profile from backend
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.isLoading = false;
        // Merge backend profile data
        this.profile = {
          ...this.profile,
          ...profile,
          // Ensure name and surname are set
          name: profile.name || this.profile.name || '',
          surname: profile.surname || this.profile.surname || '',
          email: profile.email || this.profile.email || '',
          username: profile.username || this.profile.username || '',
          role: profile.role || this.profile.role || ''
        };
        this.editedProfile = { ...this.profile };
      },
      error: (error) => {
        this.isLoading = false;
        
        // Handle 403/401 errors gracefully
        if (error.status === 403 || error.status === 401) {
          // Profile endpoint is not accessible, but we have basic user data
          console.warn('Profile endpoint not accessible, using stored user data');
          if (!this.profile.email && !this.profile.username) {
            // Only show error if we don't have any user data
            Swal.fire({
              icon: 'warning',
              title: 'Limited Profile Access',
              text: 'Could not load full profile. Using available information.',
              confirmButtonText: 'OK'
            });
          }
          // Use stored user data (already set above)
          this.editedProfile = { ...this.profile };
        } else {
          // Other errors (network, server, etc.)
          console.error('Error loading profile:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error Loading Profile',
            text: error.error?.error || error.message || 'Failed to load profile. Please try again later.',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.editedProfile = { ...this.profile };
    }
  }

  saveProfile(): void {
    if (!this.editedProfile.name || !this.editedProfile.surname) {
      Swal.fire('Validation Error', 'Name and surname are required', 'error');
      return;
    }

    this.isLoading = true;
    this.apiService.updateProfile({
      name: this.editedProfile.name,
      surname: this.editedProfile.surname
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.profile = { ...this.profile, ...this.editedProfile };
        this.editMode = false;
        Swal.fire('Success', 'Profile updated successfully', 'success');
        this.loadProfile(); // Reload to get latest data
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', error.error?.error || 'Failed to update profile', 'error');
      }
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editedProfile = { ...this.profile };
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      Swal.fire('Validation Error', 'All password fields are required', 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Error', 'New passwords do not match', 'error');
      return;
    }

    if (this.newPassword.length < 8) {
      Swal.fire('Error', 'Password must be at least 8 characters long', 'error');
      return;
    }

    // Check password requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.newPassword)) {
      Swal.fire({
        icon: 'error',
        title: 'Password Requirements',
        html: `
          <p>Password must meet the following requirements:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>At least 8 characters long</li>
            <li>At least one lowercase letter (a-z)</li>
            <li>At least one uppercase letter (A-Z)</li>
            <li>At least one digit (0-9)</li>
            <li>At least one special character (@$!%*?&)</li>
          </ul>
        `
      });
      return;
    }

    this.isChangingPassword = true;
    this.apiService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        this.isChangingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        Swal.fire('Success', 'Password changed successfully', 'success');
      },
      error: (error) => {
        this.isChangingPassword = false;
        Swal.fire('Error', error.error?.error || 'Failed to change password', 'error');
      }
    });
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getFullName(): string {
    if (this.profile.name && this.profile.surname) {
      return `${this.profile.name} ${this.profile.surname}`;
    }
    return this.profile.name || this.profile.username || 'User';
  }
}

