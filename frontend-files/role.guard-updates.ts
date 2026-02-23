// ============================================
// UPDATES FOR: src/app/guards/role.guard.ts
// ============================================

// 1. Update expectedRoles type:
expectedRoles: ('SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'INTERN')[];

// 2. Add SUPER_ADMIN to redirect logic in canActivate():
canActivate(route: ActivatedRouteSnapshot): boolean {
  const expectedRoles = route.data['expectedRoles'] as ('SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'INTERN')[];
  const userRole = this.authService.getUserRole();
  
  if (!userRole) {
    this.router.navigate(['/login']);
    return false;
  }
  
  if (expectedRoles && !expectedRoles.includes(userRole)) {
    // Redirect based on role
    if (userRole === 'SUPER_ADMIN') {
      this.router.navigate(['/super-admin/super-admin-dashboard']);
    } else if (userRole === 'ADMIN') {
      this.router.navigate(['/admin/admin-dashboard']);
    } else if (userRole === 'SUPERVISOR') {
      this.router.navigate(['/supervisor/supervisor-dashboard']);
    } else if (userRole === 'INTERN') {
      this.router.navigate(['/intern/intern-dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
  
  return true;
}

