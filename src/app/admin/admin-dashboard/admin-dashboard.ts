declare var bootstrap: any;

// Leaflet type declarations
declare var L: any;

import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
import { Navbar } from '../../shared/navbar/navbar';


// ===== Interfaces =====
interface OverviewStat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface AttendanceRecord {
  name: string;
  email?: string;
  department: string;
  present: number;
  absent: number;
  leave: number;
  attendanceRate: number;
  field?: string;
  lastActive?: string | Date;
}
interface Supervisor {
  name: string;
  email: string;
  department: string;
  field: string;
  assignedInterns?: string[];
  status: 'Active' | 'On Leave' | 'Inactive';
  active?: boolean; // Whether the supervisor is active or deactivated
}

interface LeaveRequest {
  name: string;
  email: string;
  department: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Declined';
  document?: string;
  field?: string;
  declineReason?: string; // Reason provided when declining the request
}

interface Intern {
  name: string;
  email: string;
  supervisor: string;
  employer?: string;
  department: string;
  field: string;
  status: 'Present' | 'Absent' | 'On Leave';
  active?: boolean; // Whether the intern is active or deactivated
  recordsByDay?: {
    [day: string]: {
      action: 'Signed In' | 'Signed Out' | 'On Leave' | 'Absent';
      timeIn?: Date;
      timeOut?: Date;
    };
  };
}

interface Admin {
  name: string;
  email: string;
  role: string;
  Department: string;
}

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  description?: string;
}

// ===== Typed dashboard sections =====
type DashboardSection = 'overview'|'Manage Department' |'Supervisor'| 'interns' | 'Intern Leave status' |'Attendance history'| 'reports'| 'Locations';

