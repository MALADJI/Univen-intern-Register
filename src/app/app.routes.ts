import { Routes } from '@angular/router';
import {Login} from './auth/login/login';
import {InternDashboard} from './intern/intern-dashboard/intern-dashboard';
import {SupervisorDashboard} from './supervisor/supervisor-dashboard/supervisor-dashboard';
import {AdminDashboard} from './admin/admin-dashboard/admin-dashboard';
import { SignUp } from './sign-up/sign-up';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { Settings } from './settings/settings';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'sign-up/sign-up', component: SignUp },
  { 
    path: 'settings', 
    component: Settings,
    canActivate: [authGuard]
  },
  { 
    path: 'intern/intern-dashboard', 
    component: InternDashboard,
    canActivate: [authGuard, roleGuard],
    data: { role: 'INTERN' }
  },
  { 
    path: 'supervisor/supervisor-dashboard', 
    component: SupervisorDashboard,
    canActivate: [authGuard, roleGuard],
    data: { role: 'SUPERVISOR' }
  },
  { 
    path: 'admin/admin-dashboard', 
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' }
  },
];
