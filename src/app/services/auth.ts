import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private currentUser: any = null;

  constructor() {
    // Initialize mock user (for testing purposes)
    this.currentUser = {
      name: 'Thabo Mokoena',
      email: 'thabo.mokoena@univen.ac.za',
      role: 'Supervisor',
      Department:'Ict',
      field:'Software Development'
    };
  }

  // ✅ Check if a user is logged in
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // ✅ Get current logged-in user info
  getCurrentUser() {
    return this.currentUser;
  }

  // ✅ Get admin name
  getAdminName(): string {
    return this.currentUser?.name || '';
  }

  // ✅ Get admin email
  getAdminEmail(): string {
    return this.currentUser?.email || '';
  }

  // ✅ Optional: log out (clear saved user)
  logout() {
    this.currentUser = null;
    console.log('User logged out');
  }

  // ✅ Optional: save login data (for testing)
  saveUser(user: any) {
    this.currentUser = user;
    console.log('User saved:', user);
  }
}
