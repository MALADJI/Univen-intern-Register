import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    FormsModule,
    CommonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private authService: Auth,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter both email and password'
      });
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password)
      .then((response) => {
        this.isLoading = false;
        const role = response.role?.toUpperCase();
        
        // Route based on role
        switch (role) {
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
            Swal.fire({
              icon: 'error',
              title: 'Unknown Role',
              text: 'Your account has an unrecognized role. Please contact support.'
            });
        }
      })
      .catch((error) => {
        this.isLoading = false;
        const errorMessage = error?.error?.error || 'Login failed. Please check your credentials.';
        
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMessage
        });
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
