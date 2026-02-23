// ============================================
// UPDATES FOR: src/app/auth/login/login.component.ts
// ============================================

// Update the login success handler to redirect SUPER_ADMIN:

onLoginSuccess(response: LoginResponse): void {
  // Store token and user
  this.authService.setToken(response.token);
  this.authService.setCurrentUser(response.user);
  
  // Redirect based on role
  const role = response.user.role;
  
  if (role === 'SUPER_ADMIN') {
    this.router.navigate(['/super-admin/super-admin-dashboard']);
  } else if (role === 'ADMIN') {
    this.router.navigate(['/admin/admin-dashboard']);
  } else if (role === 'SUPERVISOR') {
    this.router.navigate(['/supervisor/supervisor-dashboard']);
  } else if (role === 'INTERN') {
    this.router.navigate(['/intern/intern-dashboard']);
  } else {
    this.router.navigate(['/']);
  }
}

