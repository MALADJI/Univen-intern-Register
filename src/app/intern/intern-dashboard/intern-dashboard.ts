import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';
import { NgIf, NgFor, DatePipe, NgClass, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type Section = 'signature' | 'leave' | 'history';

interface LogEntry {
  date: Date;
  timeIn?: Date;
  timeOut?: Date;
  action: 'Signed In' | 'Signed Out';
  image: string | null;
  location?: string;
}

interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Declined';
  attachment?: string;
  supervisorEmail?: string;
  email?: string;
  name?: string;
}

@Component({
  selector: 'app-intern-dashboard',
  standalone: true,
  templateUrl: './intern-dashboard.html',
  styleUrls: ['./intern-dashboard.css'],
  imports: [NgIf, NgFor, NgClass, DatePipe, FormsModule, SlicePipe]
})
export class InternDashboard implements AfterViewInit {
  // ======== NAVIGATION ========
  navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'signature', label: 'Signature', icon: 'bi-pencil-square' },
    { key: 'leave', label: 'Leave Request', icon: 'bi-calendar2-check' },
    { key: 'history', label: 'Attendance History', icon: 'bi-clock-history' }
  ];
  activeSection: Section = 'signature';

  // ======== SIGNATURE PAD ========
  @ViewChild('signaturePad') signaturePadElement!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;
  savedSignature: string | null = null;
  isPadVisible = false;

  // ======== USER & LOCATION ========
  intern = {
    name: 'Intern Name',
    email: 'intern.email@univen.ac.za',
    role: 'Intern',
    Department: 'Ict',
    field: 'Software Development',
    supervisorEmail: 'supervisor.email@univen.ac.za'
  };
  currentUserCoordinates: { lat: number; lng: number } | null = null;
  allowedLocations = [
    { name: 'Department of Music', lat: -22.976097973096806, lng: 30.44584838301353 },
    { name: 'ICT 2', lat: -22.975789294822736, lng: 30.443756260035 },
    { name: 'Main Admin', lat: -22.976409120079406, lng: 30.445703543682725 }
  ];
  maxDistanceMeters = 60;

  // ======== ATTENDANCE ========
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  signedInToday = false;
  signedOutToday = false;

  // ======== LEAVE REQUEST ========
  leaveType: string = '';
  startDate: string = '';
  endDate: string = '';
  attachment: File | null = null;
  leaveRequests: LeaveRequest[] = [];

  // ======== REPORT ========
  reportStartDate: string = '';
  reportEndDate: string = '';
  reportLogs: LogEntry[] = [];

  // ======== ALERT MESSAGE ========
  message: string = '';

  ngAfterViewInit(): void {
    this.loadData();
    this.detectLocation();
    this.checkTodayStatus();
    this.filteredLogs = [...this.logs];
    this.reportLogs = [...this.logs];
    this.loadLeaveRequests();
  }

  // ======== NAVIGATION ========
  showSection(section: Section): void {
    this.activeSection = section;
  }

  // ======== SIGNATURE PAD FUNCTIONS ========
  toggleSignaturePad(): void {
    this.isPadVisible = !this.isPadVisible;
    if (this.isPadVisible) setTimeout(() => this.initializeSignaturePad(), 50);
  }

  initializeSignaturePad(): void {
    const canvas = this.signaturePadElement.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = 200 * ratio;
    const context = canvas.getContext('2d')!;
    context.scale(ratio, ratio);
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgba(255,255,255,0)',
      penColor: '#000000',
      minWidth: 1.2,
      maxWidth: 1.8
    });
  }

  clearSignature(): void {
    if (this.signaturePad) this.signaturePad.clear();
  }

  saveSignature(): void {
    if (!this.signaturePad || this.signaturePad.isEmpty()) {
      this.showMessage('Please draw your signature first.', 'warning');
      return;
    }
    this.savedSignature = this.signaturePad.toDataURL('image/png');
    this.isPadVisible = false;
    this.showMessage('Signature saved successfully!', 'success');
    this.saveData();
  }

  // ======== LOCATION ========
  private detectLocation(): void {
    if (!navigator.geolocation) {
      this.showMessage('Geolocation is not supported by your browser.', 'danger');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.currentUserCoordinates = { lat: latitude, lng: longitude };
      },
      () => this.showMessage('Unable to retrieve your location.', 'danger'),
      { enableHighAccuracy: true }
    );
  }

  isWithinAllowedLocation(lat: number, lng: number): boolean {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const distance = (a1: number, o1: number, a2: number, o2: number) => {
      const R = 6371000;
      const dA = toRad(a2 - a1);
      const dO = toRad(o2 - o1);
      const x =
        Math.sin(dA / 2) ** 2 +
        Math.cos(toRad(a1)) * Math.cos(toRad(a2)) * Math.sin(dO / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    };
    return this.allowedLocations.some(loc => distance(lat, lng, loc.lat, loc.lng) <= this.maxDistanceMeters);
  }

  get nearestBuilding(): string {
    if (!this.currentUserCoordinates) return '-';
    const toRad = (v: number) => (v * Math.PI) / 180;
    const distance = (a1: number, o1: number, a2: number, o2: number) => {
      const R = 6371000;
      const dA = toRad(a2 - a1);
      const dO = toRad(o2 - o1);
      const x =
        Math.sin(dA / 2) ** 2 +
        Math.cos(toRad(a1)) * Math.cos(toRad(a2)) * Math.sin(dO / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    };
    let nearest = this.allowedLocations[0];
    let min = distance(this.currentUserCoordinates!.lat, this.currentUserCoordinates!.lng, nearest.lat, nearest.lng);
    for (const loc of this.allowedLocations) {
      const d = distance(this.currentUserCoordinates!.lat, this.currentUserCoordinates!.lng, loc.lat, loc.lng);
      if (d < min) {
        min = d;
        nearest = loc;
      }
    }
    return `${nearest.name} (${Math.round(min)}m away)`;
  }

  // ======== SIGN IN / SIGN OUT ========
  canSignInNow(): boolean {
    const now = new Date();
    return now.getHours() >= 8;
  }

  canSignOutNow(): boolean {
    const now = new Date();
    return now.getHours() >= 16 && now.getMinutes() >= 30;
  }

  signIn(): void {
    if (!this.savedSignature) {
      this.showMessage('Please save your signature before signing in.', 'warning');
      return;
    }
    if (!this.currentUserCoordinates || !this.isWithinAllowedLocation(this.currentUserCoordinates.lat, this.currentUserCoordinates.lng)) {
      this.showMessage('Cannot sign in. You are out of the allowed range!', 'danger');
      return;
    }
    if (!this.canSignInNow()) {
      this.showMessage('Sign in allowed only after 08:00.', 'warning');
      return;
    }
    const now = new Date();
    this.logs.push({
      date: now,
      timeIn: now,
      action: 'Signed In',
      image: this.savedSignature,
      location: this.nearestBuilding
    });
    this.signedInToday = true;
    this.saveData();
    this.showMessage(`Signed in successfully at ${this.nearestBuilding}`, 'success');
  }

  signOut(): void {
    if (!this.signedInToday) {
      this.showMessage('You need to sign in first.', 'warning');
      return;
    }
    if (!this.canSignOutNow()) {
      this.showMessage('Sign out allowed only after 16:30.', 'warning');
      return;
    }
    const now = new Date();
    this.logs.push({
      date: now,
      timeOut: now,
      action: 'Signed Out',
      image: this.savedSignature,
      location: this.nearestBuilding
    });
    this.signedOutToday = true;
    this.saveData();
    this.showMessage(`Signed out successfully at ${this.nearestBuilding}`, 'success');
  }

  clearTodayRegister(): void {
    const todayStr = new Date().toDateString();
    this.logs = this.logs.filter(log => log.date.toDateString() !== todayStr);
    this.signedInToday = false;
    this.signedOutToday = false;
    this.saveData();
    this.showMessage("Today's register cleared.", 'success');
  }

  checkTodayStatus(): void {
    const todayStr = new Date().toDateString();
    this.signedInToday = this.logs.some(log => log.date.toDateString() === todayStr && log.action === 'Signed In');
    this.signedOutToday = this.logs.some(log => log.date.toDateString() === todayStr && log.action === 'Signed Out');
  }

  // ======== WEEKDAY FILTER FOR REGISTER TABLE ========
  get weekFilteredLogs(): LogEntry[] {
    return this.logs.filter(log => {
      const day = log.date.getDay();
      return day >= 1 && day <= 5; // Monday (1) to Friday (5)
    });
  }

  // ======== LOCAL STORAGE ========
  saveData(): void {
    localStorage.setItem('logs', JSON.stringify(this.logs));
    localStorage.setItem('signature', this.savedSignature || '');
  }

  loadData(): void {
    this.logs = JSON.parse(localStorage.getItem('logs') || '[]').map((log: any) => ({
      ...log,
      date: new Date(log.date),
      timeIn: log.timeIn ? new Date(log.timeIn) : undefined,
      timeOut: log.timeOut ? new Date(log.timeOut) : undefined
    }));
    this.savedSignature = localStorage.getItem('signature') || null;
  }

  // ======== LEAVE REQUEST ========
  submitLeaveRequest(): void {
    if (!this.leaveType || !this.startDate || !this.endDate) {
      this.showMessage('Please fill in all required fields.', 'danger');
      return;
    }
    const newRequest: LeaveRequest = {
      id: Date.now(),
      type: this.leaveType,
      startDate: this.startDate,
      endDate: this.endDate,
      status: 'Pending',
      attachment: this.attachment?.name,
      supervisorEmail: this.intern.supervisorEmail,
      email: this.intern.email,
      name: this.intern.name
    };
    const existing = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    existing.push(newRequest);
    localStorage.setItem('leaveRequests', JSON.stringify(existing));
    this.leaveType = '';
    this.startDate = '';
    this.endDate = '';
    this.attachment = null;
    this.loadLeaveRequests();
    this.showMessage('Leave request submitted successfully!', 'success');
  }

  loadLeaveRequests(): void {
    const allRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    this.leaveRequests = allRequests.filter((req: LeaveRequest) => req.email === this.intern.email);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.attachment = input.files?.[0] || null;
  }

  // ======== ALERT MESSAGE ========
  showMessage(msg: string, type: 'success' | 'danger' | 'warning'): void {
    this.message = msg;
    const el = document.getElementById('alertBox');
    if (el) {
      el.className = `alert alert-${type} text-center fade show`;
      setTimeout(() => el.classList.remove('show'), 4000);
    }
  }
}
