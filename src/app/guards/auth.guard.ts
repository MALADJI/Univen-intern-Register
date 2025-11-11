import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const requiredRole = route.data['role'] as string;

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const userRole = authService.getUserRole()?.toUpperCase();
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user's role
    switch (userRole) {
      case 'ADMIN':
        router.navigate(['/admin/admin-dashboard']);
        break;
      case 'SUPERVISOR':
        router.navigate(['/supervisor/supervisor-dashboard']);
        break;
      case 'INTERN':
        router.navigate(['/intern/intern-dashboard']);
        break;
      default:
        router.navigate(['/login']);
    }
    return false;
  }

  return true;
};

