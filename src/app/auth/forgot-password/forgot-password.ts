import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword implements OnDestroy {
  email: string = '';
  verificationCode: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  step: 'email' | 'verify' | 'reset' = 'email';
  isLoading: boolean = false;
  codeSent: boolean = false;
  receivedCode: string = '';
  countdown: number = 0;
  canResend: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  private timerSub?: Subscription;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  sendCode(): void {
    if (!this.email) {
      Swal.fire('Error', 'Please enter your email address', 'error');
      return;
    }

    this.isLoading = true;
    this.apiService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.codeSent = true;
        console.log('Forgot password response:', response);
        const code = response?.code || response?.data?.code || '';
        console.log('Extracted code:', code);
        this.receivedCode = code;
        this.step = 'verify';
        this.canResend = false;
        this.countdown = 60;

        // Show verification code immediately
        if (code) {
          Swal.fire({
            title: 'Verification Code Sent!',
            html: `
              <p>Verification code has been sent to <strong>${this.email}</strong></p>
              <p class="mt-3"><strong>Your Verification Code:</strong></p>
              <h2 class="text-primary">${code}</h2>
              <p class="text-muted small mt-2">Use this code to reset your password</p>
              <p class="text-info small mt-2">Note: Email sending is not configured. Code is shown here for testing.</p>
            `,
            icon: 'success',
            confirmButtonText: 'Continue'
          });
        } else {
          // Fallback if code is not in response
          Swal.fire({
            title: 'Code Sent!',
            html: `
              <p>Verification code has been sent to <strong>${this.email}</strong></p>
              <p class="text-muted small mt-2">Please check your email or the backend console for the code.</p>
              <p class="text-info small mt-2">Note: Check the backend terminal/console for the verification code.</p>
            `,
            icon: 'info',
            confirmButtonText: 'Continue'
          });
        }

        // Start countdown timer
        this.timerSub = interval(1000)
          .pipe(take(60))
          .subscribe({
            next: () => {
              this.countdown--;
              if (this.countdown <= 0) {
                this.canResend = true;
              }
            },
            complete: () => {
              this.countdown = 0;
              this.canResend = true;
            }
          });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', error.error?.error || 'Failed to send verification code', 'error');
      }
    });
  }

  verifyCode(): void {
    if (!this.verificationCode) {
      Swal.fire('Error', 'Please enter the verification code', 'error');
      return;
    }

    this.isLoading = true;
    this.apiService.verifyCode(this.email, this.verificationCode, 'password-reset').subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.valid) {
          this.step = 'reset';
          Swal.fire('Success', 'Code verified! Now set your new password.', 'success');
        } else {
          Swal.fire('Error', 'Invalid verification code', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire('Error', error.error?.error || 'Invalid verification code', 'error');
      }
    });
  }

  resetPassword(): void {
    if (!this.newPassword || !this.confirmPassword) {
      Swal.fire('Error', 'Please enter and confirm your new password', 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
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

    this.isLoading = true;
    this.apiService.resetPassword(this.email, this.verificationCode, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Password Reset Successful!',
          text: 'Your password has been reset. You can now login with your new password.',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password reset error:', error);
        const errorMessage = error.error?.error || error.message || 'Failed to reset password';
        Swal.fire({
          icon: 'error',
          title: 'Password Reset Failed',
          text: errorMessage,
          footer: 'Please check the backend console for more details'
        });
      }
    });
  }

  backToEmail(): void {
    this.step = 'email';
    this.verificationCode = '';
    this.codeSent = false;
  }

  backToVerify(): void {
    this.step = 'verify';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  resendCode(): void {
    // Reset countdown and resend
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
    this.countdown = 0;
    this.canResend = false;
    this.sendCode();
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }
}

