import {Component, OnInit, OnDestroy } from '@angular/core';
import {RouterLink} from '@angular/router';
import {NgIf, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    NgIf,
    NgOptimizedImage
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy{
  currentTime: string = '';
  private timer: any;
  showProfile = false;

  user = {
    fullName: 'Dzulani Monyayi',
    email: 'dzulani.monyayi@univen.ac.za'
  };


  ngOnInit(): void{
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
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

