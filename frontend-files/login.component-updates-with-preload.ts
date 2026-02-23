// ============================================
// UPDATES FOR: src/app/auth/login/login.component.ts
// ============================================
// Update login to use auth service which now handles preloading

// The login component should be simplified since auth service handles preloading:

onLoginSuccess(response: LoginResponse): void {
  // Auth service now handles:
  // 1. Storing token and user
  // 2. Preloading all data
  // 3. Redirecting to appropriate dashboard
  
  // So this method might not be needed if login() in auth service handles everything
  // OR if you want to show a loading indicator:
  
  this.loading = true;
  this.authService.login(this.loginForm.value.username, this.loginForm.value.password)
    .subscribe({
      next: (response) => {
        // Data preloading and redirect handled by auth service
        // Optionally show success message
        this.snackBar.open('Login successful! Loading your dashboard...', 'Close', {
          duration: 2000
        });
      },
      error: (error) => {
        this.loading = false;
        // Handle error
        const errorMessage = error.error?.message || 'Login failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000
        });
      }
    });
}

// OR if login() already redirects, you can simplify to:
onSubmit(): void {
  if (this.loginForm.valid) {
    this.loading = true;
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password)
      .subscribe({
        next: () => {
          // Preloading and redirect handled by auth service
          // Optionally show loading message
        },
        error: (error) => {
          this.loading = false;
          const errorMessage = error.error?.message || 'Login failed. Please try again.';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
  }
}

