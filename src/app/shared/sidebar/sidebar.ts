import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Auth } from '../../services/auth';

export interface SidebarItem {
  label: string;
  icon: string;
  route?: string;
  action?: () => void;
  section?: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit, OnDestroy {
  @Input() userRole: string = '';
  @Input() activeSection: string = '';
  @Input() onSectionChange: ((section: string) => void) | null = null;
  
  user: any = {
    fullName: 'Loading...',
    email: '',
    role: ''
  };
  
  isCollapsed = false;
  showProfile = false;
  currentTime: string = '';
  timer: any = null;
  
  adminItems: SidebarItem[] = [
    { label: 'Overview', icon: 'bi-speedometer2', section: 'overview' },
    { label: 'Manage Department', icon: 'bi-building', section: 'Manage Department' },
    { label: 'Supervisor', icon: 'bi-person-badge', section: 'Supervisor' },
    { label: 'Interns', icon: 'bi-people', section: 'interns' },
    { label: 'Intern Leave status', icon: 'bi-calendar-check', section: 'Intern Leave status' },
    { label: 'Attendance history', icon: 'bi-clock-history', section: 'Attendance history' },
    { label: 'Reports', icon: 'bi-file-earmark-bar-graph', section: 'reports' }
  ];
  
  supervisorItems: SidebarItem[] = [
    { label: 'Overview', icon: 'bi-speedometer2', section: 'overview' },
    { label: 'My Interns', icon: 'bi-people', section: 'interns' },
    { label: 'Intern Leave status', icon: 'bi-calendar-check', section: 'Intern Leave status' },
    { label: 'history', icon: 'bi-clock-history', section: 'history' },
    { label: 'reports', icon: 'bi-file-earmark-bar-graph', section: 'reports' }
  ];
  
  internItems: SidebarItem[] = [
    { label: 'Signature', icon: 'bi-pencil-square', section: 'signature' },
    { label: 'Leave Request', icon: 'bi-calendar-plus', section: 'leave' },
    { label: 'Attendance History', icon: 'bi-clock-history', section: 'history' }
  ];
  
  commonItems: SidebarItem[] = [
    { label: 'Settings', icon: 'bi-gear-fill', route: '/settings' },
    { label: 'Logout', icon: 'bi-box-arrow-right', action: () => this.logout() }
  ];

  constructor(
    private apiService: ApiService,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }

  loadUserProfile(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    const storedUser = this.authService.getCurrentUser();
    if (storedUser) {
      this.user.email = storedUser.email || storedUser.username || '';
      this.user.fullName = storedUser.name || storedUser.username || 'User';
      this.user.role = storedUser.role || '';
    }

    this.apiService.getProfile().subscribe({
      next: (profile) => {
        if (profile.name && profile.surname) {
          this.user.fullName = `${profile.name} ${profile.surname}`;
        } else if (profile.name) {
          this.user.fullName = profile.name;
        } else {
          this.user.fullName = profile.username || 'User';
        }
        this.user.email = profile.email || profile.username || '';
        this.user.role = profile.role || '';
        this.userRole = this.user.role;
      },
      error: (error) => {
        // Silently fail and use stored user data
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.user.email = currentUser.email || currentUser.username || '';
          this.user.fullName = currentUser.name || currentUser.username || 'User';
          this.user.role = currentUser.role || '';
          this.userRole = this.user.role;
        } else {
          // Fallback to userRole input if available
          if (this.userRole) {
            this.user.role = this.userRole;
          }
        }
      }
    });
  }

  getSidebarItems(): SidebarItem[] {
    const role = this.userRole.toUpperCase();
    let items: SidebarItem[] = [];
    
    if (role === 'ADMIN') {
      items = [...this.adminItems];
    } else if (role === 'SUPERVISOR') {
      items = [...this.supervisorItems];
    } else if (role === 'INTERN') {
      items = [...this.internItems];
    }
    
    return [...items, ...this.commonItems];
  }

  handleItemClick(item: SidebarItem, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (item.action) {
      item.action();
    } else if (item.section && this.onSectionChange) {
      this.onSectionChange(item.section);
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  isActive(item: SidebarItem): boolean {
    if (item.section) {
      return this.activeSection === item.section;
    }
    if (item.route) {
      return this.router.url === item.route;
    }
    return false;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
  }

  logout(): void {
    this.authService.logout();
  }
}

