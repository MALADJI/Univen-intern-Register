// ============================================
// UPDATES FOR: src/app/app.routes.ts
// ============================================

// Add this import:
import { SuperAdminDashboardComponent } from './super-admin/super-admin-dashboard/super-admin-dashboard.component';

// Add this route to your routes array:
{
  path: 'super-admin/super-admin-dashboard',
  component: SuperAdminDashboardComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { expectedRoles: ['SUPER_ADMIN'] }
}

// Complete example routes array:
export const routes: Routes = [
  // ... existing routes ...
  
  // Super Admin Dashboard
  {
    path: 'super-admin/super-admin-dashboard',
    component: SuperAdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['SUPER_ADMIN'] }
  },
  
  // ... other routes ...
];

