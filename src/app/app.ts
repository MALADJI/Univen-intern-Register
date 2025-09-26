import { Component, signal } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {Navbar} from './shared/navbar/navbar';
import {Footer} from './shared/footer/footer';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private router:Router){}
  protected readonly title = signal('Intern-Register-System');

  // Hide on login & register routes
  isAuthPage(): boolean {
    const currentRoute = this.router.url;
    return currentRoute.includes('login') || currentRoute.includes('register');
  }
}