// ===== Component =====
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  providers: [DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  // ===== Admin Info =====
  admin: Admin | null = null;
  currentDate: string = '';

  // ===== Sidebar =====
  isSidebarExpanded: boolean = true;
  
  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  // ===== Dashboard Sections =====
  sections: DashboardSection[] = ['overview','Manage Department','Supervisor', 'interns', 'Intern Leave status','Attendance history', 'reports', 'Locations'];
  activeSection: DashboardSection = 'overview';

  // Constant mapping for template-safe comparisons
  Section = {
    Overview: 'overview' as DashboardSection,
    Departments:'Manage Department' as DashboardSection,
    Supervisor:'Supervisor'as DashboardSection,
    Interns: 'interns' as DashboardSection,
    Leave: 'Intern Leave status' as DashboardSection,
    History:'Attendance history' as DashboardSection,
    Reports: 'reports' as DashboardSection,
    Locations: 'Locations' as DashboardSection,
  };

  // Navigation items with icons
  navigationItems: Array<{ id: DashboardSection; label: string; icon: string }> = [
    { id: 'overview', label: 'Dashboard', icon: 'bi bi-grid-3x3-gap' },
    { id: 'Manage Department', label: 'Departments', icon: 'bi bi-building' },
    { id: 'Supervisor', label: 'Supervisors', icon: 'bi bi-person-badge' },
    { id: 'interns', label: 'Interns', icon: 'bi bi-people-fill' },
    { id: 'Intern Leave status', label: 'Leave Status', icon: 'bi bi-calendar-check' },
    { id: 'Attendance history', label: 'History', icon: 'bi bi-clock-history' },
    { id: 'reports', label: 'Reports', icon: 'bi bi-file-earmark-text' },
    { id: 'Locations', label: 'Locations', icon: 'bi bi-geo-alt-fill' }
  ];

  // ===== Navigation =====
  showSection(section: DashboardSection) {
    this.activeSection = section;
    // Mark leave requests as seen when viewing the leave status section
    if (section === 'Intern Leave status') {
      this.markLeaveRequestsAsSeen();
    }
    // Initialize map when Locations section is shown
    if (section === 'Locations') {
      this.getCurrentLocation();
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  logout() {
    // Logout confirmation
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  // ===== Overview Stats =====
  get overviewStats(): OverviewStat[] {
    const totalActiveInterns = this.interns.filter(i => i.active !== false).length;
    const presentCount = this.interns.filter(i => i.status === 'Present' && i.active !== false).length;
    const onLeaveCount = this.interns.filter(i => i.status === 'On Leave' && i.active !== false).length;
    const absentCount = this.interns.filter(i => i.status === 'Absent' && i.active !== false).length;

    return [
      { label: 'Total Interns', value: totalActiveInterns, icon: 'bi bi-people-fill', color: 'primary' },
      { label: 'Present Today', value: presentCount, icon: 'bi bi-check-circle', color: 'success' },
      { label: 'On Leave', value: onLeaveCount, icon: 'bi bi-clock', color: 'warning' },
      { label: 'Absent', value: absentCount, icon: 'bi bi-x-circle', color: 'danger' },
    ];
  }

  selectedStat: OverviewStat | null = null;

  openModal(stat: OverviewStat): void {
    this.selectedStat = stat;

    if (stat.label === 'Total Interns') {
      this.activeSection = 'interns';
      return;
    }

    const modalElement = document.getElementById('adminModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }

    if (stat.label === 'Absent') {
      this.attendanceFilterName = '';
      this.attendanceFilterDepartment = '';
      this.attendanceFilterField = '';
      this.filteredAttendanceFields = [];
      this.attendancePage = 1;
    }
  }


  // ===================== MANAGE DEPARTMENTS =====================

// ADD DEPARTMENT
  openAddDepartmentModal() {
    Swal.fire({
      title: 'Add New Department',
      input: 'text',
      inputPlaceholder: 'Enter department name',
      showCancelButton: true,
      confirmButtonText: 'Add',
      inputValidator: (value) => {
        if (!value) return 'Department name cannot be empty';
        if (this.departmentList.includes(value)) return 'This department already exists';
        return null;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const deptName = result.value.trim();
        this.departmentList.push(deptName);
        this.fieldMap[deptName] = [];
        // Trigger change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        Swal.fire('Added!', `Department "${deptName}" has been added.`, 'success');
      }
    });
  }

// EDIT DEPARTMENT
  editDepartment(dept: string, index: number) {
    Swal.fire({
      title: 'Edit Department',
      input: 'text',
      inputValue: dept,
      showCancelButton: true,
      confirmButtonText: 'Save',
      inputValidator: (value) => {
        if (!value) return 'Department name cannot be empty';
        if (this.departmentList.includes(value) && value !== dept) return 'This department already exists';
        return null;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const newName = result.value.trim();
        this.departmentList[index] = newName;

        // Update fieldMap key
        this.fieldMap[newName] = this.fieldMap[dept];
        if (newName !== dept) delete this.fieldMap[dept];

        // Update all interns with this department
        this.interns.forEach(intern => {
          if (intern.department === dept) {
            intern.department = newName;
          }
        });

        // Create new array reference to trigger change detection
        this.interns = [...this.interns];

        // Trigger change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        Swal.fire('Updated!', `Department updated to "${newName}".`, 'success');
      }
    });
  }

// DELETE DEPARTMENT
  deleteDepartment(dept: string, index: number) {
    Swal.fire({
      title: `Delete "${dept}"?`,
      text: "This will remove all associated fields!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        // Check if any interns are using this department
        const internsInDept = this.interns.filter(i => i.department === dept);
        
        if (internsInDept.length > 0) {
          Swal.fire({
            icon: 'error',
            title: 'Cannot Delete Department',
            html: `
              <div class="text-start">
                <p class="mb-3">This department cannot be deleted because it is assigned to <strong>${internsInDept.length}</strong> intern(s).</p>
                <div class="alert alert-info mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  Please reassign these interns to another department before deleting.
                </div>
              </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#0d6efd'
          });
          return;
        }

        this.departmentList.splice(index, 1);
        delete this.fieldMap[dept];
        // Trigger change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        Swal.fire('Deleted!', `Department "${dept}" has been deleted.`, 'success');
      }
    });
  }

// ADD FIELD
  openAddFieldModal(dept: string) {
    Swal.fire({
      title: `Add Field to ${dept}`,
      input: 'text',
      inputPlaceholder: 'Enter field name',
      showCancelButton: true,
      confirmButtonText: 'Add',
      inputValidator: (value) => {
        if (!value) return 'Field name cannot be empty';
        if (this.fieldMap[dept].includes(value)) return 'This field already exists';
        return null;
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.fieldMap[dept].push(result.value.trim());
        // Trigger change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        Swal.fire('Added!', `Field added to "${dept}".`, 'success');
      }
    });
  }

// EDIT FIELD
  editField(dept: string, index: number) {
    const currentField = this.fieldMap[dept][index];
    Swal.fire({
      title: 'Edit Field',
      input: 'text',
      inputValue: currentField,
      showCancelButton: true,
      confirmButtonText: 'Save',
      inputValidator: (value) => {
        if (!value) return 'Field name cannot be empty';
        if (this.fieldMap[dept].includes(value) && value !== currentField) return 'This field already exists';
        return null;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const oldField = this.fieldMap[dept][index];
        const newField = result.value.trim();
        this.fieldMap[dept][index] = newField;

        // Update all interns with this field in this department
        this.interns.forEach(intern => {
          if (intern.department === dept && (intern.field === oldField || intern.field?.trim() === oldField.trim())) {
            intern.field = newField;
          }
        });

        // Create new array reference to trigger change detection
        this.interns = [...this.interns];

        // Trigger change detection
        this.cdr.markForCheck();
        this.cdr.detectChanges();
        Swal.fire('Updated!', `Field updated to "${newField}".`, 'success');
      }
    });
  }

// DELETE FIELD
  deleteField(dept: string, index: number) {
    const fieldToDelete = this.fieldMap[dept][index];
    
    // Check if any interns are using this field
    const internsUsingField = this.interns.filter(i => 
      i.department === dept && (i.field === fieldToDelete || i.field?.trim() === fieldToDelete.trim())
    );

    if (internsUsingField.length > 0) {
    Swal.fire({
        title: `Delete "${fieldToDelete}"?`,
        html: `
          <div class="text-start">
            <p class="mb-3">This field is currently assigned to <strong>${internsUsingField.length}</strong> intern(s):</p>
            <ul class="text-start mb-3">
              ${internsUsingField.slice(0, 5).map(i => `<li>${i.name}</li>`).join('')}
              ${internsUsingField.length > 5 ? `<li><em>... and ${internsUsingField.length - 5} more</em></li>` : ''}
            </ul>
            <div class="alert alert-warning mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> Deleting this field will not automatically update these interns. You will need to manually assign them a new field.
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete Anyway',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d'
      }).then(result => {
        if (result.isConfirmed) {
          this.fieldMap[dept].splice(index, 1);
          // Trigger change detection
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          Swal.fire('Deleted!', 'Field has been deleted.', 'success');
        }
      });
    } else {
      Swal.fire({
        title: `Delete "${fieldToDelete}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.fieldMap[dept].splice(index, 1);
          // Trigger change detection
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        Swal.fire('Deleted!', 'Field has been deleted.', 'success');
      }
    });
    }
  }

  // ===== Attendance Summary (Absent Modal) =====
  // Generate attendance records from actual interns data
  get overviewAttendance(): AttendanceRecord[] {
    return this.interns
      .filter(i => i.active !== false) // Only active interns
      .map(intern => {
        // Calculate attendance from recordsByDay if available
        let present = 0;
        let absent = 0;
        let leave = 0;
        
        if (intern.recordsByDay) {
          Object.values(intern.recordsByDay).forEach(record => {
            if (record.action === 'Signed In' || record.action === 'Signed Out') {
              present++;
            } else if (record.action === 'Absent') {
              absent++;
            } else if (record.action === 'On Leave') {
              leave++;
            }
          });
        } else {
          // Default values based on current status
          if (intern.status === 'Present') present = 5;
          else if (intern.status === 'Absent') absent = 5;
          else if (intern.status === 'On Leave') leave = 5;
        }
        
        const total = present + absent + leave;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return {
          name: intern.name,
          email: intern.email,
          department: intern.department,
          field: intern.field,
          present,
          absent,
          leave,
          attendanceRate,
          lastActive: new Date() // You can update this with actual last active date
        };
      });
  }

  // Overview Attendance Filters
  overviewAttendanceSearch: string = '';
  overviewAttendanceFilterDepartment: string = '';
  overviewAttendanceFilterField: string = '';
  filteredFieldsForOverviewAttendance: string[] = [];

  get filteredOverviewAttendance(): AttendanceRecord[] {
    return this.overviewAttendance.filter((record) => {
      if (this.overviewAttendanceSearch && !record.name.toLowerCase().includes(this.overviewAttendanceSearch.toLowerCase())) return false;
      if (this.overviewAttendanceFilterDepartment && record.department !== this.overviewAttendanceFilterDepartment) return false;
      if (this.overviewAttendanceFilterField && record.field !== this.overviewAttendanceFilterField) return false;
      return true;
    });
  }

  updateFilteredOverviewAttendance() {
    // This method is called on input change, filtering is handled by the getter
  }

  updateOverviewAttendanceFields() {
    this.filteredFieldsForOverviewAttendance = this.overviewAttendanceFilterDepartment
      ? this.fieldMap[this.overviewAttendanceFilterDepartment] || []
      : [];
    this.overviewAttendanceFilterField = '';
  }

  attendanceFilterName = '';
  attendanceFilterDepartment = '';
  attendanceFilterField = '';
  filteredAttendanceFields: string[] = [];

  get filteredAttendance(): AttendanceRecord[] {
    return this.overviewAttendance.filter((record) => {
      if (this.attendanceFilterName && !record.name.toLowerCase().includes(this.attendanceFilterName.toLowerCase())) return false;
      if (this.attendanceFilterDepartment && record.department !== this.attendanceFilterDepartment) return false;
      if (this.attendanceFilterField && record.field !== this.attendanceFilterField) return false;
      return true;
    });
  }

  updateAttendanceFields() {
    this.filteredAttendanceFields = this.attendanceFilterDepartment
      ? this.fieldMap[this.attendanceFilterDepartment] || []
      : [];
    this.attendanceFilterField = '';
  }

  resetAttendanceFilters() {
    this.attendanceFilterName = '';
    this.attendanceFilterDepartment = '';
    this.attendanceFilterField = '';
    this.filteredAttendanceFields = [];
  }

  // ===== Pagination for Attendance =====
  attendancePage = 1;
  attendancePerPage = 3;

  get paginatedAttendance() {
    const start = (this.attendancePage - 1) * this.attendancePerPage;
    return this.filteredAttendance.slice(start, start + this.attendancePerPage);
  }

  get totalAttendancePages() {
    return Math.ceil(this.filteredAttendance.length / this.attendancePerPage) || 1;
  }

  prevAttendancePage() {
    if (this.attendancePage > 1) this.attendancePage--;
  }

  nextAttendancePage() {
    if (this.attendancePage < this.totalAttendancePages) this.attendancePage++;
  }



// ===== PRESENT INTERNS SECTION =====

  presentFilterName: string = '';
  presentFilterDepartment: string = '';
  presentFilterField: string = '';
  filteredPresentFields: string[] = [];



// Pagination
  presentPage: number = 1;
  presentPerPage: number = 5;

// Computed (filtered + paginated)
  get filteredPresentInterns() {
    return this.interns.filter(i =>
      i.status === 'Present' &&
      (!this.presentFilterName || i.name.toLowerCase().includes(this.presentFilterName.toLowerCase())) &&
      (!this.presentFilterDepartment || i.department === this.presentFilterDepartment) &&
      (!this.presentFilterField || i.field === this.presentFilterField)
    );
  }

  get paginatedPresentInterns() {
    const start = (this.presentPage - 1) * this.presentPerPage;
    const end = start + this.presentPerPage;
    return this.filteredPresentInterns.slice(start, end);
  }

  get totalPresentPages() {
    return Math.ceil(this.filteredPresentInterns.length / this.presentPerPage) || 1;
  }

// Pagination controls
  prevPresentPage() {
    if (this.presentPage > 1) this.presentPage--;
  }

  nextPresentPage() {
    if (this.presentPage < this.totalPresentPages) this.presentPage++;
  }

// Department/Field filter helpers
  updatePresentFields() {
    this.filteredPresentFields = this.presentFilterDepartment
      ? this.fieldMap[this.presentFilterDepartment] || []
      : [];
    this.presentFilterField = '';
    this.presentPage = 1;
  }

  resetPresentFilters() {
    this.presentFilterName = '';
    this.presentFilterDepartment = '';
    this.presentFilterField = '';
    this.filteredPresentFields = [];
    this.presentPage = 1;
  }



  // ===== On Leave Section =====
  filterDepartment = '';
  filterField = '';
  filterName = '';
  filteredFields: string[] = [];

  get filteredLeaves() {
    return this.overviewLeaves.filter((leave) => {
      if (this.filterDepartment && leave.department !== this.filterDepartment) return false;
      if (this.filterField && leave.field !== this.filterField) return false;
      if (this.filterName && !leave.name.toLowerCase().includes(this.filterName.toLowerCase())) return false;
      return true;
    });
  }

  currentPage = 1;
  itemsPerPage = 3;

  get paginatedLeaves() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredLeaves.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(this.filteredLeaves.length / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  // ===== Leave Requests =====
  // Get overview leaves from leaveRequests array (connected to actual data)
  get overviewLeaves(): LeaveRequest[] {
    return this.leaveRequests.slice(0, 5); // Show first 5 for overview
  }

  // Overview Leave Filters
  overviewLeaveSearch: string = '';
  overviewLeaveFilterDepartment: string = '';
  overviewLeaveFilterField: string = '';
  overviewLeaveFilterStatus: string = '';
  filteredFieldsForOverviewLeave: string[] = [];

  get filteredOverviewLeaves(): LeaveRequest[] {
    return this.overviewLeaves.filter((leave) => {
      if (this.overviewLeaveSearch && !leave.name.toLowerCase().includes(this.overviewLeaveSearch.toLowerCase())) return false;
      if (this.overviewLeaveFilterDepartment && leave.department !== this.overviewLeaveFilterDepartment) return false;
      if (this.overviewLeaveFilterField && leave.field !== this.overviewLeaveFilterField) return false;
      if (this.overviewLeaveFilterStatus && leave.status !== this.overviewLeaveFilterStatus) return false;
      return true;
    });
  }

  updateFilteredOverviewLeaves() {
    // This method is called on input change, filtering is handled by the getter
  }

  updateOverviewLeaveFields() {
    this.filteredFieldsForOverviewLeave = this.overviewLeaveFilterDepartment
      ? this.fieldMap[this.overviewLeaveFilterDepartment] || []
      : [];
    this.overviewLeaveFilterField = '';
  }

  // ===== Interns =====
  interns: Intern[] = [
    { name: 'Alice', email: 'alice@example.com', supervisor: 'John Doe', employer: 'Tech Corp', department: 'Marketing', field: 'Digital', status: 'Present', recordsByDay: {} },
    { name: 'Bob', email: 'bob@example.com', supervisor: 'Jane Smith', employer: 'Innovate Ltd', department: 'Development', field: 'Frontend', status: 'On Leave', recordsByDay: {} },
    { name: 'Charlie', email: 'charlie@example.com', supervisor: 'John Doe', employer: 'Tech Corp', department: 'Design', field: 'UI/UX', status: 'Absent', recordsByDay: {} },
  ];

  internSearch = '';
  internFilterDepartment = '';
  internFilterField = '';
  internFilterEmployer = '';
  filteredFieldsForInterns: string[] = [];
  internCurrentPage = 1;
  internItemsPerPage = 25;
  internFilterStatus: string = '';

  // Get unique employers list for filter
  get employerList(): string[] {
    const employers = this.interns
      .map(i => i.employer)
      .filter((emp, index, self) => emp && self.indexOf(emp) === index) as string[];
    return employers.sort();
  }

  // ===== Updated filteredInterns Getter =====
  get filteredInterns(): Intern[] {
    return this.interns
      .filter(i => {
        if (this.internSearch) {
          const searchLower = this.internSearch.toLowerCase();
          return i.name.toLowerCase().includes(searchLower) || i.email.toLowerCase().includes(searchLower);
        }
        return true;
      })
      .filter(i => !this.internFilterDepartment || i.department === this.internFilterDepartment)
      .filter(i => !this.internFilterField || i.field === this.internFilterField)
      .filter(i => !this.internFilterEmployer || i.employer === this.internFilterEmployer)
      .filter(i => {
        // Filter by status, but also handle inactive status
        if (this.internFilterStatus) {
          if (this.internFilterStatus === 'Inactive') {
            return i.active === false;
          } else {
            return i.status === this.internFilterStatus && i.active !== false;
          }
        }
        return true;
      });
  }

  // ===== Pagination helpers for interns =====
  get paginatedInterns(): Intern[] {
    const start = (this.internCurrentPage - 1) * this.internItemsPerPage;
    return this.filteredInterns.slice(start, start + this.internItemsPerPage);
  }

  get totalInternPages(): number {
    return Math.ceil(this.filteredInterns.length / this.internItemsPerPage) || 1;
  }

  // TrackBy function for better change detection
  trackByInternEmail(index: number, intern: Intern): any {
    // Return a combination of email and key fields to ensure changes are detected
    return `${intern.email}-${intern.field}-${intern.status}-${intern.supervisor}-${index}`;
  }

  // Get count of active interns (excluding inactive)
  get activeInternsCount(): number {
    return this.interns.filter(i => i.active !== false).length;
  }

  prevInternPage() { 
    if (this.internCurrentPage > 1) this.internCurrentPage--; 
  }
  
  nextInternPage() { 
    if (this.internCurrentPage < this.totalInternPages) this.internCurrentPage++; 
  }

  goToInternPage(page: number) {
    if (page >= 1 && page <= this.totalInternPages) {
      this.internCurrentPage = page;
    }
  }

  getInternPageNumbers(): number[] {
    const total = this.totalInternPages;
    const current = this.internCurrentPage;
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }
    return pages;
  }

// ===== Filter helper =====
  updateFilteredInterns() {
    this.internCurrentPage = 1;
    this.filteredFieldsForInterns = this.internFilterDepartment ? this.fieldMap[this.internFilterDepartment] || [] : [];
    this.internFilterField = '';
  }

  resetInternFilters() {
    this.internSearch = '';
    this.internFilterDepartment = '';
    this.internFilterField = '';
    this.internFilterEmployer = '';
    this.internFilterStatus = '';
    this.filteredFieldsForInterns = [];
    this.internCurrentPage = 1;
  }

  // ===== Leave Requests actions =====
  // Initialize with sample data - in production, this would come from a service
  leaveRequests: LeaveRequest[] = [
    { name: 'Alice', email: 'alice@example.com', department: 'Marketing', field: 'Digital', startDate: '2025-11-04', endDate: '2025-11-05', reason: 'Medical', status: 'Pending', document: 'assets/docs/alice.pdf' },
    { name: 'Bob', email: 'bob@example.com', department: 'Development', field: 'Frontend', startDate: '2025-11-06', endDate: '2025-11-06', reason: 'Personal', status: 'Approved' },
    { name: 'Charlie', email: 'charlie@example.com', department: 'Design', field: 'UI/UX', startDate: '2025-11-06', endDate: '2025-11-06', reason: 'Personal', status: 'Approved' },
  ];
  clearedLeaveRequests: LeaveRequest[] = [];

  // ===== New Leave Requests Alert System =====
  // Track seen leave request IDs
  seenLeaveRequestIds: Set<number> = new Set();
  
  // New leave requests count
  newLeaveRequestsCount: number = 0;
  
  // Track if alert has been shown this session
  alertShownThisSession: boolean = false;

  approveRequest(request: LeaveRequest) {
    Swal.fire({
      title: 'Approve Leave Request?',
      text: `Are you sure you want to approve the leave request from ${request.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        // Execute inside Angular zone
        this.ngZone.run(() => {
    request.status = 'Approved';
          
          // Update intern status to 'On Leave' if they match
          const intern = this.interns.find(i => 
            (i.email === request.email || i.name === request.name) && i.active !== false
          );
          if (intern) {
            intern.status = 'On Leave';
            // Create new array reference to trigger change detection
            this.interns = [...this.interns];
          }
          
          // Mark as seen when approved
          const requestId = this.getRequestId(request);
          this.seenLeaveRequestIds.add(requestId);
          this.saveSeenLeaveRequests();
          this.updateNewLeaveRequestsCount();
          
          // Force change detection
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Approved!',
          text: `Leave request from ${request.name} has been approved.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  declineRequest(request: LeaveRequest): void {
    Swal.fire({
      title: 'Decline Leave Request',
      input: 'textarea',
      inputLabel: 'Reason for declining:',
      inputPlaceholder: 'Type your reason here...',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'A reason is required to decline the request.';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Execute inside Angular zone
        this.ngZone.run(() => {
          const reason = result.value;
    request.status = 'Declined';
          request.declineReason = reason; // Store the decline reason
          
          // Update intern status back to 'Present' if they match (since leave was declined)
          const intern = this.interns.find(i => 
            (i.email === request.email || i.name === request.name) && i.active !== false
          );
          if (intern && intern.status === 'On Leave') {
            intern.status = 'Present';
            // Create new array reference to trigger change detection
            this.interns = [...this.interns];
          }
          
          // Mark as seen when declined
          const requestId = this.getRequestId(request);
          this.seenLeaveRequestIds.add(requestId);
          this.saveSeenLeaveRequests();
          this.updateNewLeaveRequestsCount();
          
          // Force change detection
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Declined!',
          text: `Leave request from ${request.name} has been declined.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  clearLeaveRequest(index: number) {
    const item = this.leaveRequests.splice(index, 1)[0];
    if (item) this.clearedLeaveRequests.push(item);
  }

  clearLeaveRequestByRequest(request: LeaveRequest) {
    const index = this.leaveRequests.findIndex(r => r.email === request.email && r.startDate === request.startDate);
    if (index !== -1) {
      const item = this.leaveRequests.splice(index, 1)[0];
      if (item) this.clearedLeaveRequests.push(item);
      // Reset to first page if current page becomes empty
      if (this.paginatedLeaveRequests.length === 0 && this.leaveCurrentPage > 1) {
        this.leaveCurrentPage = 1;
      }
    }
  }

  undoClear() {
    this.leaveRequests.push(...this.clearedLeaveRequests);
    this.clearedLeaveRequests = [];
  }

  resetLeaveFilters() {
    this.leaveFilterName = '';
    this.leaveFilterDepartment = '';
    this.leaveFilterField = '';
    this.filteredLeaveFields = [];
    this.leaveCurrentPage = 1;
  }

  // ===== New Leave Requests Alert System Methods =====
  
  // Generate unique ID for a leave request
  getRequestId(request: LeaveRequest): number {
    // Use existing id if available, otherwise generate one
    if ((request as any).id) {
      return (request as any).id;
    }
    // Generate a simple hash from email, name, and startDate
    const str = `${request.email}_${request.name}_${request.startDate || ''}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Load seen leave request IDs from localStorage
  loadSeenLeaveRequests(): void {
    const seenIds = localStorage.getItem('adminSeenLeaveRequests');
    if (seenIds) {
      this.seenLeaveRequestIds = new Set(JSON.parse(seenIds));
    }
  }

  // Save seen leave request IDs to localStorage
  saveSeenLeaveRequests(): void {
    localStorage.setItem('adminSeenLeaveRequests', JSON.stringify(Array.from(this.seenLeaveRequestIds)));
  }

  // Update new leave requests count
  updateNewLeaveRequestsCount(): void {
    const pendingRequests = this.leaveRequests.filter(req => req.status === 'Pending');
    
    const newRequests = pendingRequests.filter(req => {
      const requestId = this.getRequestId(req);
      return !this.seenLeaveRequestIds.has(requestId);
    });
    
    this.newLeaveRequestsCount = newRequests.length;
  }

  // Check for new leave requests and show alert
  checkForNewLeaveRequests(forceShow: boolean = false): void {
    // Update the count first
    this.updateNewLeaveRequestsCount();
    
    // Get pending leave requests
    const pendingRequests = this.leaveRequests.filter(req => req.status === 'Pending');
    
    // Filter new requests (not seen before)
    const newRequests = pendingRequests.filter(req => {
      const requestId = this.getRequestId(req);
      const isNew = !this.seenLeaveRequestIds.has(requestId);
      return isNew;
    });
    
    // Show alert if there are new requests (or if forced)
    if (newRequests.length > 0 && (forceShow || !this.alertShownThisSession)) {
      if (!forceShow) {
        this.alertShownThisSession = true;
      }
      // Small delay to ensure UI is ready
      setTimeout(() => {
        this.showNewLeaveRequestAlert(newRequests);
      }, 500);
    }
  }

  // Show alert for new leave requests
  showNewLeaveRequestAlert(newRequests: LeaveRequest[]): void {
    const count = newRequests.length;
    const names = newRequests.slice(0, 3).map(req => req.name || 'Unknown').join(', ');
    const moreText = count > 3 ? ` and ${count - 3} more` : '';
    
    Swal.fire({
      title: 'New Leave Request' + (count > 1 ? 's' : '') + '!',
      html: `
        <div style="text-align: left;">
          <p><strong>You have ${count} new pending leave request${count > 1 ? 's' : ''}.</strong></p>
          <p style="margin: 10px 0;"><strong>From:</strong> ${names}${moreText}</p>
          <p style="margin-top: 15px; color: #666; font-size: 14px;">
            <i class="bi bi-info-circle"></i> Click "View Requests" to review and take action.
          </p>
        </div>
      `,
      icon: 'info',
      iconColor: '#1976d2',
      showCancelButton: true,
      confirmButtonText: 'View Requests',
      cancelButtonText: 'Later',
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#6c757d',
      allowOutsideClick: false,
      allowEscapeKey: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Navigate to leave status section
        this.showSection('Intern Leave status');
      }
      // Mark all new requests as seen (whether they clicked view or later)
      newRequests.forEach(req => {
        const requestId = this.getRequestId(req);
        this.seenLeaveRequestIds.add(requestId);
      });
      this.saveSeenLeaveRequests();
      // Update count after marking as seen
      this.updateNewLeaveRequestsCount();
    });
  }

  // Mark leave requests as seen when viewing the leave status section
  markLeaveRequestsAsSeen(): void {
    const pendingRequests = this.leaveRequests.filter(req => req.status === 'Pending');
    pendingRequests.forEach(req => {
      const requestId = this.getRequestId(req);
      this.seenLeaveRequestIds.add(requestId);
    });
    this.saveSeenLeaveRequests();
    this.updateNewLeaveRequestsCount();
  }



  // ===== Leave Requests Filters & Pagination =====
  leaveFilterName = '';
  leaveFilterDepartment = '';
  leaveFilterField = '';
  filteredLeaveFields: string[] = [];

  leaveCurrentPage = 1;
  leaveItemsPerPage = 25; // Number of rows per page

// ===== Filtered Leave Requests Getter =====
  get filteredLeaveRequests(): LeaveRequest[] {
    return this.leaveRequests.filter((r) => {
      if (this.leaveFilterName && !r.name.toLowerCase().includes(this.leaveFilterName.toLowerCase())) return false;
      if (this.leaveFilterDepartment && r.department !== this.leaveFilterDepartment) return false;
      if (this.leaveFilterField && r.field !== this.leaveFilterField) return false;
      return true;
    });
  }

// ===== Paginated Leave Requests Getter =====
  get paginatedLeaveRequests(): LeaveRequest[] {
    const start = (this.leaveCurrentPage - 1) * this.leaveItemsPerPage;
    return this.filteredLeaveRequests.slice(start, start + this.leaveItemsPerPage);
  }

  get totalLeavePages(): number {
    return Math.ceil(this.filteredLeaveRequests.length / this.leaveItemsPerPage) || 1;
  }

// ===== Pagination Helpers =====
  prevLeavePage() {
    if (this.leaveCurrentPage > 1) this.leaveCurrentPage--;
  }

  nextLeavePage() {
    if (this.leaveCurrentPage < this.totalLeavePages) this.leaveCurrentPage++;
  }

  goToLeavePage(page: number) {
    if (page >= 1 && page <= this.totalLeavePages) {
      this.leaveCurrentPage = page;
    }
  }

  getLeavePageNumbers(): number[] {
    const total = this.totalLeavePages;
    const current = this.leaveCurrentPage;
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total);
      }
    }
    return pages;
  }

// ===== Update Fields for Field Dropdown =====
  updateLeaveFields() {
    this.filteredLeaveFields = this.leaveFilterDepartment ? this.fieldMap[this.leaveFilterDepartment] || [] : [];
    this.leaveFilterField = '';
    this.leaveCurrentPage = 1; // Reset to first page after filter
  }
// ===== Attendance History =====
  logs: Array<{
    intern: string;
    image?: string;
    date: Date | string;
    location?: string;
    timeIn?: Date | null;
    timeOut?: Date | null;
    action?: string;
  }> = [
    {
      intern: 'Dzulani Monyayi',
      image: 'assets/signatures/dzulani.png',
      date: new Date('2025-10-01'),
      location: 'Lab A',
      timeIn: new Date('2025-10-01T08:05:00'),
      timeOut: new Date('2025-10-01T16:00:00'),
      action: 'Signed In'
    },
    {
      intern: 'Jane Doe',
      image: 'assets/signatures/jane.png',
      date: new Date('2025-10-02'),
      location: 'Office 3',
      timeIn: new Date('2025-10-02T08:10:00'),
      timeOut: new Date('2025-10-02T15:45:00'),
      action: 'Signed Out'
    }
  ];

  filteredLogs: any[] = [];
  historyFilterMonday: string = '';
  historyFilterFriday: string = '';
  historyFilterName: string = '';
  historyFilterDepartment: string = '';
  historyFilterField: string = '';
  historyFilterStatus: string = '';
  weekendSelected: boolean = false;

// ===== Departments & Fields =====
  departmentList: string[] = ['ICT', 'Finance', 'Marketing', 'HR', 'Engineering'];
  fieldMap: { [dept: string]: string[] } = {
    ICT: ['Software Development', 'Networking', 'Support','Music,Business analysis'],
    Finance: ['Accounting', 'Payroll'],
    Marketing: ['Digital Marketing', 'Advertising'],
    HR: ['Recruitment', 'Training', 'Payroll'],
    Engineering: ['Mechanical Design', 'Electrical', 'Civil']
  };
  fieldList: string[] = Object.values(this.fieldMap).flat();
  filteredFieldsForHistory: string[] = [];
  filteredFieldsForReport: string[] = [];

  // Department Management Filters
  departmentSearch: string = '';
  departmentFieldFilter: string = '';

  get filteredDepartmentList(): string[] {
    let filtered = this.departmentList;

    // Search filter
    if (this.departmentSearch) {
      filtered = filtered.filter(dept => 
        dept.toLowerCase().includes(this.departmentSearch.toLowerCase())
      );
    }

    // Field count filter
    if (this.departmentFieldFilter === 'has-fields') {
      filtered = filtered.filter(dept => 
        this.fieldMap[dept] && this.fieldMap[dept].length > 0
      );
    } else if (this.departmentFieldFilter === 'no-fields') {
      filtered = filtered.filter(dept => 
        !this.fieldMap[dept] || this.fieldMap[dept].length === 0
      );
    }

    return filtered;
  }

  updateFilteredDepartments() {
    // This method is called on input change, filtering is handled by the getter
  }

  getTotalFields(): number {
    return Object.values(this.fieldMap).reduce((total, fields) => total + (fields?.length || 0), 0);
  }

  getAverageFieldsPerDepartment(): number {
    if (this.departmentList.length === 0) return 0;
    const total = this.getTotalFields();
    return Math.round((total / this.departmentList.length) * 10) / 10;
  }

  getDepartmentIndex(dept: string): number {
    return this.departmentList.indexOf(dept);
  }

  getDepartmentColor(index: number): string {
    const colors = [
      '#0d6efd', // Blue
      '#198754', // Green
      '#ffc107', // Yellow
      '#dc3545', // Red
      '#6f42c1', // Purple
      '#0dcaf0', // Cyan
      '#fd7e14', // Orange
      '#20c997'  // Teal
    ];
    return colors[index % colors.length];
  }

  getDepartmentGradient(index: number): string {
    const gradients = [
      '#0d6efd, #0a58ca', // Blue gradient
      '#198754, #146c43', // Green gradient
      '#ffc107, #ffca2c', // Yellow gradient
      '#dc3545, #bb2d3b', // Red gradient
      '#6f42c1, #5a32a3', // Purple gradient
      '#0dcaf0, #0aa2c0', // Cyan gradient
      '#fd7e14, #dc6502', // Orange gradient
      '#20c997, #198754'  // Teal gradient
    ];
    return gradients[index % gradients.length];
  }

// ===== Filter Helpers =====
  updateHistoryFields() {
    if (this.historyFilterDepartment && this.fieldMap[this.historyFilterDepartment]) {
      this.filteredFieldsForHistory = this.fieldMap[this.historyFilterDepartment];
    } else {
      this.filteredFieldsForHistory = [];
    }
    this.historyFilterField = '';
  }

  updateReportFields() {
    if (this.reportDepartment && this.fieldMap[this.reportDepartment]) {
      this.filteredFieldsForReport = this.fieldMap[this.reportDepartment];
    } else {
      this.filteredFieldsForReport = [];
    }
    this.reportField = '';
  }

// ===== Weekly Register =====
  getWeeklyRegister() {
    if (!this.historyFilterMonday || !this.historyFilterFriday) return [];

    const monday = new Date(this.historyFilterMonday);
    const friday = new Date(this.historyFilterFriday);

    if (monday.getDay() !== 1 || friday.getDay() !== 5) {
      this.weekendSelected = true;
      return [];
    }

    this.weekendSelected = false;
    const weekDates: Date[] = [];
    for (let d = new Date(monday); d <= friday; d.setDate(d.getDate() + 1)) {
      weekDates.push(new Date(d));
    }

    const result: any[] = [];

    for (const intern of this.interns) {
      if (
        this.historyFilterName &&
        !intern.name.toLowerCase().includes(this.historyFilterName.toLowerCase())
      ) continue;

      if (
        this.historyFilterDepartment &&
        intern.department !== this.historyFilterDepartment
      ) continue;

      if (
        this.historyFilterField &&
        intern.field !== this.historyFilterField
      ) continue;

      // Status filter logic
      if (this.historyFilterStatus) {
        if (this.historyFilterStatus === 'Inactive') {
          // Show only inactive interns
          if (intern.active !== false) continue;
        } else {
          // Show only active interns with matching status
          if (intern.active === false || intern.status !== this.historyFilterStatus) continue;
        }
      } else {
        // If no status filter, show only active interns by default
        if (intern.active === false) continue;
      }

      for (const date of weekDates) {
        const log = this.logs.find(
          (l) =>
            l.intern === intern.name &&
            new Date(l.date).toDateString() === date.toDateString()
        );

        result.push(
          log
            ? { ...log, intern: intern.name, date: new Date(date) }
            : {
              intern: intern.name,
              image: 'assets/signatures/placeholder.png',
              date: new Date(date),
              location: '-',
              timeIn: null,
              timeOut: null,
              action: 'Absent'
            }
        );
      }
    }

    this.filteredLogs = result;
    this.historyCurrentPage = 1; // reset pagination
    return result;
  }

  resetHistoryFilter() {
    this.historyFilterMonday = '';
    this.historyFilterFriday = '';
    this.historyFilterName = '';
    this.historyFilterDepartment = '';
    this.historyFilterField = '';
    this.historyFilterStatus = '';
    this.weekendSelected = false;
    this.filteredLogs = [];
    this.filteredFieldsForHistory = [];
    this.historyCurrentPage = 1;
  }

// ===== Helper: Group weekly logs by intern for HTML table =====
  get internsForWeek() {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const grouped: { [name: string]: any } = {};

    for (const log of this.filteredLogs) {
      if (!grouped[log.intern]) {
        grouped[log.intern] = {
          name: log.intern,
          recordsByDay: {} as { [day: string]: any }
        };
      }

      const date = new Date(log.date);
      const dayName = weekDays[date.getDay() - 1]; // Monday=1
      if (dayName) grouped[log.intern].recordsByDay[dayName] = log;
    }

    for (const internName in grouped) {
      for (const day of weekDays) {
        if (!grouped[internName].recordsByDay[day]) {
          grouped[internName].recordsByDay[day] = {
            action: 'Absent',
            timeIn: null,
            timeOut: null
          };
        }
      }
    }

    return Object.values(grouped);
  }

// ===== Pagination =====
  historyCurrentPage: number = 1;
  historyItemsPerPage: number = 10;

  get totalHistoryPages(): number {
    return Math.ceil(this.internsForWeek.length / this.historyItemsPerPage) || 1;
  }

  get paginatedInternsForWeek() {
    const start = (this.historyCurrentPage - 1) * this.historyItemsPerPage;
    return this.internsForWeek.slice(start, start + this.historyItemsPerPage);
  }

  prevHistoryPage() {
    if (this.historyCurrentPage > 1) this.historyCurrentPage--;
  }

  nextHistoryPage() {
    if (this.historyCurrentPage < this.totalHistoryPages) this.historyCurrentPage++;
  }

  goToHistoryPage(page: number) {
    if (page > 0 && page <= this.totalHistoryPages) {
      this.historyCurrentPage = page;
    }
  }

  getHistoryPageNumbers(): number[] {
    const total = this.totalHistoryPages;
    const current = this.historyCurrentPage;
    const pages: number[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page, and pages around current
      pages.push(1);
      
      if (current > 3) {
        pages.push(-1); // Ellipsis
      }
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < total - 2) {
        pages.push(-1); // Ellipsis
      }
      
      pages.push(total);
    }

    return pages;
  }

  // Quick week selection methods
  selectCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.getFullYear(), today.getMonth(), diff);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    this.historyFilterMonday = this.formatDateForInput(monday);
    this.historyFilterFriday = this.formatDateForInput(friday);
    this.onHistoryDateChange();
  }

  selectLastWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) - 7; // Last week's Monday
    const monday = new Date(today.getFullYear(), today.getMonth(), diff);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    this.historyFilterMonday = this.formatDateForInput(monday);
    this.historyFilterFriday = this.formatDateForInput(friday);
    this.onHistoryDateChange();
  }

  selectPreviousWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) - 14; // 2 weeks ago Monday
    const monday = new Date(today.getFullYear(), today.getMonth(), diff);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    this.historyFilterMonday = this.formatDateForInput(monday);
    this.historyFilterFriday = this.formatDateForInput(friday);
    this.onHistoryDateChange();
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onHistoryDateChange() {
    this.historyCurrentPage = 1; // Reset to first page
    if (this.historyFilterMonday && this.historyFilterFriday) {
      this.filteredLogs = this.getWeeklyRegister();
    }
  }

  onHistoryFilterChange() {
    this.historyCurrentPage = 1; // Reset to first page
    if (this.historyFilterMonday && this.historyFilterFriday) {
      this.filteredLogs = this.getWeeklyRegister();
    }
  }

  // Statistics helpers for history section
  getTotalPresentDays(): number {
    let count = 0;
    for (const intern of this.internsForWeek) {
      for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
        if (intern.recordsByDay[day]?.action === 'Signed In') {
          count++;
        }
      }
    }
    return count;
  }

  getTotalLeaveDays(): number {
    let count = 0;
    for (const intern of this.internsForWeek) {
      for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
        if (intern.recordsByDay[day]?.action === 'On Leave') {
          count++;
        }
      }
    }
    return count;
  }

  getTotalAbsentDays(): number {
    let count = 0;
    for (const intern of this.internsForWeek) {
      for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']) {
        if (intern.recordsByDay[day]?.action === 'Absent') {
          count++;
        }
      }
    }
    return count;
  }

  getDayDate(day: string): Date {
    if (!this.historyFilterMonday) return new Date();
    
    const monday = new Date(this.historyFilterMonday);
    const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(day);
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIndex);
    return targetDate;
  }

  // ===== Reports =====
  reportInternName = '';
  reportDepartment = '';
  reportField = '';
  reportFilterStatus: string = '';
  reportFromDate: string = '';
  reportToDate: string = '';
  
  filteredReportData: AttendanceRecord[] = [];
  lastReportGenerated: Date | null = null;
  
  // Pagination for Reports Section
  reportCurrentPage: number = 1;
  reportItemsPerPage: number = 25;

  generateReport() {
    this.reportCurrentPage = 1; // Reset to first page when generating new report
    this.filteredReportData = this.overviewAttendance.filter((r) => {
      const matchesIntern = !this.reportInternName || r.name.toLowerCase().includes(this.reportInternName.toLowerCase());
      const matchesDept = !this.reportDepartment || r.department === this.reportDepartment;
      const matchesField = !this.reportField || r.field === this.reportField;

      // Get the intern to check status
      const intern = this.interns.find(i => i.name === r.name);
      let matchesStatus = true;
      if (this.reportFilterStatus) {
        if (this.reportFilterStatus === 'Inactive') {
          matchesStatus = intern ? intern.active === false : false;
        } else {
          matchesStatus = intern ? intern.status === this.reportFilterStatus && intern.active !== false : false;
        }
      }

      let matchesDate = true;
      if (this.reportFromDate && r.lastActive) {
        matchesDate = matchesDate && new Date(r.lastActive) >= new Date(this.reportFromDate);
      }
      if (this.reportToDate && r.lastActive) {
        matchesDate = matchesDate && new Date(r.lastActive) <= new Date(this.reportToDate);
      }

      return matchesIntern && matchesDept && matchesField && matchesStatus && matchesDate;
    });
    this.lastReportGenerated = new Date();
  }

  // Paginated report data
  get paginatedReportData(): AttendanceRecord[] {
    const start = (this.reportCurrentPage - 1) * this.reportItemsPerPage;
    return this.filteredReportData.slice(start, start + this.reportItemsPerPage);
  }

  get totalReportPages(): number {
    return Math.ceil(this.filteredReportData.length / this.reportItemsPerPage) || 1;
  }

  // Pagination helpers for Reports
  prevReportPage() {
    if (this.reportCurrentPage > 1) this.reportCurrentPage--;
  }

  nextReportPage() {
    if (this.reportCurrentPage < this.totalReportPages) this.reportCurrentPage++;
  }

  goToReportPage(page: number) {
    if (page > 0 && page <= this.totalReportPages) {
      this.reportCurrentPage = page;
    }
  }

  getReportPageNumbers(): number[] {
    const total = this.totalReportPages;
    const current = this.reportCurrentPage;
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (current > 3) {
        pages.push(-1);
      }
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (current < total - 2) {
        pages.push(-1);
      }
      pages.push(total);
    }
    return pages;
  }

  // Report statistics helpers
  getAverageAttendance(): number {
    if (this.filteredReportData.length === 0) return 0;
    const total = this.filteredReportData.reduce((sum, record) => sum + record.attendanceRate, 0);
    return Math.round(total / this.filteredReportData.length);
  }

  getTotalPresent(): number {
    return this.filteredReportData.reduce((sum, record) => sum + record.present, 0);
  }

  getTotalAbsent(): number {
    return this.filteredReportData.reduce((sum, record) => sum + record.absent, 0);
  }

  resetReportFilter() {
    this.reportInternName = '';
    this.reportDepartment = '';
    this.reportField = '';
    this.reportFilterStatus = '';
    this.reportFromDate = '';
    this.reportToDate = '';
    this.filteredReportData = [];
    this.lastReportGenerated = null;
    this.filteredFieldsForReport = [];
    this.reportCurrentPage = 1;
  }


  downloadReportPDF() {
    alert('Export PDF triggered!');
  }

  downloadReportExcel() {
    alert('Export Excel triggered!');
  }

  // ===== Helpers =====
  openEditModal(intern: Intern) {
    const index = this.interns.findIndex(i => i.email === intern.email);
    if (index === -1) return;

    // Get unique supervisors for dropdown
    const supervisors = this.supervisors.map(s => s.name).filter((name, idx, self) => self.indexOf(name) === idx);

    // Get current department's fields from fieldMap (always get latest data)
    const departmentFields = this.fieldMap[intern.department] || [];
    const internFieldExists = departmentFields.some(f => f === intern.field || f.trim() === intern.field?.trim());

    // Check if department exists in departmentList
    const departmentExists = this.departmentList.includes(intern.department);

    // Show warning if department doesn't exist
    if (!departmentExists) {
      Swal.fire({
        icon: 'warning',
        title: 'Department Not Found',
        html: `
          <div class="text-start">
            <p class="mb-3">The department <strong>"${intern.department}"</strong> for this intern is not found in the departments list.</p>
            <div class="alert alert-info mb-0">
              <i class="bi bi-info-circle me-2"></i>
              Please update the department management section first, or contact an administrator.
            </div>
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#0d6efd'
      });
      return;
    }

    Swal.fire({
      title: 'Edit Intern',
      html: `
        <div class="text-start">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Name <span class="text-danger">*</span></label>
              <input type="text" id="swal-input-name" class="form-control" value="${intern.name}" placeholder="Enter intern name" required disabled>
              <small class="text-muted d-block mt-1">
                <i class="bi bi-lock me-1"></i>Name cannot be changed
              </small>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Email <span class="text-danger">*</span></label>
              <input type="email" id="swal-input-email" class="form-control" value="${intern.email}" placeholder="Enter email address" required disabled>
              <small class="text-muted d-block mt-1">
                <i class="bi bi-lock me-1"></i>Email cannot be changed
              </small>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Supervisor <span class="text-danger">*</span></label>
              <input type="text" id="swal-input-supervisor" class="form-control" list="supervisor-list" value="${intern.supervisor}" placeholder="Enter supervisor name" required readonly>
              <datalist id="supervisor-list">
                ${supervisors.map(s => `<option value="${s}">`).join('')}
              </datalist>
              <small class="text-muted d-block mt-1">
                <i class="bi bi-arrow-repeat me-1"></i>Supervisor will be automatically updated when field changes
              </small>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Employer</label>
              <input type="text" id="swal-input-employer" class="form-control" value="${intern.employer || ''}" placeholder="Enter employer name" disabled>
              <small class="text-muted d-block mt-1">
                <i class="bi bi-lock me-1"></i>Employer cannot be changed
              </small>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Department <span class="text-danger">*</span></label>
              <select id="swal-input-department" class="form-select" required disabled>
                <option value="">Select Department</option>
                ${this.departmentList.map(dept => 
                  `<option value="${dept}" ${dept === intern.department ? 'selected' : ''}>${dept}</option>`
                ).join('')}
              </select>
              <small class="text-muted d-block mt-1">
                <i class="bi bi-lock me-1"></i>Department cannot be changed
              </small>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Field <span class="text-danger">*</span></label>
              <select id="swal-input-field" class="form-select" required>
                <option value="">Select Field</option>
                ${departmentFields.map(field => {
                  const isSelected = field === intern.field || field.trim() === intern.field?.trim();
                  return `<option value="${field}" ${isSelected ? 'selected' : ''}>${field}</option>`;
                }).join('')}
                ${!internFieldExists && intern.field ? 
                  `<option value="${intern.field}" selected style="color: #dc3545;">${intern.field} (Not in department fields)</option>` : ''}
              </select>
              ${!internFieldExists && intern.field ? 
                `<small class="text-warning d-block mt-1">
                  <i class="bi bi-exclamation-triangle me-1"></i>Current field is not in the department's field list. Please select a valid field.
                </small>` : ''}
              ${departmentFields.length === 0 ? 
                `<small class="text-info d-block mt-1">
                  <i class="bi bi-info-circle me-1"></i>No fields available for this department. Please add fields in the Departments section.
                </small>` : ''}
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold">Status <span class="text-danger">*</span></label>
              <select id="swal-input-status" class="form-select" required>
                <option value="Present" ${intern.status === 'Present' ? 'selected' : ''}>Present</option>
                <option value="Absent" ${intern.status === 'Absent' ? 'selected' : ''}>Absent</option>
                <option value="On Leave" ${intern.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
              </select>
            </div>
          </div>
        </div>
      `,
      width: '900px',
      customClass: {
        popup: 'swal-wide-modal',
        htmlContainer: 'swal-html-container'
      },
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      didOpen: () => {
        // Add confirmation when field is changed
        const fieldSelect = document.getElementById('swal-input-field') as HTMLSelectElement;
        const originalField = intern.field;
        let previousField = originalField;
        
        if (fieldSelect) {
          fieldSelect.addEventListener('change', async (e) => {
            const newField = (e.target as HTMLSelectElement).value;
            
            // Only show confirmation if field is actually changing from the original
            if (newField && newField !== originalField) {
              // Store the new value temporarily
              const tempNewField = newField;
              
              // Revert to previous value while showing confirmation
              fieldSelect.value = previousField;
              
              const result = await Swal.fire({
                title: 'Change Field?',
                html: `
                  <div class="text-start">
                    <p class="mb-3">Are you sure you want to change the field from <strong>${originalField}</strong> to <strong>${tempNewField}</strong>?</p>
                    <div class="alert alert-info mb-0">
                      <i class="bi bi-info-circle me-2"></i>
                      This will update the intern's field assignment.
                    </div>
                  </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Change',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#6c757d',
                allowOutsideClick: false,
                allowEscapeKey: true
              });
              
              if (result.isConfirmed) {
                // Apply the change
                fieldSelect.value = tempNewField;
                previousField = tempNewField;
                
                // Automatically update supervisor based on the new field
                const supervisorInput = document.getElementById('swal-input-supervisor') as HTMLInputElement;
                if (supervisorInput) {
                  // Find a supervisor with the matching field
                  const matchingSupervisor = this.supervisors.find(s => 
                    s.field === tempNewField && s.status === 'Active'
                  );
                  
                  if (matchingSupervisor) {
                    supervisorInput.value = matchingSupervisor.name;
                    
                    // Show a notification about the supervisor change
                    Swal.fire({
                      icon: 'info',
                      title: 'Supervisor Updated',
                      html: `
                        <p class="mb-0">Supervisor has been automatically updated to <strong>${matchingSupervisor.name}</strong> based on the selected field.</p>
                      `,
                      timer: 3000,
                      showConfirmButton: false,
                      toast: true,
                      position: 'top-end'
                    });
                  } else {
                    // If no active supervisor found for this field, show a warning
                    Swal.fire({
                      icon: 'warning',
                      title: 'No Active Supervisor',
                      html: `
                        <p class="mb-0">No active supervisor found for field <strong>${tempNewField}</strong>. Please assign a supervisor manually.</p>
                      `,
                      timer: 3000,
                      showConfirmButton: false,
                      toast: true,
                      position: 'top-end'
                    });
                  }
                }
              } else {
                // Keep the previous value
                fieldSelect.value = previousField;
              }
            } else {
              // Update previous field if no confirmation needed
              previousField = newField;
            }
          });
        }

        // Add confirmation when status is changed
        const statusSelect = document.getElementById('swal-input-status') as HTMLSelectElement;
        const originalStatus = intern.status;
        let previousStatus = originalStatus;
        
        if (statusSelect) {
          statusSelect.addEventListener('change', async (e) => {
            const newStatus = (e.target as HTMLSelectElement).value;
            
            // Only show confirmation if status is actually changing from the original
            if (newStatus && newStatus !== originalStatus) {
              // Store the new value temporarily
              const tempNewStatus = newStatus;
              
              // Revert to previous value while showing confirmation
              statusSelect.value = previousStatus;
              
              const result = await Swal.fire({
                title: 'Change Status?',
                html: `
                  <div class="text-start">
                    <p class="mb-3">Are you sure you want to change the status from <strong>${originalStatus}</strong> to <strong>${tempNewStatus}</strong>?</p>
                    <div class="alert alert-info mb-0">
                      <i class="bi bi-info-circle me-2"></i>
                      This will update the intern's current status.
                    </div>
                  </div>
                `,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Change',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#6c757d',
                allowOutsideClick: false,
                allowEscapeKey: true
              });
              
              if (result.isConfirmed) {
                // Apply the change
                statusSelect.value = tempNewStatus;
                previousStatus = tempNewStatus as 'Present' | 'Absent' | 'On Leave';
              } else {
                // Keep the previous value
                statusSelect.value = previousStatus;
              }
            } else {
              // Update previous status if no confirmation needed
              previousStatus = newStatus as 'Present' | 'Absent' | 'On Leave';
            }
          });
        }
      },
      preConfirm: () => {
        // These fields are disabled, so use the original intern's values
        const name = intern.name;
        const email = intern.email;
        // Supervisor may have been auto-updated, so get it from the input (even though it's disabled, we can read its value)
        const supervisorInput = document.getElementById('swal-input-supervisor') as HTMLInputElement;
        const supervisor = supervisorInput ? supervisorInput.value.trim() : intern.supervisor;
        const employer = intern.employer;
        // Department is disabled, so use the original intern's department
        const department = intern.department;
        const field = (document.getElementById('swal-input-field') as HTMLSelectElement)?.value;
        const status = (document.getElementById('swal-input-status') as HTMLSelectElement)?.value as 'Present' | 'Absent' | 'On Leave';

        // Validation
        if (!field) {
          Swal.showValidationMessage('Field is required');
          return false;
        }
        if (!status) {
          Swal.showValidationMessage('Status is required');
          return false;
        }

        return {
          name,
          email,
          supervisor,
          employer: employer || undefined,
          department,
          field,
          status
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        // Execute inside Angular zone to ensure change detection
        this.ngZone.run(() => {
          // Create a completely new intern object (not mutating the existing one)
          const updatedIntern: Intern = {
            name: result.value.name,
            email: result.value.email,
            supervisor: result.value.supervisor,
            employer: result.value.employer,
            department: result.value.department,
            field: result.value.field,
            status: result.value.status,
            recordsByDay: intern.recordsByDay || {} // Preserve recordsByDay
          };

          // IMPORTANT: Create a completely new array to trigger change detection
          const newInternsArray = [...this.interns];
          newInternsArray[index] = updatedIntern;
          this.interns = newInternsArray;

          // Force change detection immediately - this will update the table
          this.cdr.detectChanges();

          // Small delay to ensure change detection completes, then handle pagination
          setTimeout(() => {
            this.ngZone.run(() => {
              // Check if updated intern is still visible after filtering
              const currentFiltered = this.filteredInterns;
              const updatedInternIndex = currentFiltered.findIndex(i => i.email === updatedIntern.email);
              
              if (updatedInternIndex >= 0) {
                // Calculate which page the updated intern should be on
                const newPage = Math.ceil((updatedInternIndex + 1) / this.internItemsPerPage);
                if (newPage !== this.internCurrentPage && newPage >= 1 && newPage <= this.totalInternPages) {
                  this.internCurrentPage = newPage;
                }
              } else if (this.paginatedInterns.length === 0 && this.internCurrentPage > 1) {
                // If no interns on current page, go to first page
                this.internCurrentPage = 1;
              }

              // Force change detection again after pagination update
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            });
          }, 10);
        });

        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Intern "${result.value.name}" has been updated successfully.`,
          timer: 2000,
          showConfirmButton: false,
          didClose: () => {
            // Ensure table is refreshed after modal closes
            this.ngZone.run(() => {
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            });
          }
        });
      }
    });
  }

  deactivateIntern(intern: Intern) {
    const index = this.interns.findIndex(i => i.email === intern.email);
    if (index === -1) return;

    // Check if intern is already deactivated
    const isCurrentlyActive = intern.active !== false;

    Swal.fire({
      title: isCurrentlyActive ? 'Deactivate Intern?' : 'Activate Intern?',
      html: `
        <div class="text-start">
          <p class="mb-3">Are you sure you want to ${isCurrentlyActive ? 'deactivate' : 'activate'} <strong>${intern.name}</strong>?</p>
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Note:</strong> ${isCurrentlyActive ? 'Deactivating' : 'Activating'} this intern will ${isCurrentlyActive ? 'mark them as inactive' : 'mark them as active'} in the system. Their historical information, attendance records, and leave requests will be preserved.
          </div>
        </div>
      `,
      icon: isCurrentlyActive ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: isCurrentlyActive ? 'Yes, Deactivate' : 'Yes, Activate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: isCurrentlyActive ? '#ffc107' : '#28a745',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Execute inside Angular zone to ensure change detection
        this.ngZone.run(() => {
          // Update the intern's active status
          const updatedIntern: Intern = {
            ...intern,
            active: !isCurrentlyActive
          };

          // Create new array with updated intern
          const newInternsArray = [...this.interns];
          newInternsArray[index] = updatedIntern;
          this.interns = newInternsArray;
          
          // Reset to first page if current page becomes empty
          if (this.paginatedInterns.length === 0 && this.internCurrentPage > 1) {
            this.internCurrentPage = 1;
          }

          // Force change detection to update the table immediately
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        });

        // Show success message
        Swal.fire({
          icon: 'success',
          title: isCurrentlyActive ? 'Deactivated!' : 'Activated!',
          text: `Intern "${intern.name}" has been ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully.`,
          timer: 2000,
          showConfirmButton: false,
          didClose: () => {
            // Ensure table is refreshed after modal closes
            this.ngZone.run(() => {
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            });
          }
        });
      }
    });
  }

  // ===== SUPERVISORS SECTION =====
  supervisors: Supervisor[] = [
    { name: 'John Doe', email: 'john@example.com', department: 'ICT', field: 'Software Development', assignedInterns: ['Alice', 'Charlie'], status: 'Active', active: true },
    { name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', field: 'Digital Marketing', assignedInterns: ['Bob'], status: 'On Leave', active: true },
    { name: 'Mike Brown', email: 'mike@example.com', department: 'Finance', field: 'Accounting', assignedInterns: [], status: 'Inactive', active: false },
  ];

  // Expose Math for template
  Math = Math;

// Filters
  supervisorSearch: string = '';
  supervisorFilterDepartment: string = '';
  supervisorFilterField: string = '';
  supervisorFilterStatus: string = '';
  filteredFieldsForSupervisors: string[] = [];

// Pagination
  supervisorCurrentPage: number = 1;
  supervisorItemsPerPage: number = 25;

// Derived + Helper data
  get filteredSupervisors(): Supervisor[] {
    return this.supervisors
      .filter(s => {
        if (this.supervisorSearch) {
          const searchLower = this.supervisorSearch.toLowerCase();
          return s.name.toLowerCase().includes(searchLower) || s.email.toLowerCase().includes(searchLower);
        }
        return true;
      })
      .filter(s => !this.supervisorFilterDepartment || s.department === this.supervisorFilterDepartment)
      .filter(s => !this.supervisorFilterField || s.field === this.supervisorFilterField)
      .filter(s => {
        // Filter by status, but also handle inactive status
        if (this.supervisorFilterStatus) {
          if (this.supervisorFilterStatus === 'Inactive') {
            return s.active === false;
          } else {
            return s.status === this.supervisorFilterStatus && s.active !== false;
          }
        }
        return true;
      });
  }

  // Get count of active supervisors (excluding inactive)
  get activeSupervisorsCount(): number {
    return this.supervisors.filter(s => s.active !== false).length;
  }

  get paginatedSupervisors(): Supervisor[] {
    const start = (this.supervisorCurrentPage - 1) * this.supervisorItemsPerPage;
    return this.filteredSupervisors.slice(start, start + this.supervisorItemsPerPage);
  }

  get totalSupervisorPages(): number {
    return Math.ceil(this.filteredSupervisors.length / this.supervisorItemsPerPage) || 1;
  }

// Pagination helpers
  prevSupervisorPage() {
    if (this.supervisorCurrentPage > 1) this.supervisorCurrentPage--;
  }

  nextSupervisorPage() {
    if (this.supervisorCurrentPage < this.totalSupervisorPages) this.supervisorCurrentPage++;
  }

  goToSupervisorPage(page: number) {
    if (page >= 1 && page <= this.totalSupervisorPages) {
      this.supervisorCurrentPage = page;
    }
  }

  getSupervisorPageNumbers(): number[] {
    const total = this.totalSupervisorPages;
    const current = this.supervisorCurrentPage;
    const pages: number[] = [];
    
    if (total <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, current page with neighbors, and last page
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = total - 4; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(total);
      }
    }
    return pages;
  }

// Filter helpers
  updateFilteredSupervisors() {
    this.supervisorCurrentPage = 1;
    this.filteredFieldsForSupervisors = this.supervisorFilterDepartment ? this.fieldMap[this.supervisorFilterDepartment] || [] : [];
    this.supervisorFilterField = '';
  }

  resetSupervisorFilters() {
    this.supervisorSearch = '';
    this.supervisorFilterDepartment = '';
    this.supervisorFilterField = '';
    this.supervisorFilterStatus = '';
    this.filteredFieldsForSupervisors = [];
    this.supervisorCurrentPage = 1;
  }

// Actions
  openEditSupervisorModal(supervisor: Supervisor) {
    const index = this.supervisors.findIndex(s => s.email === supervisor.email);
    if (index === -1) return;

    const availableFields = this.fieldMap[supervisor.department] || [];
    const statusOptions = ['Active', 'On Leave', 'Inactive'];

    Swal.fire({
      title: 'Edit Supervisor',
      html: `
        <div class="swal-wide-modal-content">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="supervisorName" class="form-label fw-medium">Name <span class="text-danger">*</span></label>
              <input type="text" id="supervisorName" class="form-control" value="${supervisor.name}" readonly disabled>
              <small class="text-muted">Name cannot be changed</small>
            </div>
            <div class="col-md-6 mb-3">
              <label for="supervisorEmail" class="form-label fw-medium">Email <span class="text-danger">*</span></label>
              <input type="email" id="supervisorEmail" class="form-control" value="${supervisor.email}" readonly disabled>
              <small class="text-muted">Email cannot be changed</small>
            </div>
            <div class="col-md-6 mb-3">
              <label for="supervisorDepartment" class="form-label fw-medium">Department <span class="text-danger">*</span></label>
              <select id="supervisorDepartment" class="form-select" disabled>
                ${this.departmentList.map(dept => 
                  `<option value="${dept}" ${dept === supervisor.department ? 'selected' : ''}>${dept}</option>`
                ).join('')}
              </select>
              <small class="text-muted">Department cannot be changed</small>
            </div>
            <div class="col-md-6 mb-3">
              <label for="supervisorField" class="form-label fw-medium">Field <span class="text-danger">*</span></label>
              <select id="supervisorField" class="form-select">
                ${availableFields.map(field => 
                  `<option value="${field}" ${field === supervisor.field ? 'selected' : ''}>${field}</option>`
                ).join('')}
              </select>
              <small class="text-muted">Select the field</small>
            </div>
            <div class="col-md-6 mb-3">
              <label for="supervisorStatus" class="form-label fw-medium">Status <span class="text-danger">*</span></label>
              <select id="supervisorStatus" class="form-select">
                ${statusOptions.map(status => 
                  `<option value="${status}" ${status === supervisor.status ? 'selected' : ''}>${status}</option>`
                ).join('')}
              </select>
              <small class="text-muted">Select the status</small>
            </div>
          </div>
        </div>
      `,
      width: '900px',
      customClass: {
        popup: 'swal-wide-modal',
        htmlContainer: 'swal-html-container'
      },
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const nameInput = document.getElementById('supervisorName') as HTMLInputElement;
        const emailInput = document.getElementById('supervisorEmail') as HTMLInputElement;
        const departmentSelect = document.getElementById('supervisorDepartment') as HTMLSelectElement;
        const fieldSelect = document.getElementById('supervisorField') as HTMLSelectElement;
        const statusSelect = document.getElementById('supervisorStatus') as HTMLSelectElement;

        const name = nameInput?.value?.trim();
        const email = emailInput?.value?.trim();
        const department = departmentSelect?.value?.trim();
        const field = fieldSelect?.value?.trim();
        const status = statusSelect?.value?.trim() as 'Active' | 'On Leave' | 'Inactive';

        if (!name || !email || !department || !field || !status) {
          Swal.showValidationMessage('All fields are required');
          return false;
        }

        const existingSupervisor = this.supervisors.find(s => s.email === email && s.email !== supervisor.email);
        if (existingSupervisor) {
          Swal.showValidationMessage('Email already exists for another supervisor');
          return false;
        }

        if (this.fieldMap[department] && !this.fieldMap[department].includes(field)) {
          Swal.showValidationMessage(`Field "${field}" does not exist in department "${department}"`);
          return false;
        }

        return { name, email, department, field, status };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.ngZone.run(() => {
          const updatedSupervisor: Supervisor = {
            ...supervisor,
            field: result.value.field,
            status: result.value.status,
            active: result.value.status !== 'Inactive' ? true : (supervisor.active !== undefined ? supervisor.active : false)
          };

          const supervisorIndex = this.supervisors.findIndex(s => s.email === supervisor.email);
          if (supervisorIndex !== -1) {
            if (supervisor.field !== result.value.field) {
              Swal.fire({
                title: 'Field Changed',
                text: `Supervisor's field has been changed from "${supervisor.field}" to "${result.value.field}". This may affect assigned interns.`,
                icon: 'info',
                confirmButtonText: 'OK',
                confirmButtonColor: '#0d6efd'
              });
            }

            if (supervisor.status !== result.value.status) {
              Swal.fire({
                title: 'Status Changed',
                text: `Supervisor's status has been changed from "${supervisor.status}" to "${result.value.status}".`,
                icon: 'info',
                confirmButtonText: 'OK',
                confirmButtonColor: '#0d6efd'
              });
            }

            this.supervisors[supervisorIndex] = updatedSupervisor;
            this.supervisors = [...this.supervisors];

            if (result.value.status === 'Inactive' && supervisor.assignedInterns && supervisor.assignedInterns.length > 0) {
              const replacementSupervisor = this.supervisors.find(s => 
                s.field === result.value.field && 
                s.status === 'Active' && 
                s.email !== supervisor.email &&
                s.active !== false
              );

              if (replacementSupervisor) {
                supervisor.assignedInterns.forEach(internName => {
                  const intern = this.interns.find(i => i.name === internName);
                  if (intern) {
                    intern.supervisor = replacementSupervisor.name;
                  }
                });
                this.interns = [...this.interns];
              }
            }

            this.cdr.detectChanges();

            setTimeout(() => {
              this.ngZone.run(() => {
                const currentFiltered = this.filteredSupervisors;
                const updatedSupervisorIndex = currentFiltered.findIndex(s => s.email === updatedSupervisor.email);
                
                if (updatedSupervisorIndex >= 0) {
                  const newPage = Math.ceil((updatedSupervisorIndex + 1) / this.supervisorItemsPerPage);
                  if (newPage !== this.supervisorCurrentPage && newPage >= 1 && newPage <= this.totalSupervisorPages) {
                    this.supervisorCurrentPage = newPage;
                  }
                } else if (this.paginatedSupervisors.length === 0 && this.supervisorCurrentPage > 1) {
                  this.supervisorCurrentPage = 1;
                }

                this.cdr.markForCheck();
                this.cdr.detectChanges();
              });
            }, 10);
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Supervisor "${result.value.name}" has been updated successfully.`,
          timer: 2000,
          showConfirmButton: false,
          didClose: () => {
            this.ngZone.run(() => {
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            });
          }
        });
      }
    });
  }

  deactivateSupervisor(supervisor: Supervisor) {
    const index = this.supervisors.findIndex(s => s.email === supervisor.email);
    if (index === -1) return;

    const isCurrentlyActive = supervisor.active !== false;

    Swal.fire({
      title: isCurrentlyActive ? 'Deactivate Supervisor?' : 'Activate Supervisor?',
      html: `
        <div class="text-start">
          <p class="mb-3">Are you sure you want to ${isCurrentlyActive ? 'deactivate' : 'activate'} <strong>${supervisor.name}</strong>?</p>
          ${supervisor.assignedInterns && supervisor.assignedInterns.length > 0 ? `
            <div class="alert alert-warning mb-3">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Warning:</strong> This supervisor has <strong>${supervisor.assignedInterns.length}</strong> assigned intern(s). 
              ${isCurrentlyActive ? 'Deactivating' : 'Activating'} this supervisor ${isCurrentlyActive ? 'may' : 'will'} affect their assignments.
            </div>
          ` : ''}
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Note:</strong> ${isCurrentlyActive ? 'Deactivating' : 'Activating'} this supervisor will ${isCurrentlyActive ? 'mark them as inactive' : 'mark them as active'} in the system. Their historical information will be preserved.
          </div>
        </div>
      `,
      icon: isCurrentlyActive ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: isCurrentlyActive ? 'Yes, Deactivate' : 'Yes, Activate',
      cancelButtonText: 'Cancel',
      confirmButtonColor: isCurrentlyActive ? '#ffc107' : '#28a745',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.ngZone.run(() => {
          const updatedSupervisor: Supervisor = {
            ...supervisor,
            active: !isCurrentlyActive,
            status: !isCurrentlyActive ? 'Active' : 'Inactive'
          };

          const supervisorIndex = this.supervisors.findIndex(s => s.email === supervisor.email);
          if (supervisorIndex !== -1) {
            this.supervisors[supervisorIndex] = updatedSupervisor;
            this.supervisors = [...this.supervisors];

            if (isCurrentlyActive && supervisor.assignedInterns && supervisor.assignedInterns.length > 0) {
              const replacementSupervisor = this.supervisors.find(s => 
                s.field === supervisor.field && 
                s.status === 'Active' && 
                s.email !== supervisor.email &&
                s.active !== false
              );

              if (replacementSupervisor) {
                supervisor.assignedInterns.forEach(internName => {
                  const intern = this.interns.find(i => i.name === internName);
                  if (intern) {
                    intern.supervisor = replacementSupervisor.name;
                  }
                });
                this.interns = [...this.interns];
                
                Swal.fire({
                  icon: 'info',
                  title: 'Interns Reassigned',
                  text: `${supervisor.assignedInterns.length} intern(s) have been reassigned to ${replacementSupervisor.name}.`,
                  timer: 3000,
                  showConfirmButton: false
                });
              } else {
                Swal.fire({
                  icon: 'warning',
                  title: 'No Replacement Found',
                  text: `No active supervisor found with field "${supervisor.field}". Interns will need to be manually reassigned.`,
                  timer: 3000,
                  showConfirmButton: false
                });
              }
            }

            this.cdr.markForCheck();
            this.cdr.detectChanges();
          }
        });

        Swal.fire({
          icon: 'success',
          title: isCurrentlyActive ? 'Deactivated!' : 'Activated!',
          text: `Supervisor "${supervisor.name}" has been ${isCurrentlyActive ? 'deactivated' : 'activated'} successfully.`,
          timer: 2000,
          showConfirmButton: false,
          didClose: () => {
            this.ngZone.run(() => {
              this.cdr.markForCheck();
              this.cdr.detectChanges();
            });
          }
        });
      }
    });
  }


  // ===== Locations Management =====
  locations: Location[] = [
    { id: 1, name: 'Main Campus', latitude: -22.9756, longitude: 30.4414, radius: 100, description: 'University of Venda Main Campus' },
    { id: 2, name: 'Library', latitude: -22.9760, longitude: 30.4420, radius: 50, description: 'University Library' }
  ];
  nextLocationId: number = 3;
  map: any = null;
  mapMarkers: any[] = [];
  selectedLocation: Location | null = null;
  isMapReady: boolean = false;
  selectedLat: number = -22.9756; // University of Venda coordinates
  selectedLng: number = 30.4414;
  currentLocation: { lat: number; lng: number } | null = null;
  userLocationMarker: any = null;

  initMap() {
    if (this.map) {
      return; // Map already initialized
    }

    const mapElement = document.getElementById('locations-map');
    if (!mapElement) {
      return;
    }

    // Check if Leaflet is loaded (wait a bit if script is still loading)
    const checkLeaflet = (attempts: number = 0) => {
      if (typeof L !== 'undefined') {
        this.initializeMapInstance(mapElement);
        return;
      }

      if (attempts < 10) {
        // Wait for Leaflet to load (check every 200ms for up to 2 seconds)
        setTimeout(() => checkLeaflet(attempts + 1), 200);
      } else {
        // Leaflet failed to load
        console.error('Leaflet library is not loaded. Please check your internet connection.');
        Swal.fire({
          icon: 'error',
          title: 'Map Library Not Available',
          html: `
            <div class="text-start">
              <p class="mb-3"><strong>Leaflet map library could not be loaded.</strong></p>
              <p class="mb-3">Please check your internet connection and try refreshing the page.</p>
              <div class="alert alert-info mb-0">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Note:</strong> Leaflet uses OpenStreetMap which is free and doesn't require an API key.
              </div>
            </div>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#0d6efd',
          width: '600px'
        });
      }
    };

    checkLeaflet();
  }

  initializeMapInstance(mapElement: HTMLElement) {
    if (this.map) {
      return; // Map already initialized
    }

    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      return;
    }

    try {
      // Initialize Leaflet map centered on University of Venda
      this.map = L.map(mapElement).setView([-22.9756, 30.4414], 16);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(this.map);

      // Add click listener to map
      this.map.on('click', (event: any) => {
        this.onMapClick(event);
      });

      this.isMapReady = true;
      this.loadLocationsOnMap();
    } catch (error) {
      console.error('Error initializing Leaflet map:', error);
      Swal.fire({
        icon: 'error',
        title: 'Map Initialization Failed',
        text: 'There was an error initializing the map. Please try refreshing the page.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#0d6efd'
      });
    }
  }

  onMapClick(event: any) {
    this.selectedLat = event.latlng.lat;
    this.selectedLng = event.latlng.lng;
    
    // Show input dialog for location name
    Swal.fire({
      title: 'Add New Location',
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label for="locationName" class="form-label fw-semibold">Location Name <span class="text-danger">*</span></label>
            <input type="text" id="locationName" class="form-control" placeholder="e.g., Building A, Library, etc." required>
          </div>
          <div class="mb-3">
            <label for="locationRadius" class="form-label fw-semibold">Radius (meters) <span class="text-danger">*</span></label>
            <input type="number" id="locationRadius" class="form-control" value="100" min="10" max="500" required>
            <small class="text-muted">Allowed radius for sign-in (10-500 meters)</small>
          </div>
          <div class="mb-3">
            <label for="locationDescription" class="form-label fw-semibold">Description</label>
            <textarea id="locationDescription" class="form-control" rows="2" placeholder="Optional description"></textarea>
          </div>
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i>
            Coordinates: ${this.selectedLat.toFixed(6)}, ${this.selectedLng.toFixed(6)}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Add Location',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('locationName') as HTMLInputElement)?.value;
        const radius = parseInt((document.getElementById('locationRadius') as HTMLInputElement)?.value || '100');
        const description = (document.getElementById('locationDescription') as HTMLTextAreaElement)?.value || '';

        if (!name || name.trim() === '') {
          Swal.showValidationMessage('Please enter a location name');
          return false;
        }

        if (isNaN(radius) || radius < 10 || radius > 500) {
          Swal.showValidationMessage('Radius must be between 10 and 500 meters');
          return false;
        }

        return { name: name.trim(), radius, description: description.trim() };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.addLocation(result.value.name, result.value.radius, result.value.description);
      }
    });
  }

  addLocation(name: string, radius: number, description: string = '') {
    const newLocation: Location = {
      id: this.nextLocationId++,
      name,
      latitude: this.selectedLat,
      longitude: this.selectedLng,
      radius,
      description
    };

    this.locations.push(newLocation);
    this.saveLocations(); // Save to localStorage
    this.loadLocationsOnMap();
    
    Swal.fire({
      icon: 'success',
      title: 'Location Added!',
      text: `"${name}" has been added successfully.`,
      timer: 2000,
      showConfirmButton: false
    });

    this.cdr.detectChanges();
  }

  getCurrentLocation() {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // Update map if it's already initialized
        if (this.map && this.isMapReady) {
          this.loadLocationsOnMap();
        }
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  loadLocationsOnMap() {
    if (!this.map || !this.isMapReady || typeof L === 'undefined') {
      return;
    }

    // Clear existing markers and circles
    this.mapMarkers.forEach(marker => {
      if (marker) {
        // Remove marker from map
        if (this.map && marker.remove) {
          this.map.removeLayer(marker);
        }
        // Remove associated circle if it exists
        if ((marker as any).circle && (marker as any).circle.remove) {
          this.map.removeLayer((marker as any).circle);
        }
      }
    });
    this.mapMarkers = [];

    // Remove user location marker if exists
    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
      this.userLocationMarker = null;
    }

    // Add current location marker if available
    if (this.currentLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="width: 20px; height: 20px; border-radius: 50%; background: #28a745; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      this.userLocationMarker = L.marker([this.currentLocation.lat, this.currentLocation.lng], {
        icon: userIcon,
        title: 'Your Current Location'
      }).addTo(this.map);

      // Add popup for current location
      this.userLocationMarker.bindPopup('<strong>Your Current Location</strong>');
    }

    // Add markers for each location
    this.locations.forEach(location => {
      // Create custom icon for marker
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="leaflet-custom-marker-icon"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      // Create marker
      const marker = L.marker([location.latitude, location.longitude], {
        icon: customIcon,
        title: location.name
      }).addTo(this.map);

      // Create circle for radius
      const circle = L.circle([location.latitude, location.longitude], {
        radius: location.radius,
        fillColor: '#0d6efd',
        fillOpacity: 0.2,
        color: '#0d6efd',
        weight: 2,
        opacity: 0.5
      }).addTo(this.map);

      // Create popup content
      const popupContent = `
        <div class="p-2">
          <h6 class="fw-bold mb-1">${location.name}</h6>
          <p class="mb-1 small">${location.description || 'No description'}</p>
          <p class="mb-0 small text-muted">Radius: ${location.radius}m</p>
        </div>
      `;

      // Bind popup to marker
      marker.bindPopup(popupContent);

      // Store circle reference on marker for cleanup
      (marker as any).circle = circle;

      // Add click listener to marker
      marker.on('click', () => {
        marker.openPopup();
      });

      this.mapMarkers.push(marker);
    });

    // Fit map to show all locations and current location
    if (this.locations.length > 0 || this.currentLocation) {
      const boundsPoints: [number, number][] = [];
      
      // Add all location points
      this.locations.forEach(loc => {
        boundsPoints.push([loc.latitude, loc.longitude]);
      });
      
      // Add current location if available
      if (this.currentLocation) {
        boundsPoints.push([this.currentLocation.lat, this.currentLocation.lng]);
      }
      
      if (boundsPoints.length > 0) {
        const bounds = L.latLngBounds(boundsPoints);
        this.map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }

  deleteLocation(location: Location) {
    Swal.fire({
      title: `Delete "${location.name}"?`,
      text: "This location will be removed permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.locations = this.locations.filter(l => l.id !== location.id);
        this.saveLocations(); // Save to localStorage
        this.loadLocationsOnMap();
        this.cdr.detectChanges();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `"${location.name}" has been removed.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  editLocation(location: Location) {
    Swal.fire({
      title: 'Edit Location',
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label for="editLocationName" class="form-label fw-semibold">Location Name <span class="text-danger">*</span></label>
            <input type="text" id="editLocationName" class="form-control" value="${location.name}" required>
          </div>
          <div class="mb-3">
            <label for="editLocationRadius" class="form-label fw-semibold">Radius (meters) <span class="text-danger">*</span></label>
            <input type="number" id="editLocationRadius" class="form-control" value="${location.radius}" min="10" max="500" required>
            <small class="text-muted">Allowed radius for sign-in (10-500 meters)</small>
          </div>
          <div class="mb-3">
            <label for="editLocationDescription" class="form-label fw-semibold">Description</label>
            <textarea id="editLocationDescription" class="form-control" rows="2" placeholder="Optional description">${location.description || ''}</textarea>
          </div>
          <div class="alert alert-info mb-0">
            <i class="bi bi-info-circle me-2"></i>
            Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      focusConfirm: false,
      preConfirm: () => {
        const name = (document.getElementById('editLocationName') as HTMLInputElement)?.value;
        const radius = parseInt((document.getElementById('editLocationRadius') as HTMLInputElement)?.value || '100');
        const description = (document.getElementById('editLocationDescription') as HTMLTextAreaElement)?.value || '';

        if (!name || name.trim() === '') {
          Swal.showValidationMessage('Please enter a location name');
          return false;
        }

        if (isNaN(radius) || radius < 10 || radius > 500) {
          Swal.showValidationMessage('Radius must be between 10 and 500 meters');
          return false;
        }

        return { name: name.trim(), radius, description: description.trim() };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        location.name = result.value.name;
        location.radius = result.value.radius;
        location.description = result.value.description;
        this.saveLocations(); // Save to localStorage
        this.loadLocationsOnMap();
        this.cdr.detectChanges();
        
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `"${location.name}" has been updated.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // ===== Constructor =====
  constructor(
    private authService: Auth, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.admin = {
        name: this.authService.getAdminName(),
        email: this.authService.getAdminEmail(),
        role: 'Administrator',
        Department: 'ICT',
      };
    }
    // Set current date
    const today = new Date();
    this.currentDate = today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Load locations from localStorage
    this.loadLocations();

    // Load seen leave requests from localStorage
    this.loadSeenLeaveRequests();
    
    // Check for new leave requests after a short delay
    setTimeout(() => {
      this.checkForNewLeaveRequests();
    }, 1000);
  }

  // ===== Locations Storage =====
  saveLocations(): void {
    localStorage.setItem('adminLocations', JSON.stringify(this.locations));
    localStorage.setItem('adminLocationsNextId', this.nextLocationId.toString());
  }

  loadLocations(): void {
    const saved = localStorage.getItem('adminLocations');
    if (saved) {
      try {
        this.locations = JSON.parse(saved);
        // Update nextLocationId
        const savedNextId = localStorage.getItem('adminLocationsNextId');
        if (savedNextId) {
          this.nextLocationId = parseInt(savedNextId, 10);
        } else {
          // Calculate next ID from existing locations
          this.nextLocationId = Math.max(...this.locations.map(l => l.id), 0) + 1;
        }
      } catch (e) {
        console.error('Error loading locations:', e);
        // Keep default locations if parsing fails
      }
    }
  }
}
