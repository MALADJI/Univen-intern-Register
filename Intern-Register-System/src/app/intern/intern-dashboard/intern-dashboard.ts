import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';
import { NgIf, NgFor, DatePipe, NgClass, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';


type Section = 'signature' | 'leave' | 'history';

interface LogEntry {
  date: Date;
  timeIn?: Date |null;
  timeOut?: Date|null;
  action: string;
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
  reason?: string
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
    { name: 'Old Education', lat: -22.97597675802189, lng: 30.445261817098814 },
    { name: 'ICT 2', lat: -23.02007860135934, lng: 30.510063387523985},
    { name: 'Main Admin', lat: -22.97581470686749, lng: 30.444022008466607 },
  ];

  maxDistanceMeters = 60;   // max distance allowed
  locationTolerance = 5;    // rounding tolerance for GPS jitter

  // ======== ATTENDANCE ========
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  signedInToday = false;
  signedOutToday = false;
  filterStartDate: string = '';
  filterEndDate: string = '';

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

    const readings = 5;
    const delay = 300;
    const coordsArray: { lat: number; lng: number }[] = [];

    const collectReading = (index: number) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          coordsArray.push({ lat: position.coords.latitude, lng: position.coords.longitude });
          if (index < readings - 1) {
            setTimeout(() => collectReading(index + 1), delay);
          } else {
            const avgLat = coordsArray.reduce((sum, c) => sum + c.lat, 0) / coordsArray.length;
            const avgLng = coordsArray.reduce((sum, c) => sum + c.lng, 0) / coordsArray.length;
            this.currentUserCoordinates = { lat: avgLat, lng: avgLng };
          }
        },
        () => this.showMessage('Unable to retrieve your location.', 'danger'),
        { enableHighAccuracy: true }
      );
    };

    collectReading(0);
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  isWithinAllowedLocation(lat: number, lng: number): boolean {
    return this.allowedLocations.some(loc => {
      const distance = this.getDistance(lat, lng, loc.lat, loc.lng);
      return distance <= this.maxDistanceMeters + this.locationTolerance;
    });
  }

  get nearestBuilding(): string {
    if (!this.currentUserCoordinates) return '-';

    let nearest = this.allowedLocations[0];
    let minDistance = this.getDistance(
      this.currentUserCoordinates.lat,
      this.currentUserCoordinates.lng,
      nearest.lat,
      nearest.lng
    );

    for (const loc of this.allowedLocations.slice(1)) {
      const d = this.getDistance(
        this.currentUserCoordinates.lat,
        this.currentUserCoordinates.lng,
        loc.lat,
        loc.lng
      );
      if (d < minDistance) {
        minDistance = d;
        nearest = loc;
      }
    }

    const roundedDistance = Math.round(minDistance / 5) * 5;
    return `${nearest.name} (~${roundedDistance} m away)`;
  }

  // ======== SIGN IN / SIGN OUT ========

  canSignInNow(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    // Allowed between 08:00 and 13:00 (exclusive)
    return hour >= 8 && (hour < 13 || (hour === 13 && minute === 0));
  }

  canSignOutNow(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    // Allowed between 16:30 and 17:00
    const afterStart = hour > 16 || (hour === 16 && minute >= 30);
    const beforeEnd = hour < 17;
    return afterStart && beforeEnd;
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
      this.showMessage('Sign in allowed only between 08:00 and 13:00.', 'warning');
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
      this.showMessage('Sign out allowed only between 16:30 and 17:00.', 'warning');
      return;
    }
    if (!this.currentUserCoordinates || !this.isWithinAllowedLocation(this.currentUserCoordinates.lat, this.currentUserCoordinates.lng)) {
      this.showMessage('Cannot sign out. You are out of the allowed range!', 'danger');
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
      return day >= 1 && day <= 5;
    });
  }

  getAttendanceStatus(date: Date): string {
    const logsForDate = this.logs.filter(
      log => new Date(log.date).toDateString() === new Date(date).toDateString()
    );

    const signedIn = logsForDate.some(log => log.action === 'Signed In');
    const signedOut = logsForDate.some(log => log.action === 'Signed Out');

    const onLeave = this.leaveRequests.some(req => {
      if (req.status === 'Approved') {
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        return new Date(date) >= start && new Date(date) <= end;
      }
      return false;
    });

    if (onLeave) return 'On Leave';
    if (signedIn && signedOut) return 'Present';
    if (signedIn && !signedOut) return 'Left Early';
    return 'Absent';
  }


  // ✅ Generate weekdays (Mon–Fri) between two dates
  generateWeekdays(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (day !== 0 && day !== 6) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // ✅ Create combined list including Absent / On Leave days
  getFullWeekLogs(): any[] {
    if (!this.logs || this.logs.length === 0) return [];

    const allDates = this.generateWeekdays(
      this.getMondayOfCurrentWeek(),
      this.getFridayOfCurrentWeek()
    );

    return allDates.map(date => {
      const existingLogs = this.logs.filter(
        log => new Date(log.date).toDateString() === date.toDateString()
      );

      if (existingLogs.length > 0) {
        return existingLogs[0]; // existing attendance entry
      } else {
        // No log found → create placeholder record
        return {
          date: date,
          image: null,
          location: '-',
          timeIn: null,
          timeOut: null,
          action: this.getAttendanceStatus(date),
        };
      }
    });
  }

// ✅ Helper to get Monday and Friday of current week
  getMondayOfCurrentWeek(): Date {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(now.setDate(diff));
  }

  getFridayOfCurrentWeek(): Date {
    const monday = this.getMondayOfCurrentWeek();
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return friday;
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

    if (!this.attachment) {
      this.showMessage('Please upload a supporting document before submitting your leave request.', 'danger');
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

// ======== ALERT MESSAGE (SweetAlert2) ========
  showMessage(msg: string, type: 'success' | 'danger' | 'warning'): void {
    let icon: 'success' | 'error' | 'warning' = 'success';
    if (type === 'danger') icon = 'error';
    if (type === 'warning') icon = 'warning';

    Swal.fire({
      icon: icon,
      title: msg,
      showConfirmButton: false,
      timer: 2500,
      toast: true,
      position: 'center',
    });
  }


  filterHistory(): void {
    const start = this.filterStartDate ? new Date(this.filterStartDate) : null;
    const end = this.filterEndDate ? new Date(this.filterEndDate) : null;

    this.filteredLogs = this.logs.filter(log => {
      const logDate = new Date(log.date);
      if (start && logDate < start) return false;
      if (end && logDate > end) return false;
      return true;
    });
  }

  resetFilter(): void {
    this.filteredLogs = [...this.logs];
    this.filterStartDate = '';
    this.filterEndDate = '';
  }

  checkWeekend(dateString: string): boolean {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  generateReport(): void {
    const start = this.reportStartDate ? new Date(this.reportStartDate) : this.getMondayOfCurrentWeek();
    const end = this.reportEndDate ? new Date(this.reportEndDate) : this.getFridayOfCurrentWeek();

    const allDates = this.generateWeekdays(start, end);

    this.reportLogs = allDates.map(date => {
      const existingLog = this.logs.find(log => new Date(log.date).toDateString() === date.toDateString());
      if (existingLog) return existingLog;

      // No log found → create placeholder
      return {
        date: date,
        image: null,
        location: '-',
        timeIn: null,
        timeOut: null,
        action: this.getAttendanceStatus(date)
      };
    });
  }


  resetReportFilter(): void {
    this.reportLogs = [...this.logs];
    this.reportStartDate = '';
    this.reportEndDate = '';
  }

  downloadReportPDF(): void {
    const doc = new jsPDF();

    // Add heading
    const internName = this.intern || 'Unknown Intern';
    doc.setFontSize(16);
    doc.text(`Register(${internName})`, doc.internal.pageSize.getWidth() / 15, 6, { align: "left" });
    // Track week changes for spacing
    let currentWeekNumber = -1;

    // Prepare table body WITHOUT the image
    const body = this.reportLogs.map(log => {
      const logDate = new Date(log.date);
      const weekNumber = this.getWeekNumber(logDate);

      // Empty row between weeks
      if (weekNumber !== currentWeekNumber && currentWeekNumber !== -1) {
        currentWeekNumber = weekNumber;
        return ['', '', '', '', '', '', '']; // empty row for spacing
      }
      currentWeekNumber = weekNumber;

      return [
        log.date.toDateString(),
        log.date.toLocaleDateString('en-US', { weekday: 'long' }),
        log.timeIn ? log.timeIn.toLocaleTimeString() : '-',
        log.timeOut ? log.timeOut.toLocaleTimeString() : '-',
        log.action,
        log.location || '-',
        '' // leave the signature column empty for now
      ];
    });

    autoTable(doc, {
      head: [['Date', 'Day', 'Time In', 'Time Out', 'Status', 'Location', 'Signature']],
      body: body,
      startY: 10,
      margin: { top: 10 },
      styles: { cellPadding: 2 },
      didDrawCell: (data) => {
        // Only add image if signature exists
        const log = this.reportLogs[data.row.index];
        if (data.column.index === 6 && log.image && data.row.index !== 6) {
          const imgProps = doc.getImageProperties(log.image);
          const ratio = imgProps.width / imgProps.height;
          const imgWidth = 25; // max width for signature
          const imgHeight = imgWidth / ratio;

          const x = data.cell.x + 2;
          const y = data.cell.y + 2;

          doc.addImage(log.image, 'PNG', x, y, imgWidth, imgHeight);
        }
      }
    });

    doc.save('attendance_report.pdf');
  }



// Helper function to get ISO week number
  getWeekNumber(date: Date): number {
    const tempDate = new Date(date.getTime());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
    const yearStart = new Date(tempDate.getFullYear(), 0, 1);
    return Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }




  downloadReportExcel(): void {
    const ws = XLSX.utils.json_to_sheet(

      this.reportLogs.map(log => ({
        Date: log.date.toDateString(),
        Day: log.date.toLocaleDateString('en-US', { weekday: 'long' }),
        TimeIn: log.timeIn ? log.timeIn.toLocaleTimeString() : '-',
        TimeOut: log.timeOut ? log.timeOut.toLocaleTimeString() : '-',
        Status: log.action,
        Location: log.location || '-'
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    XLSX.writeFile(wb, 'attendance_report.xlsx');

  }

}
