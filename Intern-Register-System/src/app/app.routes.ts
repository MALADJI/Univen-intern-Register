import { Routes } from '@angular/router';
import {Login} from './auth/login/login';
import {InternDashboard} from './intern/intern-dashboard/intern-dashboard';
import {SupervisorDashboard} from './supervisor/supervisor-dashboard/supervisor-dashboard';
import {AdminDashboard} from './admin/admin-dashboard/admin-dashboard';
import { SignUp } from './sign-up/sign-up';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'intern/intern-dashboard', component: InternDashboard },
  { path: 'supervisor/supervisor-dashboard', component: SupervisorDashboard },
  { path: 'admin/admin-dashboard', component: AdminDashboard },
  {path:'sign-up/sign-up',component: SignUp},
];
