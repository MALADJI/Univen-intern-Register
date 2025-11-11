import {Component, OnInit, OnDestroy } from '@angular/core';
import {RouterLink} from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy{
  currentTime: string = '';
  private timer: any;
  showProfile = false;

  user = {
    fullName: '',
    email: ''
  };

  constructor(private authService: Auth) {}

  ngOnInit(): void{
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
    
    // Get current user from auth service
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = {
        fullName: currentUser.name || 'User',
        email: currentUser.email || ''
      };
    } else {
      // Fallback if no user is logged in
      this.user = {
        fullName: 'User',
        email: ''
      };
    }
  }

  ngOnDestroy(): void{
    if(this.timer){
      clearInterval(this.timer);
    }
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
  }

  private updateTime(): void{
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }
}

