import {Component, OnInit, OnDestroy } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy{
  currentTime: string = '';
  private timer: any;

  ngOnInit(): void{
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void{
    if(this.timer){
      clearInterval(this.timer);
    }
  }

  private updateTime(): void{
    const now = new Date();
    this.currentTime = now.toLocaleTimeString();
  }
}

