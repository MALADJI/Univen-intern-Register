import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink]
})
export class SignUp implements AfterViewInit, OnDestroy {
  signupForm: FormGroup;
  isCodeSent = false;
  countdown = 0;
  verificationCode: string = '';
  isLoading = false;
  canResend = false;
  showPassword = false;
  showConfirmPassword = false;
  private timerSub?: Subscription;

  selectedDepartment: string = '';
  selectedField: string = '';

  departmentFields: Record<string, string[]> = {
    ICT: ['Software Development', 'Networking', 'Support', 'Music','Business analysis'],
    HR: ['Recruitment', 'Training', 'Payroll', 'Employee Relations'],
    Finance: ['Accounting', 'Auditing', 'Budgeting', 'Financial Planning'],
    Marketing: ['Digital Marketing', 'Content Creation', 'SEO', 'Brand Management']
  };

  availableFields: string[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      staffEmail: [{value: '', disabled: false}, [Validators.required, Validators.email]],
      verificationCode: ['', Validators.required],
      role: ['', Validators.required],
      department: ['', Validators.required],
      field: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngAfterViewInit() {
    // Form is ready
  }

  sendCode(): void {
    const email = this.signupForm.get('staffEmail')?.value;
    if (!email) {
      Swal.fire('Error', 'Please enter your staff email before requesting a code.', 'error');
      return;
    }

    // Validate email format
    if (!this.signupForm.get('staffEmail')?.valid) {
      Swal.fire('Error', 'Please enter a valid email address.', 'error');
      return;
    }

    // Check if email already exists (if endpoint exists, otherwise proceed)
    this.isLoading = true;
    this.apiService.checkEmailExists(email).subscribe({
      next: (response) => {
        // Email exists, show error
        this.isLoading = false;
        this.signupForm.get('staffEmail')?.enable();
        Swal.fire({
          icon: 'error',
          title: 'Email Already Registered',
          text: 'This email is already registered. Please use a different email or try logging in.',
          confirmButtonText: 'OK'
        });
      },
      error: (error) => {
        // If endpoint doesn't exist (404) or email doesn't exist, proceed with sending code
        // Backend registration will also validate email uniqueness
        if (error.status === 404) {
          // Endpoint doesn't exist, proceed anyway (backend will validate)
          this.sendVerificationCodeInternal(email);
        } else if (error.status === 400 || error.status === 409) {
          // Email exists (409 Conflict or 400 Bad Request)
          this.isLoading = false;
          this.signupForm.get('staffEmail')?.enable();
          Swal.fire({
            icon: 'error',
            title: 'Email Already Registered',
            text: error.error?.message || 'This email is already registered. Please use a different email or try logging in.',
            confirmButtonText: 'OK'
          });
        } else {
          // Other error, proceed with sending code (backend will handle validation)
          this.sendVerificationCodeInternal(email);
        }
      }
    });
  }

  private sendVerificationCodeInternal(email: string): void {
    this.isLoading = true;
    this.signupForm.get('staffEmail')?.disable();
    this.apiService.sendVerificationCode(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Verification code response:', response);
        const code = response?.code || response?.data?.code || '';
        console.log('Extracted code:', code);
        this.verificationCode = code;
    this.isCodeSent = true;
    this.countdown = 60;

        // Show verification code immediately
        if (code) {
          Swal.fire({
            title: 'Verification Code Sent!',
            html: `
              <p>Verification code has been sent to <strong>${email}</strong></p>
              <p class="mt-3"><strong>Your Verification Code:</strong></p>
              <h2 class="text-primary">${code}</h2>
              <p class="text-muted small mt-2">Check your email or use this code to verify</p>
              <p class="text-info small mt-2"><strong>Note:</strong> Email sending is not configured. Code is shown here for testing.</p>
            `,
            icon: 'success',
            confirmButtonText: 'Got it!'
          });
        } else {
          // Fallback if code is not in response
          Swal.fire({
            title: 'Code Sent!',
            html: `
              <p>Verification code has been sent to <strong>${email}</strong></p>
              <p class="text-muted small mt-2">Please check your email or the backend console for the code.</p>
              <p class="text-info small mt-2">Note: Check the backend terminal/console for the verification code.</p>
            `,
            icon: 'info',
            confirmButtonText: 'Got it!'
          });
        }

        this.canResend = false;
        this.signupForm.get('staffEmail')?.enable();
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
          this.isCodeSent = false;
          this.countdown = 0;
              this.canResend = true;
            }
          });
      },
      error: (error) => {
        this.isLoading = false;
        this.signupForm.get('staffEmail')?.enable();
        Swal.fire('Error', error.error?.error || 'Failed to send verification code', 'error');
        }
      });
  }

  onDepartmentChange(): void {
    this.selectedDepartment = this.signupForm.get('department')?.value;
    this.availableFields = this.departmentFields[this.selectedDepartment] || [];
    // Reset field selection if department changes
    this.selectedField = '';
    this.signupForm.get('field')?.setValue('');
  }

  onFieldChange(event?: Event): void {
    const selectElement = event?.target as HTMLSelectElement;
    const selectedValue = selectElement?.value || this.signupForm.get('field')?.value || '';
    this.selectedField = selectedValue;
    if (selectedValue) {
      this.signupForm.get('field')?.setValue(selectedValue);
    }
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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      Swal.fire('Validation Error', 'Please fill in all required fields correctly.', 'error');
      return;
    }

    const { password, confirmPassword, staffEmail, verificationCode, role, name, surname, department, field } = this.signupForm.value;
    if (password !== confirmPassword) {
      Swal.fire('Error', 'Passwords do not match.', 'error');
      return;
    }

    this.isLoading = true;
    this.apiService.register({
      username: staffEmail,
      password: password,
      role: role.toUpperCase(),
      verificationCode: verificationCode,
      name: name,
      surname: surname,
      department: department
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your account has been created successfully. You can now login.',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        // Check if error is due to duplicate email
        if (error.status === 409 || error.status === 400) {
          const errorMessage = error.error?.error || error.error?.message || '';
          if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exist')) {
            Swal.fire({
              icon: 'error',
              title: 'Email Already Registered',
              text: 'This email is already registered. Please use a different email or try logging in.',
              confirmButtonText: 'Go to Login'
            }).then(() => {
              this.router.navigate(['/login']);
            });
            return;
          }
        }
        Swal.fire('Registration Failed', error.error?.error || error.error?.message || 'Failed to register. Please try again.', 'error');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerSub) this.timerSub.unsubscribe();
  }
}
