import { AfterViewInit, Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import SignaturePad from 'signature_pad';
import { NgIf, NgFor, DatePipe, NgClass, SlicePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Navbar } from '../../shared/navbar/navbar';

// Leaflet type declarations
declare var L: any;

type Section = 'overview' | 'signature' | 'leave' | 'history';

interface LogEntry {
  date: Date;
  timeIn?: Date |null;
  timeOut?: Date|null;
  action: string;
  image: string | null;
  location?: string;
  status?: string;
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

interface OverviewStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  description?: string;
  progress?: number;
  action?: string;
  subtitle?: string;
  trend?: string;
}

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  description?: string;
}

@Component({
  selector: 'app-intern-dashboard',
  standalone: true,
  templateUrl: './intern-dashboard.html',
  styleUrls: ['./intern-dashboard.css'],
  imports: [NgIf, NgFor, NgClass, DatePipe, FormsModule, SlicePipe, Navbar, DecimalPipe]
})
export class InternDashboard implements AfterViewInit {
  // ======== SIDEBAR ========
  isSidebarExpanded: boolean = true;

  // ======== NAVIGATION ========
  navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'bi-speedometer2' },
    { key: 'signature', label: 'Signature', icon: 'bi-pencil-square' },
    { key: 'leave', label: 'Leave Request', icon: 'bi-calendar2-check' },
    { key: 'history', label: 'Attendance History', icon: 'bi-clock-history' }
  ];
  activeSection: Section = 'overview';

  // ======== OVERVIEW STATISTICS ========
  currentDate: string = '';
  overviewStats: OverviewStat[] = [];
  recentAttendanceLogs: LogEntry[] = [];
  recentLeaveRequests: LeaveRequest[] = [];

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
  
  // ======== LOCATIONS ========
  locations: Location[] = [];
  currentLocation: { lat: number; lng: number } | null = null;
  nearestLocationName: string = '';
  locationAlertShown: boolean = false;
  locationMap: any = null;
  locationMapMarkers: any[] = [];
  userLocationMarker: any = null;
  isLocationMapReady: boolean = false;

  // ======== ATTENDANCE ========
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  signedInToday = false;
  signedOutToday = false;
  filterStartDate: string = '';
  filterEndDate: string = '';
  attendanceStatusFilter: string = '';
  attendanceSearchQuery: string = '';

  // ======== LEAVE REQUEST ========
  leaveType: string = '';
  startDate: string = '';
  endDate: string = '';
  leaveReason: string = '';
  attachment: File | null = null;
  leaveRequests: LeaveRequest[] = [];
  filteredLeaveRequests: LeaveRequest[] = [];
  leaveFilterStatus: string = '';
  leaveSearchQuery: string = '';

  // ======== REPORT ========
  reportStartDate: string = '';
  reportEndDate: string = '';
  reportLogs: LogEntry[] = [];
  reportIncludeWeekends: boolean = false;
  reportIncludeSignatures: boolean = true;

  // ======== ALERT MESSAGE ========
  message: string = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.updateCurrentDate();
    this.loadData();
    this.loadLocations(); // Load locations from localStorage
    this.checkTodayStatus();
    this.filteredLogs = [...this.logs].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    this.reportLogs = [...this.logs];
    this.loadLeaveRequests();
    this.filterLeaveRequests();
    this.calculateOverviewStats();
    this.loadRecentData();
    
    // Load locations and detect user location when signature section is active
    if (this.activeSection === 'signature') {
      this.loadLocations();
      this.detectUserLocation();
      setTimeout(() => {
        this.initLocationMap();
      }, 500);
    }
  }

  // ======== SIDEBAR ========
  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  logout(): void {
    // Clear local storage
    localStorage.removeItem('intern');
    localStorage.removeItem('attendanceLogs');
    localStorage.removeItem('leaveRequests');
    localStorage.removeItem('savedSignature');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  // ======== NAVIGATION ========
  showSection(section: Section): void {
    this.activeSection = section;
    // Detect user location and initialize map when signature section is shown
    if (section === 'signature') {
      this.loadLocations();
      this.detectUserLocation();
      setTimeout(() => {
        this.initLocationMap();
      }, 300);
    }
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

  // ======== LOCATIONS & MAP ========
  loadLocations(): void {
    const saved = localStorage.getItem('adminLocations');
    if (saved) {
      try {
        this.locations = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading locations:', e);
        this.locations = [];
      }
    }
  }

  detectUserLocation(): void {
    if (!navigator.geolocation) {
      this.showMessage('Geolocation is not supported by your browser.', 'danger');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.updateNearestLocation();
        this.checkLocationValidity();
        this.updateLocationMap();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error getting location:', error);
        this.showMessage('Unable to retrieve your location. Please enable location services.', 'danger');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch position for updates
    if (navigator.geolocation.watchPosition) {
      navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.updateNearestLocation();
          this.checkLocationValidity();
          this.updateLocationMap();
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }
  }

  initLocationMap(): void {
    if (this.locationMap || !this.currentLocation || this.locations.length === 0) {
      return;
    }

    const mapElement = document.getElementById('intern-location-map');
    if (!mapElement || typeof L === 'undefined') {
      // Retry if Leaflet not loaded yet
      setTimeout(() => this.initLocationMap(), 200);
      return;
    }

    try {
      // Initialize map centered on user location
      this.locationMap = L.map(mapElement).setView([this.currentLocation.lat, this.currentLocation.lng], 15);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.locationMap);

      this.isLocationMapReady = true;
      this.updateLocationMap();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error initializing location map:', error);
    }
  }

  updateLocationMap(): void {
    if (!this.locationMap || !this.isLocationMapReady || !this.currentLocation || typeof L === 'undefined') {
      return;
    }

    // Clear existing markers
    this.locationMapMarkers.forEach(marker => {
      if (marker && marker.remove) {
        this.locationMap.removeLayer(marker);
      }
      if ((marker as any).circle && (marker as any).circle.remove) {
        this.locationMap.removeLayer((marker as any).circle);
      }
    });
    this.locationMapMarkers = [];

    // Remove user marker if exists
    if (this.userLocationMarker) {
      this.locationMap.removeLayer(this.userLocationMarker);
    }

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `<div style="width: 20px; height: 20px; border-radius: 50%; background: #28a745; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.userLocationMarker = L.marker([this.currentLocation.lat, this.currentLocation.lng], {
      icon: userIcon,
      title: 'Your Location'
    }).addTo(this.locationMap);

    // Add popup with distance info
    let popupContent = '<strong>Your Location</strong><br>';
    this.locations.forEach(loc => {
      const distance = this.getDistanceToLocation(loc);
      popupContent += `${loc.name}: ${Math.round(distance)}m<br>`;
    });
    this.userLocationMarker.bindPopup(popupContent);

    // Add markers and circles for each allowed location
    this.locations.forEach(location => {
      const distance = this.getDistanceToLocation(location);
      const isWithin = distance <= location.radius;

      // Create marker icon based on whether user is within range
      const markerColor = isWithin ? '#28a745' : '#dc3545';
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width: 18px; height: 18px; border-radius: 50%; background: ${markerColor}; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker([location.latitude, location.longitude], {
        icon: customIcon,
        title: location.name
      }).addTo(this.locationMap);

      // Create circle for radius
      const circleColor = isWithin ? '#28a745' : '#dc3545';
      const circle = L.circle([location.latitude, location.longitude], {
        radius: location.radius,
        fillColor: circleColor,
        fillOpacity: 0.2,
        color: circleColor,
        weight: 2,
        opacity: 0.6
      }).addTo(this.locationMap);

      // Create popup with distance
      const popupContent = `
        <div class="p-2">
          <h6 class="fw-bold mb-1">${location.name}</h6>
          <p class="mb-1 small">${location.description || 'No description'}</p>
          <p class="mb-1 small"><strong>Radius:</strong> ${location.radius}m</p>
          <p class="mb-0 small ${isWithin ? 'text-success' : 'text-danger'}">
            <strong>Distance:</strong> ${Math.round(distance)}m ${isWithin ? '(Within range)' : '(Out of range)'}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      (marker as any).circle = circle;
      this.locationMapMarkers.push(marker);
    });

    // Fit map to show all locations and user
    if (this.locations.length > 0) {
      const bounds = L.latLngBounds([
        [this.currentLocation.lat, this.currentLocation.lng],
        ...this.locations.map(loc => [loc.latitude, loc.longitude])
      ]);
      this.locationMap.fitBounds(bounds, { padding: [20, 20] });
    }
  }

  getDistanceToLocation(location: Location): number {
    if (!this.currentLocation) {
      return 0;
    }
    return this.getDistance(
      this.currentLocation.lat,
      this.currentLocation.lng,
      location.latitude,
      location.longitude
    );
  }

  checkLocationValidity(): void {
    if (!this.currentLocation || this.locations.length === 0) {
      return;
    }

    // Only show alert if location is invalid and we haven't shown it recently
    if (!this.isWithinAllowedLocation() && !this.locationAlertShown) {
      this.showLocationInvalidAlert();
      this.locationAlertShown = true;
      
      // Reset flag after 30 seconds to allow showing again if user moves
      setTimeout(() => {
        this.locationAlertShown = false;
      }, 30000);
    } else if (this.isWithinAllowedLocation()) {
      // Reset flag when user enters valid location
      this.locationAlertShown = false;
    }
  }

  showLocationInvalidAlert(): void {
    Swal.fire({
      icon: 'error',
      title: 'Location Invalid',
      html: `
        <div class="text-start">
          <p class="mb-3"><strong>You are not within any allowed sign-in location.</strong></p>
          <p class="mb-3">Please move to one of the allowed locations listed below to sign in.</p>
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Tip:</strong> Make sure your device's location services are enabled and accurate.
          </div>
        </div>
      `,
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc3545',
      width: '600px',
      allowOutsideClick: true,
      allowEscapeKey: true,
      customClass: {
        popup: 'location-alert-popup',
        title: 'location-alert-title',
        htmlContainer: 'location-alert-content'
      }
    });
  }

  updateNearestLocation(): void {
    if (!this.currentLocation || this.locations.length === 0) {
      this.nearestLocationName = '';
      return;
    }

    let nearest = this.locations[0];
    let minDistance = this.getDistance(
      this.currentLocation.lat,
      this.currentLocation.lng,
      nearest.latitude,
      nearest.longitude
    );

    for (const loc of this.locations.slice(1)) {
      const d = this.getDistance(
        this.currentLocation.lat,
        this.currentLocation.lng,
        loc.latitude,
        loc.longitude
      );
      if (d < minDistance) {
        minDistance = d;
        nearest = loc;
      }
    }

    this.nearestLocationName = nearest.name;
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

  isWithinAllowedLocation(): boolean {
    if (!this.currentLocation || this.locations.length === 0) {
      return false;
    }

    return this.locations.some(location => {
      const distance = this.getDistance(
        this.currentLocation!.lat,
        this.currentLocation!.lng,
        location.latitude,
        location.longitude
      );
      return distance <= location.radius;
    });
  }

  isWithinLocation(location: Location): boolean {
    if (!this.currentLocation) {
      return false;
    }

    const distance = this.getDistance(
      this.currentLocation.lat,
      this.currentLocation.lng,
      location.latitude,
      location.longitude
    );
    return distance <= location.radius;
  }

  getProgressBarLabel(stat: OverviewStat): string {
    return (stat.label || 'Progress') + ' progress: ' + (stat.progress || 0) + '%';
  }

  // ======== SIGN IN / SIGN OUT ========

  canSignInNow(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    // Allowed between 08:00 and 13:00 (exclusive)
    return hour >= 8 && (hour < 13 || (hour === 13 && minute === 0));
  }

  isBeforeSignInTime(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    // Check if time is before 08:00
    return hour < 8;
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
    if (!this.currentLocation || !this.isWithinAllowedLocation()) {
      this.showLocationInvalidAlert();
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
      location: this.nearestLocationName
    });
    this.signedInToday = true;
    this.saveData();
    this.showMessage(`Signed in successfully at ${this.nearestLocationName}`, 'success');
  }

  signOut(): void {
    if (!this.signedInToday) {
      this.showMessage('You need to sign in first.', 'warning');
      return;
    }
    if (!this.currentLocation || !this.isWithinAllowedLocation()) {
      this.showLocationInvalidAlert();
      return;
    }

    // Show confirmation alert before signing out
    Swal.fire({
      title: 'Confirm Sign Out',
      text: 'Are you sure you want to sign out? Your status will be marked as "Left Early".',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Sign Out',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        const now = new Date();
        this.logs.push({
          date: now,
          timeOut: now,
          action: 'Signed Out',
          image: this.savedSignature,
          location: this.nearestLocationName
        });
        this.signedOutToday = true;
        this.saveData();
        this.showMessage(`Signed out successfully at ${this.nearestLocationName}. Status: Left Early`, 'success');
      }
    });
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
    if (signedIn && signedOut) return 'Left Early';
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
    this.calculateOverviewStats();
    this.loadRecentData();
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
    if (!this.isLeaveFormValid()) {
      this.showMessage('Please fill in all required fields correctly.', 'danger');
      return;
    }

    // Validate dates
    if (new Date(this.endDate) < new Date(this.startDate)) {
      this.showMessage('End date must be after start date.', 'danger');
      return;
    }

    // Show confirmation
    Swal.fire({
      title: 'Confirm Leave Request',
      html: `
        <div class="text-start">
          <p><strong>Type:</strong> ${this.leaveType}</p>
          <p><strong>Start Date:</strong> ${new Date(this.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(this.endDate).toLocaleDateString()}</p>
          <p><strong>Duration:</strong> ${this.getLeaveDuration()} day(s)</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Submit Request',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        const newRequest: LeaveRequest = {
          id: Date.now(),
          type: this.leaveType,
          startDate: this.startDate,
          endDate: this.endDate,
          status: 'Pending',
          attachment: this.attachment?.name,
          supervisorEmail: this.intern.supervisorEmail,
          email: this.intern.email,
          name: this.intern.name,
          reason: this.leaveReason || undefined
        };
        const existing = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
        existing.push(newRequest);
        localStorage.setItem('leaveRequests', JSON.stringify(existing));
        this.resetLeaveForm();
        this.loadLeaveRequests();
        this.calculateOverviewStats();
        this.loadRecentData();
        
        Swal.fire({
          title: 'Success!',
          text: 'Your leave request has been submitted successfully.',
          icon: 'success',
          confirmButtonColor: '#0d6efd'
        });
      }
    });
  }

  isLeaveFormValid(): boolean {
    return !!(this.leaveType && this.startDate && this.endDate && this.attachment);
  }

  resetLeaveForm(): void {
    this.leaveType = '';
    this.startDate = '';
    this.endDate = '';
    this.leaveReason = '';
    this.attachment = null;
    const fileInput = document.getElementById('leaveAttachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getLeaveMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getLeaveMinEndDate(): string {
    return this.startDate || this.getLeaveMinDate();
  }

  onStartDateChange(): void {
    if (this.startDate && this.endDate && new Date(this.endDate) < new Date(this.startDate)) {
      this.endDate = this.startDate;
    }
  }

  onEndDateChange(): void {
    if (this.startDate && this.endDate && new Date(this.endDate) < new Date(this.startDate)) {
      this.showMessage('End date cannot be before start date.', 'warning');
      this.endDate = this.startDate;
    }
  }

  getLeaveDuration(): number {
    if (!this.startDate || !this.endDate) {
      return 0;
    }
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  getRequestDuration(leave: LeaveRequest): number {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  removeAttachment(): void {
    this.attachment = null;
    const fileInput = document.getElementById('leaveAttachment') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Approved':
      case 'Present':
        return 'bi bi-check-circle-fill';
      case 'Pending':
        return 'bi bi-clock-fill';
      case 'Declined':
      case 'Absent':
        return 'bi bi-x-circle-fill';
      case 'On Leave':
        return 'bi bi-calendar-check-fill';
      case 'Left Early':
        return 'bi bi-arrow-left-circle-fill';
      default:
        return 'bi bi-circle';
    }
  }

  getLeaveStatusIcon(status: string): string {
    switch (status) {
      case 'Approved':
        return 'bi bi-check-circle-fill';
      case 'Pending':
        return 'bi bi-clock-fill';
      case 'Declined':
        return 'bi bi-x-circle-fill';
      default:
        return 'bi bi-circle';
    }
  }

  getLeaveTypeIcon(type: string): string {
    switch (type) {
      case 'Annual Leave':
        return 'bi bi-sun-fill';
      case 'Sick Leave':
        return 'bi bi-heart-pulse-fill';
      case 'Family Responsibility':
        return 'bi bi-people-fill';
      case 'Study Leave':
        return 'bi bi-book-fill';
      case 'Emergency Leave':
        return 'bi bi-exclamation-triangle-fill';
      default:
        return 'bi bi-calendar-event-fill';
    }
  }

  filterLeaveRequests(): void {
    this.filteredLeaveRequests = this.leaveRequests.filter(leave => {
      const matchesStatus = !this.leaveFilterStatus || leave.status === this.leaveFilterStatus;
      const matchesSearch = !this.leaveSearchQuery || 
        leave.type.toLowerCase().includes(this.leaveSearchQuery.toLowerCase()) ||
        leave.id.toString().includes(this.leaveSearchQuery) ||
        (leave.reason && leave.reason.toLowerCase().includes(this.leaveSearchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }

  loadLeaveRequests(): void {
    const allRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    this.leaveRequests = allRequests.filter((req: LeaveRequest) => req.email === this.intern.email)
      .sort((a: LeaveRequest, b: LeaveRequest) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    this.filteredLeaveRequests = [...this.leaveRequests];
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

    let filtered = this.logs.filter(log => {
      const logDate = new Date(log.date);
      
      // Date range filter
      if (start && logDate < start) return false;
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        if (logDate > endDate) return false;
      }
      
      // Status filter
      if (this.attendanceStatusFilter) {
        const status = this.getAttendanceStatus(log.date);
        if (status !== this.attendanceStatusFilter) return false;
      }
      
      // Search filter
      if (this.attendanceSearchQuery) {
        const searchLower = this.attendanceSearchQuery.toLowerCase();
        const location = log.location?.toLowerCase() || '';
        if (!location.includes(searchLower)) return false;
      }
      
      return true;
    });

    // Sort by date descending
    this.filteredLogs = filtered.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  resetFilter(): void {
    this.filteredLogs = [...this.logs];
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.attendanceStatusFilter = '';
    this.attendanceSearchQuery = '';
    this.filterHistory();
  }

  onFilterDateChange(): void {
    this.filterHistory();
  }

  setDateRange(range: 'today' | 'week' | 'month'): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (range) {
      case 'today':
        this.filterStartDate = today.toISOString().split('T')[0];
        this.filterEndDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
        this.filterStartDate = weekStart.toISOString().split('T')[0];
        this.filterEndDate = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.filterStartDate = monthStart.toISOString().split('T')[0];
        this.filterEndDate = today.toISOString().split('T')[0];
        break;
    }
    this.filterHistory();
  }

  getFilterDateRange(): string {
    if (!this.filterStartDate && !this.filterEndDate) {
      return 'all time';
    }
    if (this.filterStartDate && this.filterEndDate) {
      if (this.filterStartDate === this.filterEndDate) {
        return new Date(this.filterStartDate).toLocaleDateString();
      }
      return `${new Date(this.filterStartDate).toLocaleDateString()} - ${new Date(this.filterEndDate).toLocaleDateString()}`;
    }
    if (this.filterStartDate) {
      return `from ${new Date(this.filterStartDate).toLocaleDateString()}`;
    }
    if (this.filterEndDate) {
      return `until ${new Date(this.filterEndDate).toLocaleDateString()}`;
    }
    return 'all time';
  }

  getAttendanceStats(): { present: number; absent: number; onLeave: number; leftEarly: number } {
    const stats = { present: 0, absent: 0, onLeave: 0, leftEarly: 0 };
    const processedDates = new Set<string>();
    
    this.filteredLogs.forEach(log => {
      const dateStr = new Date(log.date).toDateString();
      
      // Only count each date once
      if (!processedDates.has(dateStr)) {
        processedDates.add(dateStr);
        const status = this.getAttendanceStatus(log.date);
        if (status === 'Present') stats.present++;
        else if (status === 'Absent') stats.absent++;
        else if (status === 'On Leave') stats.onLeave++;
        else if (status === 'Left Early') stats.leftEarly++;
      }
    });
    
    return stats;
  }

  getAttendanceRecords(): any[] {
    // Group logs by date and create records
    const recordsMap = new Map<string, any>();
    
    this.filteredLogs.forEach(log => {
      const dateStr = new Date(log.date).toDateString();
      
      if (!recordsMap.has(dateStr)) {
        recordsMap.set(dateStr, {
          date: new Date(log.date),
          timeIn: null,
          timeOut: null,
          image: null,
          location: null,
          status: this.getAttendanceStatus(log.date),
          duration: null
        });
      }
      
      const record = recordsMap.get(dateStr)!;
      
      if (log.action === 'Signed In' && log.timeIn) {
        record.timeIn = log.timeIn;
        record.image = log.image;
        record.location = log.location;
      }
      
      if (log.action === 'Signed Out' && log.timeOut) {
        record.timeOut = log.timeOut;
        if (log.location) record.location = log.location;
      }
    });
    
    // Calculate duration for each record
    recordsMap.forEach(record => {
      if (record.timeIn && record.timeOut) {
        const diff = new Date(record.timeOut).getTime() - new Date(record.timeIn).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        record.duration = `${hours}h ${minutes}m`;
      }
    });
    
    return Array.from(recordsMap.values()).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  viewSignature(image: string): void {
    Swal.fire({
      imageUrl: image,
      imageAlt: 'Signature',
      showCloseButton: true,
      showConfirmButton: false,
      width: '600px',
      padding: '2rem'
    });
  }

  checkWeekend(dateString: string): boolean {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  generateReport(): void {
    if (!this.reportStartDate || !this.reportEndDate) {
      this.showMessage('Please select both start and end dates.', 'warning');
      return;
    }

    const start = new Date(this.reportStartDate);
    const end = new Date(this.reportEndDate);
    
    if (start > end) {
      this.showMessage('Start date cannot be after end date.', 'danger');
      return;
    }

    // Generate dates based on include weekends option
    const allDates = this.reportIncludeWeekends 
      ? this.generateAllDates(start, end)
      : this.generateWeekdays(start, end);

    this.reportLogs = allDates.map(date => {
      const existingLog = this.logs.find(log => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === date.toDateString();
      });
      
      if (existingLog) {
        return {
          ...existingLog,
          status: this.getAttendanceStatus(date)
        };
      }

      // No log found → create placeholder
      return {
        date: date,
        image: null,
        location: undefined,
        timeIn: null,
        timeOut: null,
        action: this.getAttendanceStatus(date),
        status: this.getAttendanceStatus(date)
      };
    });

    this.showMessage(`Report generated successfully! Found ${this.reportLogs.length} record(s).`, 'success');
  }

  generateAllDates(start: Date, end: Date): Date[] {
    const dates: Date[] = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  getReportRecords(): any[] {
    const recordsMap = new Map<string, any>();
    
    this.reportLogs.forEach(log => {
      const dateStr = new Date(log.date).toDateString();
      
      if (!recordsMap.has(dateStr)) {
        recordsMap.set(dateStr, {
          date: new Date(log.date),
          timeIn: null,
          timeOut: null,
          image: null,
          location: null,
          status: log.status || this.getAttendanceStatus(log.date),
          duration: null
        });
      }
      
      const record = recordsMap.get(dateStr)!;
      
      if (log.action === 'Signed In' && log.timeIn) {
        record.timeIn = log.timeIn;
        record.image = log.image; // Signature from sign-in
        record.location = log.location;
      }
      
      if (log.action === 'Signed Out' && log.timeOut) {
        record.timeOut = log.timeOut;
        if (log.location) record.location = log.location;
        // Use signature from sign-out if available (prefer sign-out signature)
        if (log.image) {
          record.image = log.image;
        }
      }
    });
    
    // Calculate duration
    recordsMap.forEach(record => {
      if (record.timeIn && record.timeOut) {
        const diff = new Date(record.timeOut).getTime() - new Date(record.timeIn).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        record.duration = `${hours}h ${minutes}m`;
      }
    });
    
    return Array.from(recordsMap.values()).sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  getReportStats(): { totalDays: number; present: number; absent: number; onLeave: number; leftEarly: number; workingDays: number; attendanceRate: number } {
    const stats = { totalDays: 0, present: 0, absent: 0, onLeave: 0, leftEarly: 0, workingDays: 0, attendanceRate: 0 };
    const processedDates = new Set<string>();
    
    this.reportLogs.forEach(log => {
      const dateStr = new Date(log.date).toDateString();
      
      if (!processedDates.has(dateStr)) {
        processedDates.add(dateStr);
        stats.totalDays++;
        
        const day = new Date(log.date).getDay();
        if (day !== 0 && day !== 6) {
          stats.workingDays++;
        }
        
        const status = log.status || this.getAttendanceStatus(log.date);
        if (status === 'Present') stats.present++;
        else if (status === 'Absent') stats.absent++;
        else if (status === 'On Leave') stats.onLeave++;
        else if (status === 'Left Early') stats.leftEarly++;
      }
    });
    
    if (stats.workingDays > 0) {
      stats.attendanceRate = Math.round(((stats.present + stats.leftEarly) / stats.workingDays) * 100);
    }
    
    return stats;
  }

  setReportDateRange(range: 'today' | 'week' | 'month' | 'quarter' | 'year'): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (range) {
      case 'today':
        this.reportStartDate = today.toISOString().split('T')[0];
        this.reportEndDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
        this.reportStartDate = weekStart.toISOString().split('T')[0];
        this.reportEndDate = today.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        this.reportStartDate = monthStart.toISOString().split('T')[0];
        this.reportEndDate = today.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        this.reportStartDate = quarterStart.toISOString().split('T')[0];
        this.reportEndDate = today.toISOString().split('T')[0];
        break;
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        this.reportStartDate = yearStart.toISOString().split('T')[0];
        this.reportEndDate = today.toISOString().split('T')[0];
        break;
    }
    this.onReportDateChange();
  }

  onReportDateChange(): void {
    // Auto-generate report when dates change
    if (this.reportStartDate && this.reportEndDate) {
      // Don't auto-generate, let user click button
    }
  }

  getReportMinDate(): string {
    // Get the earliest date from logs, or today
    if (this.logs.length > 0) {
      const earliestLog = this.logs.reduce((earliest, log) => {
        return new Date(log.date) < new Date(earliest.date) ? log : earliest;
      });
      return new Date(earliestLog.date).toISOString().split('T')[0];
    }
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getReportMaxDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  resetReportFilter(): void {
    this.reportLogs = [];
    this.reportStartDate = '';
    this.reportEndDate = '';
    this.reportIncludeWeekends = false;
    this.reportIncludeSignatures = true;
  }

  /**
   * Helper function to extract and validate base64 image data from data URI
   * @param imageData - The image data (can be data URI or base64 string)
   * @returns Object with imageData (base64) and imageFormat (PNG/JPEG)
   */
  private extractImageData(imageData: string): { imageData: string; imageFormat: string } | null {
    if (!imageData) {
      return null;
    }

    // If it's already a base64 string without data URI prefix
    if (!imageData.startsWith('data:image')) {
      // Assume PNG if no prefix
      return { imageData: imageData, imageFormat: 'PNG' };
    }

    // Extract from data URI
    const base64Match = imageData.match(/data:image\/(\w+);base64,(.+)/);
    if (base64Match && base64Match.length >= 3) {
      const format = base64Match[1].toUpperCase();
      const base64Data = base64Match[2];
      
      // Validate format (jsPDF supports PNG and JPEG)
      if (format === 'PNG' || format === 'JPEG' || format === 'JPG') {
        return {
          imageData: base64Data,
          imageFormat: format === 'JPG' ? 'JPEG' : format
        };
      }
    }

    // Try to extract just the base64 part if format detection fails
    const base64Only = imageData.split(',')[1];
    if (base64Only) {
      return { imageData: base64Only, imageFormat: 'PNG' };
    }

    return null;
  }

  downloadReportPDF(): void {
    if (this.reportLogs.length === 0) {
      this.showMessage('Please generate a report first before downloading.', 'warning');
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const records = this.getReportRecords();
    const stats = this.getReportStats();

    // Header Section
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('Attendance Report', 14, 15);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Intern: ${this.intern.name}`, 14, 22);
    doc.text(`Department: ${this.intern.Department}`, 14, 27);
    doc.text(`Field: ${this.intern.field}`, 14, 32);
    doc.text(`Date Range: ${new Date(this.reportStartDate).toLocaleDateString()} - ${new Date(this.reportEndDate).toLocaleDateString()}`, 14, 37);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);

    // Statistics Section
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('Summary Statistics', 14, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Days: ${stats.totalDays}`, 14, 56);
    doc.text(`Working Days: ${stats.workingDays}`, 14, 61);
    doc.text(`Present: ${stats.present}`, 80, 56);
    doc.text(`Absent: ${stats.absent}`, 80, 61);
    doc.text(`On Leave: ${stats.onLeave}`, 140, 56);
    doc.text(`Left Early: ${stats.leftEarly}`, 140, 61);
    doc.text(`Attendance Rate: ${stats.attendanceRate}%`, 200, 56);

    // Store signature images with record indices
    const signatureMap = new Map<number, string>();
    records.forEach((record, index) => {
      if (record.image) {
        signatureMap.set(index, record.image);
        console.log(`Stored signature for record ${index}:`, record.image.substring(0, 50) + '...');
      }
    });
    
    console.log(`Total signatures stored: ${signatureMap.size} out of ${records.length} records`);

    // Store cell positions for signature column
    const signatureCellPositions: Array<{ x: number; y: number; width: number; height: number; recordIndex: number; page: number }> = [];

    // Prepare table data - conditionally include Status and Signature columns
    const body = records.map(record => {
      const date = new Date(record.date);
      const duration = record.duration || '-';
      
      const row = [
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        date.toLocaleDateString('en-US', { weekday: 'short' }),
        record.timeIn ? new Date(record.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
        record.timeOut ? new Date(record.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
        duration,
        record.location || '-'
      ];
      
      // Add Status column only if "Include Status" is selected
      if (this.reportIncludeWeekends) {
        row.push(record.status);
      }
      
      // Add empty string for Signature column if "Include Signatures" is selected
      if (this.reportIncludeSignatures) {
        row.push(''); // Empty string - image will be added via didDrawCell
      }
      
      return row;
    });

    // Table headers - conditionally include Status and Signature columns
    const headers = ['Date', 'Day', 'Time In', 'Time Out', 'Duration', 'Location'];
    if (this.reportIncludeWeekends) {
      headers.push('Status');
    }
    if (this.reportIncludeSignatures) {
      headers.push('Signature');
    }

    // Calculate signature column index (it's always the last column if included)
    const signatureColumnIndex = this.reportIncludeSignatures ? headers.length - 1 : -1;

    // Table with hooks to capture cell positions for signature column
    autoTable(doc, {
      head: [headers],
      body: body,
      startY: 68,
      margin: { left: 14, right: 14 },
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [13, 110, 253],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      didParseCell: (data: any) => {
        // Clear text content for signature column to prevent text from showing
        if (this.reportIncludeSignatures && data.column.index === signatureColumnIndex && data.row.index > 0) {
          data.cell.text = [''];
        }
      },
      didDrawCell: (data: any) => {
        // Capture cell positions for signature column
        // Check if this is the signature column by comparing with the calculated index
        if (this.reportIncludeSignatures && data.column.index === signatureColumnIndex && data.row.index > 0) {
          const recordIndex = data.row.index - 1;
          
          // Get current page number
          let currentPage = 1;
          try {
            const pageInfo = (doc as any).internal.getCurrentPageInfo();
            if (pageInfo && pageInfo.pageNumber) {
              currentPage = pageInfo.pageNumber;
            } else {
              currentPage = doc.getNumberOfPages() || 1;
            }
          } catch (e) {
            currentPage = doc.getNumberOfPages() || 1;
          }
          
          signatureCellPositions.push({
            x: data.cell.x,
            y: data.cell.y,
            width: data.cell.width,
            height: data.cell.height,
            recordIndex: recordIndex,
            page: currentPage
          });
          
          console.log(`Captured signature cell for record ${recordIndex} on page ${currentPage}, column index: ${data.column.index}`);
        }
      }
    });

    // Add signature images after table is drawn using captured positions
    console.log(`Adding signatures: includeSignatures=${this.reportIncludeSignatures}, cellPositions=${signatureCellPositions.length}, signatureMap=${signatureMap.size}`);
    
    if (this.reportIncludeSignatures && signatureCellPositions.length > 0) {
      signatureCellPositions.forEach((cellPos) => {
        const signatureImage = signatureMap.get(cellPos.recordIndex);
        
        console.log(`Processing cell for record ${cellPos.recordIndex}: hasImage=${!!signatureImage}`);
        
        if (signatureImage) {
          try {
            // Extract and validate image data
            const extractedImage = this.extractImageData(signatureImage);
            
            if (!extractedImage) {
              throw new Error('Failed to extract image data from signature');
            }

            // Switch to the correct page
            const totalPages = doc.getNumberOfPages();
            const targetPage = Math.min(cellPos.page, totalPages);
            doc.setPage(targetPage);
            
            // Image size to fit in cell
            const imgWidth = 20;
            const imgHeight = 10;
            
            // Calculate centered position in cell
            const x = cellPos.x + (cellPos.width / 2) - (imgWidth / 2);
            const y = cellPos.y + 2;
            
            // Validate base64 data is not empty
            if (!extractedImage.imageData || extractedImage.imageData.trim().length === 0) {
              throw new Error('Empty base64 image data');
            }
            
            // Add image to PDF with proper format
            doc.addImage(
              extractedImage.imageData,
              extractedImage.imageFormat,
              x,
              y,
              imgWidth,
              imgHeight,
              undefined, // alias
              'FAST' // compression
            );
            
            console.log(`✓ Successfully added signature for record ${cellPos.recordIndex} on page ${targetPage} (format: ${extractedImage.imageFormat})`);
          } catch (error) {
            console.error(`✗ Error adding signature image for record ${cellPos.recordIndex}:`, error);
            // Draw dash if image fails
            try {
              doc.setPage(cellPos.page);
              doc.setFontSize(8);
              doc.setTextColor(128, 128, 128);
              doc.text('-', cellPos.x + cellPos.width / 2, cellPos.y + cellPos.height / 2 + 2, { align: 'center' });
            } catch (e) {
              // Ignore errors
            }
          }
        } else {
          // No signature - draw a dash
          try {
            doc.setPage(cellPos.page);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('-', cellPos.x + cellPos.width / 2, cellPos.y + cellPos.height / 2 + 2, { align: 'center' });
          } catch (e) {
            // Ignore errors
          }
        }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    }

    // Generate filename
    const filename = `attendance_report_${this.reportStartDate}_to_${this.reportEndDate}.pdf`;
    doc.save(filename);
    
    this.showMessage('PDF report downloaded successfully!', 'success');
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
    if (this.reportLogs.length === 0) {
      this.showMessage('Please generate a report first before downloading.', 'warning');
      return;
    }

    const records = this.getReportRecords();
    const stats = this.getReportStats();

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Attendance Report Summary'],
      [''],
      ['Intern Name', this.intern.name],
      ['Department', this.intern.Department],
      ['Field', this.intern.field],
      ['Email', this.intern.email],
      [''],
      ['Report Period'],
      ['Start Date', new Date(this.reportStartDate).toLocaleDateString()],
      ['End Date', new Date(this.reportEndDate).toLocaleDateString()],
      ['Generated', new Date().toLocaleString()],
      [''],
      ['Statistics'],
      ['Total Days', stats.totalDays],
      ['Working Days', stats.workingDays],
      ['Present', stats.present],
      ['Absent', stats.absent],
      ['On Leave', stats.onLeave],
      ['Left Early', stats.leftEarly],
      ['Attendance Rate', `${stats.attendanceRate}%`],
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Attendance Data Sheet - conditionally include Status column
      const attendanceData = records.map(record => {
        const date = new Date(record.date);
        const row: any = {
          'Date': date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          'Day': date.toLocaleDateString('en-US', { weekday: 'long' }),
          'Time In': record.timeIn ? new Date(record.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
          'Time Out': record.timeOut ? new Date(record.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
          'Duration': record.duration || '-',
          'Location': record.location || '-'
        };
        
        // Add Status column only if "Include Status" is selected
        if (this.reportIncludeWeekends) {
          row['Status'] = record.status;
        }
        
        return row;
      });

      const attendanceWs = XLSX.utils.json_to_sheet(attendanceData);
      
      // Set column widths - conditionally include Status column width
      const columnWidths = [
        { wch: 12 }, // Date
        { wch: 12 }, // Day
        { wch: 10 }, // Time In
        { wch: 10 }, // Time Out
        { wch: 10 }, // Duration
        { wch: 20 }  // Location
      ];
      
      if (this.reportIncludeWeekends) {
        columnWidths.push({ wch: 12 }); // Status
      }
      
      attendanceWs['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, attendanceWs, 'Attendance Data');

    // Generate filename
    const filename = `attendance_report_${this.reportStartDate}_to_${this.reportEndDate}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    this.showMessage('Excel report downloaded successfully!', 'success');
  }

  // ======== OVERVIEW STATISTICS ========
  updateCurrentDate(): void {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  calculateOverviewStats(): void {
    // Get all weekday dates from the start of the current month to today
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekdays = this.generateWeekdays(startOfMonth, now);
    
    let present = 0;
    let absent = 0;
    let onLeave = 0;
    let leftEarly = 0;

    weekdays.forEach(date => {
      const status = this.getAttendanceStatus(date);
      if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
      else if (status === 'On Leave') onLeave++;
      else if (status === 'Left Early') leftEarly++;
    });

    const totalDays = weekdays.length;
    const attendanceRate = totalDays > 0 ? Math.round(((present + leftEarly) / totalDays) * 100) : 0;

    // Get today's status
    const todayStatus = this.getTodayStatus();

    // Calculate progress for attendance (target is 80%)
    const attendanceProgress = Math.min((attendanceRate / 80) * 100, 100);

    this.overviewStats = [
      {
        label: 'Days Present',
        value: present,
        icon: 'bi-check-circle-fill',
        color: 'success',
        description: `Out of ${totalDays} working days this month`,
        subtitle: `${totalDays} total days`,
        action: 'history',
        trend: present > 0 ? 'up' : 'neutral'
      },
      {
        label: 'Days Absent',
        value: absent,
        icon: 'bi-x-circle-fill',
        color: 'danger',
        description: `Missed ${absent} day${absent !== 1 ? 's' : ''} this month`,
        subtitle: `${totalDays} total days`,
        action: 'history',
        trend: absent > 0 ? 'down' : 'neutral'
      },
      {
        label: 'On Leave',
        value: onLeave,
        icon: 'bi-calendar-check-fill',
        color: 'warning',
        description: `${onLeave} approved leave day${onLeave !== 1 ? 's' : ''}`,
        subtitle: 'Approved requests',
        action: 'leave',
        trend: 'neutral'
      },
      {
        label: 'Attendance Rate',
        value: `${attendanceRate}%`,
        icon: 'bi-graph-up-arrow',
        color: 'primary',
        description: attendanceRate >= 80 ? 'Excellent attendance!' : attendanceRate >= 60 ? 'Good attendance' : 'Needs improvement',
        progress: attendanceProgress,
        subtitle: `Target: 80%`,
        action: 'history',
        trend: attendanceRate >= 80 ? 'up' : attendanceRate >= 60 ? 'neutral' : 'down'
      },
      {
        label: 'Current Status',
        value: todayStatus,
        icon: this.getStatusIcon(todayStatus),
        color: this.getStatusColor(todayStatus),
        description: this.getStatusDescription(todayStatus),
        subtitle: 'Today\'s status',
        action: todayStatus === 'Absent' || todayStatus === 'Left Early' ? 'signature' : 'history',
        trend: 'neutral'
      }
    ];
  }

  getStatusDescription(status: string): string {
    switch(status) {
      case 'Present': return 'You have signed in and out today';
      case 'Absent': return 'You haven\'t signed in today';
      case 'On Leave': return 'You are on approved leave';
      case 'Left Early': return 'You signed in but haven\'t signed out';
      default: return 'Status unknown';
    }
  }

  handleStatCardClick(stat: OverviewStat): void {
    if (stat.action) {
      this.showSection(stat.action as Section);
    }
  }

  getTodayStatus(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if on leave
    const onLeave = this.leaveRequests.some(req => {
      if (req.status === 'Approved') {
        const start = new Date(req.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(req.endDate);
        end.setHours(23, 59, 59, 999);
        return today >= start && today <= end;
      }
      return false;
    });

    if (onLeave) return 'On Leave';
    if (this.signedInToday && this.signedOutToday) return 'Left Early';
    if (this.signedInToday && !this.signedOutToday) return 'Left Early';
    return 'Absent';
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'Present': return 'success';
      case 'Absent': return 'danger';
      case 'On Leave': return 'warning';
      case 'Left Early': return 'info';
      default: return 'secondary';
    }
  }

  loadRecentData(): void {
    // Get recent attendance logs (last 5 weekdays)
    const weekdays = this.generateWeekdays(
      this.getMondayOfCurrentWeek(),
      this.getFridayOfCurrentWeek()
    );
    this.recentAttendanceLogs = this.getFullWeekLogs().slice(0, 5);

    // Get recent leave requests (last 5)
    this.recentLeaveRequests = this.leaveRequests
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);
  }

}
