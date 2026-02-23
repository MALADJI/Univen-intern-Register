// ============================================
// UPDATES FOR: src/app/services/auth.service.ts
// ============================================

// 1. Update LoginResponse interface to include SUPER_ADMIN:
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'INTERN';
    name?: string;
  };
}

// 2. Update CurrentUser interface:
export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'INTERN';
  name?: string;
}

// 3. Update getUserRole() method:
getUserRole(): 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'INTERN' | null {
  const user = this.getCurrentUser();
  return user ? user.role : null;
}

// 4. Update hasRole() method:
hasRole(role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPERVISOR' | 'INTERN'): boolean {
  const userRole = this.getUserRole();
  return userRole === role;
}

// 5. Add isSuperAdmin() method:
isSuperAdmin(): boolean {
  return this.hasRole('SUPER_ADMIN');
}

// 6. Add isAdminOrSuperAdmin() method:
isAdminOrSuperAdmin(): boolean {
  const role = this.getUserRole();
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

