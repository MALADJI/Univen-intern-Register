import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class SignUp implements AfterViewInit, OnDestroy {
  signupForm: FormGroup;
  isCodeSent = false;
  countdown = 0;
  private timerSub?: Subscription;
  showPassword = false;
  showConfirmPassword = false;

  selectedDepartment: string = '';

  departmentFields: Record<string, string[]> = {
    ICT: ['Software Development', 'Networking', 'Support', 'Music', 'Business Analysis'],
    HR: ['Recruitment', 'Training', 'Payroll', 'Employee Relations'],
    Finance: ['Accounting', 'Auditing', 'Budgeting', 'Financial Planning'],
    Marketing: ['Digital Marketing', 'Content Creation', 'SEO', 'Brand Management']
  };

  availableFields: string[] = [];

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]],
      staffEmail: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@univen\.ac\.za$/)]],
      verificationCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      role: ['', Validators.required],
      employerName: [''],
      department: ['', Validators.required],
      field: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    // Watch role changes to update employer name and field validation
    this.signupForm.get('role')?.valueChanges.subscribe(role => {
      const employerNameControl = this.signupForm.get('employerName');
      const fieldControl = this.signupForm.get('field');
      
      // Handle employer name validation
      if (role === 'intern') {
        employerNameControl?.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        employerNameControl?.clearValidators();
        employerNameControl?.setValue('');
      }
      employerNameControl?.updateValueAndValidity();
      
      // Handle field validation - not required for admin
      if (role === 'admin') {
        fieldControl?.clearValidators();
        fieldControl?.setValue('');
        // Clear selectedDepartment to hide the field selector
        this.selectedDepartment = '';
        this.availableFields = [];
      } else {
        fieldControl?.setValidators([Validators.required]);
        // Restore selectedDepartment if it was set
        const department = this.signupForm.get('department')?.value;
        if (department) {
          this.selectedDepartment = department;
          this.availableFields = this.departmentFields[department] || [];
        }
      }
      fieldControl?.updateValueAndValidity();
    });
  }

  ngAfterViewInit() {
    // Watch password changes to update strength indicator
    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      // Trigger change detection for password strength
    });
  }

  // Custom password strength validator
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const minLength = value.length >= 8;

    const strength = [hasUpperCase, hasLowerCase, hasNumeric, hasSpecialChar, minLength].filter(Boolean).length;

    if (strength < 3) {
      return { weakPassword: true };
    }
    return null;
  }

  // Password match validator
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  // Get password strength level
  getPasswordStrength(): { level: number; label: string; color: string } {
    const password = this.signupForm.get('password')?.value || '';
    if (!password) return { level: 0, label: '', color: '' };

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const minLength = password.length >= 8;

    const strength = [hasUpperCase, hasLowerCase, hasNumeric, hasSpecialChar, minLength].filter(Boolean).length;

    if (strength <= 2) return { level: 1, label: 'Weak', color: 'danger' };
    if (strength === 3) return { level: 2, label: 'Fair', color: 'warning' };
    if (strength === 4) return { level: 3, label: 'Good', color: 'info' };
    return { level: 4, label: 'Strong', color: 'success' };
  }

  // Get field error message
  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['pattern']) {
      if (fieldName === 'staffEmail') {
        return 'Email must be a valid Univen email (@univen.ac.za)';
      }
      if (fieldName === 'verificationCode') {
        return 'Verification code must be 6 digits';
      }
      if (fieldName === 'name' || fieldName === 'surname') {
        return 'Only letters and spaces are allowed';
      }
    }
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `Minimum ${requiredLength} characters required`;
    }
    if (field.errors['weakPassword']) {
      return 'Password is too weak';
    }
    if (field.errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return 'Invalid input';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      name: 'First Name',
      surname: 'Surname',
      staffEmail: 'Staff Email',
      verificationCode: 'Verification Code',
      role: 'User Role',
      employerName: 'Employer Name',
      department: 'Department',
      field: 'Field',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      acceptTerms: 'Terms and Conditions'
    };
    return labels[fieldName] || fieldName;
  }

  isInternSelected(): boolean {
    return this.signupForm.get('role')?.value === 'intern';
  }

  isAdminSelected(): boolean {
    return this.signupForm.get('role')?.value === 'admin';
  }

  shouldShowField(): boolean {
    const role = this.signupForm.get('role')?.value;
    const department = this.signupForm.get('department')?.value;
    // Show field only if department is selected AND role is NOT admin
    return !!department && role !== 'admin';
  }

  // Check if field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  sendCode(): void {
    const email = this.signupForm.get('staffEmail')?.value;
    if (!email) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your staff email before requesting a code.',
        confirmButtonColor: '#303f61'
      });
      return;
    }

    if (!email.endsWith('@univen.ac.za')) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please use a valid University of Venda email address (@univen.ac.za).',
        confirmButtonColor: '#303f61'
      });
      return;
    }

    // Simulate sending code
    console.log('Verification code sent to:', email);
    this.isCodeSent = true;
    this.countdown = 60;

    Swal.fire({
      icon: 'success',
      title: 'Code Sent!',
      text: 'A verification code has been sent to your email.',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });

    this.timerSub = interval(1000)
      .pipe(take(60))
      .subscribe({
        next: () => this.countdown--,
        complete: () => {
          this.isCodeSent = false;
          this.countdown = 0;
        }
      });
  }

  onDepartmentChange(): void {
    this.selectedDepartment = this.signupForm.get('department')?.value;
    this.availableFields = this.departmentFields[this.selectedDepartment] || [];
    // Reset field selection if department changes
    this.signupForm.get('field')?.setValue('');
  }

  openTermsModal(): void {
    const modalElement = document.getElementById('termsModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  closeTermsModal(): void {
    const modalElement = document.getElementById('termsModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      
      // Check if terms are not accepted
      if (!this.signupForm.get('acceptTerms')?.value) {
        Swal.fire({
          icon: 'warning',
          title: 'Terms Required',
          text: 'Please read and accept the Terms and Conditions to continue.',
          confirmButtonColor: '#303f61'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please fill in all required fields correctly.',
          confirmButtonColor: '#303f61'
        });
      }
      return;
    }

    const { password, confirmPassword } = this.signupForm.value;
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match. Please try again.',
        confirmButtonColor: '#303f61'
      });
      return;
    }

    // Form is valid, proceed with submission
    console.log('Form Submitted:', this.signupForm.value);
    
    Swal.fire({
      icon: 'success',
      title: 'Registration Successful!',
      text: 'Your account has been created successfully. Please check your email for verification.',
      confirmButtonColor: '#303f61',
      confirmButtonText: 'Continue to Login'
    }).then(() => {
      // Navigate to login page
      window.location.href = '/login';
    });
  }

  ngOnDestroy(): void {
    if (this.timerSub) this.timerSub.unsubscribe();
  }
}
