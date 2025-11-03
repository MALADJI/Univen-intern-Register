import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

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

  selectedDepartment: string = '';
  selectedField: string = '';

  departmentFields: Record<string, string[]> = {
    ICT: ['Software Development', 'Networking', 'Support', 'Music','Business analysis'],
    HR: ['Recruitment', 'Training', 'Payroll', 'Employee Relations'],
    Finance: ['Accounting', 'Auditing', 'Budgeting', 'Financial Planning'],
    Marketing: ['Digital Marketing', 'Content Creation', 'SEO', 'Brand Management']
  };

  availableFields: string[] = [];

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      staffEmail: ['', [Validators.required, Validators.email]],
      verificationCode: ['', Validators.required],
      role: ['', Validators.required],
      department: ['', Validators.required],
      field: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngAfterViewInit() {}

  sendCode(): void {
    const email = this.signupForm.get('staffEmail')?.value;
    if (!email) {
      alert('Please enter your staff email before requesting a code.');
      return;
    }

    console.log('Verification code sent to:', email);
    this.isCodeSent = true;
    this.countdown = 60;

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
    this.selectedField = '';
    this.signupForm.get('field')?.setValue('');
  }

  onFieldChange(): void {
    this.signupForm.get('field')?.setValue(this.selectedField);
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.signupForm.value;
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    console.log('Form Submitted:', this.signupForm.value);
  }

  ngOnDestroy(): void {
    if (this.timerSub) this.timerSub.unsubscribe();
  }
}
