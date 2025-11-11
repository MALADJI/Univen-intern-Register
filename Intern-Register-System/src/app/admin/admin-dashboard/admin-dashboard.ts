import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { ApiService } from '../../services/api.service';
import { Sidebar } from '../../shared/sidebar/sidebar';
import Swal from 'sweetalert2';


// ===== Interfaces =====
interface OverviewStat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface AttendanceRecord {
  name: string;
  department: string;
  present: number;
  absent: number;
  leave: number;
  attendanceRate: number;
  field?: string;
}
interface Supervisor {
  name: string;
  email: string;
  department: string;
  field: string;
  assignedInterns?: string[];
  status: 'Active' | 'On Leave' | 'Inactive';
}

interface LeaveRequest {
  requestId?: number;
  internId?: number;
  name: string;
  email: string;
  department: string;
  field?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Declined';
  document?: string;
}

interface Intern {
  name: string;
  email: string;
  supervisor: string;
  department: string;
  field: string;
  status: 'Present' | 'Absent' | 'On Leave';
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

// ===== Typed dashboard sections =====
type DashboardSection = 'overview'|'Manage Department' |'Supervisor'| 'interns' | 'Intern Leave status' |'Attendance history'| 'reports';

// ===== Component =====
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  providers: [DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  // ===== Admin Info =====
  admin: Admin | null = null;

  // ===== Dashboard Sections =====
  sections: DashboardSection[] = ['overview','Manage Department','Supervisor', 'interns', 'Intern Leave status','Attendance history', 'reports'];
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
  };

  // ===== Navigation =====
  showSection(section: DashboardSection) {
    this.activeSection = section;
  }

  // Wrapper for sidebar compatibility (accepts string)
  handleSectionChange(section: string): void {
    // Convert string to DashboardSection type
    const validSections: DashboardSection[] = ['overview', 'Manage Department', 'Supervisor', 'interns', 'Intern Leave status', 'Attendance history', 'reports'];
    if (validSections.includes(section as DashboardSection)) {
      this.showSection(section as DashboardSection);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ===== Overview Stats =====
  overviewStats: OverviewStat[] = [
    { label: 'Total Interns', value: 0, icon: 'bi bi-people-fill', color: 'primary' },
    { label: 'Present Today', value: 0, icon: 'bi bi-check-circle', color: 'success' },
    { label: 'On Leave', value: 0, icon: 'bi bi-clock', color: 'warning' },
    { label: 'Absent', value: 0, icon: 'bi bi-x-circle', color: 'danger' },
  ];

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
        this.apiService.createDepartment({ name: deptName }).subscribe({
          next: (dept) => {
        Swal.fire('Added!', `Department "${deptName}" has been added.`, 'success');
            this.loadDepartments(); // Reload departments
          },
          error: (error) => {
            Swal.fire('Error', error.error?.error || 'Failed to add department', 'error');
          }
        });
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
        const department = this.departments.find((d: any) => d.name === dept);
        if (department) {
          this.apiService.deleteDepartment(department.departmentId).subscribe({
            next: () => {
        Swal.fire('Deleted!', `Department "${dept}" has been deleted.`, 'success');
              this.loadDepartments(); // Reload departments
            },
            error: (error) => {
              Swal.fire('Error', error.error?.error || 'Failed to delete department', 'error');
            }
          });
        }
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
        this.fieldMap[dept][index] = result.value.trim();
        Swal.fire('Updated!', `Field updated to "${result.value}".`, 'success');
      }
    });
  }

// DELETE FIELD
  deleteField(dept: string, index: number) {
    Swal.fire({
      title: `Delete "${this.fieldMap[dept][index]}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.fieldMap[dept].splice(index, 1);
        Swal.fire('Deleted!', 'Field has been deleted.', 'success');
      }
    });
  }

  // ===== Attendance Summary (Absent Modal) =====
  overviewAttendance: AttendanceRecord[] = [];

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
  overviewLeaves: LeaveRequest[] = [];
  leaveRequests: LeaveRequest[] = [];

  // ===== Interns =====
  interns: Intern[] = [];
  allInterns: any[] = [];

  internSearch = '';
  internFilterDepartment = '';
  internFilterField = '';
  filteredFieldsForInterns: string[] = [];
  internPage = 1;
  internPerPage = 5;

  // ===== Updated filteredInterns Getter =====
  get filteredInterns(): Intern[] {
    return this.interns
      .filter(i => !this.internFilterDepartment || i.department === this.internFilterDepartment)
      .filter(i => !this.internFilterField || i.field === this.internFilterField)
      .filter(i => !this.internSearch || i.name.toLowerCase().includes(this.internSearch.toLowerCase()));
  }

  // ===== Pagination helpers for interns =====
  get paginatedInterns(): Intern[] {
    const start = (this.internPage - 1) * this.internPerPage;
    return this.filteredInterns.slice(start, start + this.internPerPage);
  }

  get totalInternPages(): number {
    return Math.ceil(this.filteredInterns.length / this.internPerPage) || 1;
  }

  prevInternPage() { if (this.internPage > 1) this.internPage--; }
  nextInternPage() { if (this.internPage < this.totalInternPages) this.internPage++; }

// ===== Filter helper =====
  updateFilteredInterns() {
    this.internPage = 1;
    this.filteredFieldsForInterns = this.internFilterDepartment ? this.fieldMap[this.internFilterDepartment] || [] : [];
    this.internFilterField = '';
  }

  // ===== Leave Requests actions =====
  clearedLeaveRequests: LeaveRequest[] = [];
  backendLeaveRequests: any[] = []; // Store backend data with IDs

  approveRequest(request: LeaveRequest) {
    // Use requestId directly from the request object
    const requestId = request.requestId;
    
    if (!requestId) {
      // Fallback: Find matching backend leave request
      const backendLeave = this.backendLeaveRequests.find((lr: any) => 
        lr.requestId && (
          (lr.intern?.name === request.name && lr.fromDate === request.startDate) ||
          (lr.intern?.internId === request.internId && lr.fromDate === request.startDate) ||
          (lr.intern?.email === request.email && lr.fromDate === request.startDate)
        )
      );
      
      if (backendLeave?.requestId) {
        this.apiService.approveLeaveRequest(backendLeave.requestId).subscribe({
          next: () => {
    request.status = 'Approved';
            Swal.fire('Approved!', 'Leave request has been approved.', 'success');
            this.loadLeaveRequests(); // Reload to get updated data
          },
          error: (error) => {
            console.error('Error approving leave request:', error);
            Swal.fire('Error', error.error?.error || 'Failed to approve leave request', 'error');
          }
        });
      } else {
        console.error('Leave request not found:', request);
        Swal.fire('Error', 'Leave request not found. Please refresh the page.', 'error');
      }
    } else {
      // Use the requestId directly
      this.apiService.approveLeaveRequest(requestId).subscribe({
        next: () => {
          request.status = 'Approved';
          Swal.fire('Approved!', 'Leave request has been approved.', 'success');
          this.loadLeaveRequests(); // Reload to get updated data
        },
        error: (error) => {
          console.error('Error approving leave request:', error);
          Swal.fire('Error', error.error?.error || 'Failed to approve leave request', 'error');
        }
      });
    }
  }

  declineRequest(request: LeaveRequest) {
    // Use requestId directly from the request object
    const requestId = request.requestId;
    
    if (!requestId) {
      // Fallback: Find matching backend leave request
      const backendLeave = this.backendLeaveRequests.find((lr: any) => 
        lr.requestId && (
          (lr.intern?.name === request.name && lr.fromDate === request.startDate) ||
          (lr.intern?.internId === request.internId && lr.fromDate === request.startDate) ||
          (lr.intern?.email === request.email && lr.fromDate === request.startDate)
        )
      );
      
      if (backendLeave?.requestId) {
        this.apiService.rejectLeaveRequest(backendLeave.requestId).subscribe({
          next: () => {
    request.status = 'Declined';
            Swal.fire('Rejected!', 'Leave request has been rejected.', 'success');
            this.loadLeaveRequests(); // Reload to get updated data
          },
          error: (error) => {
            console.error('Error rejecting leave request:', error);
            Swal.fire('Error', error.error?.error || 'Failed to reject leave request', 'error');
          }
        });
      } else {
        console.error('Leave request not found:', request);
        Swal.fire('Error', 'Leave request not found. Please refresh the page.', 'error');
      }
    } else {
      // Use the requestId directly
      this.apiService.rejectLeaveRequest(requestId).subscribe({
        next: () => {
          request.status = 'Declined';
          Swal.fire('Rejected!', 'Leave request has been rejected.', 'success');
          this.loadLeaveRequests(); // Reload to get updated data
        },
        error: (error) => {
          console.error('Error rejecting leave request:', error);
          Swal.fire('Error', error.error?.error || 'Failed to reject leave request', 'error');
        }
      });
    }
  }

  clearLeaveRequest(index: number) {
    const item = this.leaveRequests.splice(index, 1)[0];
    if (item) this.clearedLeaveRequests.push(item);
  }

  undoClear() {
    this.leaveRequests.push(...this.clearedLeaveRequests);
    this.clearedLeaveRequests = [];
  }



  // ===== Leave Requests Filters & Pagination =====
  leaveFilterName = '';
  leaveFilterDepartment = '';
  leaveFilterField = '';
  filteredLeaveFields: string[] = [];

  leaveCurrentPage = 1;
  leaveItemsPerPage = 10; // Number of rows per page

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
  }> = [];

  filteredLogs: any[] = [];
  historyFilterMonday: string = '';
  historyFilterFriday: string = '';
  historyFilterName: string = '';
  historyFilterDepartment: string = '';
  historyFilterField: string = '';
  weekendSelected: boolean = false;

// ===== Departments & Fields =====
  departmentList: string[] = [];
  departments: any[] = [];
  fieldMap: { [dept: string]: string[] } = {};
  fieldList: string[] = [];
  filteredFieldsForHistory: string[] = [];
  filteredFieldsForReport: string[] = [];

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
    this.historyPage = 1; // reset pagination
    return result;
  }

  resetHistoryFilter() {
    this.historyFilterMonday = '';
    this.historyFilterFriday = '';
    this.historyFilterName = '';
    this.historyFilterDepartment = '';
    this.historyFilterField = '';
    this.weekendSelected = false;
    this.filteredLogs = [];
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
  historyPage = 1;
  historyPerPage = 3;

  get totalHistoryPages(): number {
    return Math.ceil(this.internsForWeek.length / this.historyPerPage) || 1;
  }

  get paginatedHistoryInterns(): any[] {
    const start = (this.historyPage - 1) * this.historyPerPage;
    return this.internsForWeek.slice(start, start + this.historyPerPage);
  }

  prevHistoryPage() {
    if (this.historyPage > 1) this.historyPage--;
  }

  nextHistoryPage() {
    if (this.historyPage < this.totalHistoryPages) this.historyPage++;
  }

  // ===== Reports =====
  reportInternName = '';
  reportDepartment = '';
  reportField = '';
  filteredReportData: AttendanceRecord[] = [];

  generateReport() {
    this.filteredReportData = this.overviewAttendance.filter((r) => {
      if (this.reportInternName && !r.name.toLowerCase().includes(this.reportInternName.toLowerCase())) return false;
      if (this.reportDepartment && r.department !== this.reportDepartment) return false;
      if (this.reportField && r.field !== this.reportField) return false;
      return true;
    });
  }

  resetReportFilter() {
    this.reportInternName = '';
    this.reportDepartment = '';
    this.reportField = '';
    this.filteredReportData = [...this.overviewAttendance];
    this.filteredFieldsForReport = [];
  }


  downloadReportPDF() {
    const params: any = {};
    if (this.reportInternName && this.reportInternName.trim()) params.internName = this.reportInternName.trim();
    if (this.reportDepartment && this.reportDepartment.trim()) {
      // Remove " Department" suffix if present
      let dept = this.reportDepartment.trim();
      if (dept.endsWith(' Department')) {
        dept = dept.replace(' Department', '');
      }
      params.department = dept;
    }
    if (this.reportField && this.reportField.trim()) params.field = this.reportField.trim();
    
    this.apiService.downloadAttendanceReportPDF(params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance-report-${new Date().getTime()}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        Swal.fire('Success', 'PDF report downloaded successfully', 'success');
      },
      error: (error) => {
        Swal.fire('Error', 'Failed to download PDF report', 'error');
      }
    });
  }

  downloadReportExcel() {
    const params: any = {};
    if (this.reportInternName && this.reportInternName.trim()) params.internName = this.reportInternName.trim();
    if (this.reportDepartment && this.reportDepartment.trim()) {
      // Remove " Department" suffix if present
      let dept = this.reportDepartment.trim();
      if (dept.endsWith(' Department')) {
        dept = dept.replace(' Department', '');
      }
      params.department = dept;
    }
    if (this.reportField && this.reportField.trim()) params.field = this.reportField.trim();
    
    this.apiService.downloadAttendanceReportExcel(params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance-report-${new Date().getTime()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        Swal.fire('Success', 'Excel report downloaded successfully', 'success');
      },
      error: (error) => {
        Swal.fire('Error', 'Failed to download Excel report', 'error');
      }
    });
  }

  // ===== Helpers =====
  openEditModal(index: number) {
    alert(`Edit intern ${this.interns[index].name}`);
  }

  removeIntern(index: number) {
    const intern = this.interns[index];
    if (confirm(`Are you sure you want to remove ${intern.name}?`)) {
      this.interns.splice(index, 1);
    }
  }

  // ===== SUPERVISORS SECTION =====
  supervisors: Supervisor[] = [];

// Filters
  supervisorSearch: string = '';
  supervisorFilterDepartment: string = '';
  supervisorFilterField: string = '';
  filteredFieldsForSupervisors: string[] = [];

// Pagination
  supervisorPage: number = 1;
  supervisorPerPage: number = 5;

// Derived + Helper data
  get filteredSupervisors(): Supervisor[] {
    return this.supervisors
      .filter(s => !this.supervisorSearch || s.name.toLowerCase().includes(this.supervisorSearch.toLowerCase()))
      .filter(s => !this.supervisorFilterDepartment || s.department === this.supervisorFilterDepartment)
      .filter(s => !this.supervisorFilterField || s.field === this.supervisorFilterField);
  }

  get paginatedSupervisors(): Supervisor[] {
    const start = (this.supervisorPage - 1) * this.supervisorPerPage;
    return this.filteredSupervisors.slice(start, start + this.supervisorPerPage);
  }

  get totalSupervisorPages(): number {
    return Math.ceil(this.filteredSupervisors.length / this.supervisorPerPage) || 1;
  }

// Pagination helpers
  prevSupervisorPage() {
    if (this.supervisorPage > 1) this.supervisorPage--;
  }

  nextSupervisorPage() {
    if (this.supervisorPage < this.totalSupervisorPages) this.supervisorPage++;
  }

// Filter helpers
  updateFilteredSupervisors() {
    this.supervisorPage = 1;
    this.filteredFieldsForSupervisors = this.supervisorFilterDepartment ? this.fieldMap[this.supervisorFilterDepartment] || [] : [];
    this.supervisorFilterField = '';
  }

// Actions
  openEditSupervisorModal(index: number) {
    alert(`Edit supervisor: ${this.supervisors[index].name}`);
  }

  removeSupervisor(index: number) {
    const supervisor = this.supervisors[index];
    if (confirm(`Are you sure you want to remove ${supervisor.name}?`)) {
      this.supervisors.splice(index, 1);
    }
  }


  // ===== Constructor =====
  constructor(
    private authService: Auth, 
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Use stored user data first (fastest, no API call needed)
    const storedUser = this.authService.getCurrentUser();
    if (storedUser) {
      this.admin = {
        name: storedUser.username || storedUser.name || 'Admin',
        email: storedUser.email || storedUser.username || '',
        role: 'Administrator',
        Department: 'ICT',
      };
    }
    
    // Try to fetch enhanced user data from backend (optional - won't cause logout on 401)
    this.authService.fetchCurrentUser()
      .then((user) => {
        this.admin = {
          name: user.username || this.admin.name || 'Admin',
          email: user.email || this.admin.email || '',
          role: 'Administrator',
          Department: 'ICT',
        };
        // Load all data from backend
        this.loadAllData();
      })
      .catch((error) => {
        // Don't log error if it's just a 401 - use stored user data
        if (error.status !== 401) {
          console.error('Error fetching user data:', error);
        }
        // Use stored user data (already set above)
        // Still try to load data from backend
        this.loadAllData();
      });
  }

  // Load all data from backend
  loadAllData(): void {
    this.loadDepartments();
    this.loadInterns();
    this.loadSupervisors();
    this.loadLeaveRequests();
    this.loadAttendance();
    this.calculateOverviewStats();
  }

  // Load departments
  loadDepartments(): void {
    this.apiService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.departmentList = departments.map((d: any) => d.name);
        // Build field map from departments (if fields exist in backend)
        this.fieldMap = {};
        departments.forEach((dept: any) => {
          this.fieldMap[dept.name] = dept.fields || [];
        });
        this.fieldList = Object.values(this.fieldMap).flat();
      },
      error: (error) => {
        // Suppress 403 errors (user might not have permission)
        if (error.status === 403 || error.status === 401) {
          console.warn('Access denied to departments endpoint');
          return;
        }
        console.error('Error loading departments:', error);
        // Only show error for non-auth issues
        if (error.status !== 403 && error.status !== 401) {
          Swal.fire('Error', 'Failed to load departments', 'error');
        }
      }
    });
  }

  // Load interns
  loadInterns(): void {
    this.apiService.getInterns().subscribe({
      next: (interns) => {
        this.allInterns = interns;
        this.interns = interns.map((intern: any) => ({
          name: intern.name,
          email: intern.email,
          supervisor: intern.supervisor?.name || 'N/A',
          department: intern.department?.name || 'N/A',
          field: intern.field || 'N/A',
          status: this.calculateInternStatus(intern),
          recordsByDay: {}
        }));
        this.calculateOverviewStats();
      },
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          console.warn('Access denied to interns endpoint');
          return;
        }
        console.error('Error loading interns:', error);
        if (error.status !== 403 && error.status !== 401) {
          Swal.fire('Error', 'Failed to load interns', 'error');
        }
      }
    });
  }

  // Calculate intern status based on attendance
  calculateInternStatus(intern: any): 'Present' | 'Absent' | 'On Leave' {
    // This will be calculated based on today's attendance
    // For now, default to 'Absent'
    return 'Absent';
  }

  // Load supervisors
  loadSupervisors(): void {
    this.apiService.getSupervisors().subscribe({
      next: (supervisors) => {
        this.supervisors = supervisors.map((sup: any) => ({
          name: sup.name,
          email: sup.email,
          department: sup.department?.name || 'N/A',
          field: sup.field || 'N/A',
          assignedInterns: [],
          status: 'Active' as 'Active' | 'On Leave' | 'Inactive'
        }));
      },
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          console.warn('Access denied to supervisors endpoint');
          return;
        }
        console.error('Error loading supervisors:', error);
      }
    });
  }

  // Load leave requests
  loadLeaveRequests(): void {
    this.apiService.getLeaveRequests().subscribe({
      next: (leaves) => {
        this.backendLeaveRequests = leaves; // Store backend data with IDs
        this.leaveRequests = leaves.map((leave: any) => ({
          requestId: leave.requestId || leave.id, // Store the request ID
          internId: leave.intern?.internId || leave.internId || null, // Store intern ID
          name: leave.intern?.name || 'Unknown',
          email: leave.intern?.email || '',
          department: leave.intern?.department?.name || 'N/A',
          field: leave.intern?.field || 'N/A',
          startDate: leave.fromDate,
          endDate: leave.toDate,
          reason: leave.reason || '',
          status: this.mapLeaveStatus(leave.status),
          document: leave.attachmentPath
        }));
        this.overviewLeaves = [...this.leaveRequests];
        this.calculateOverviewStats();
      },
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          console.warn('Access denied to leave requests endpoint');
          return;
        }
        console.error('Error loading leave requests:', error);
      }
    });
  }

  // Map backend leave status to frontend status
  mapLeaveStatus(status: string): 'Approved' | 'Pending' | 'Declined' {
    if (status === 'APPROVED') return 'Approved';
    if (status === 'PENDING') return 'Pending';
    if (status === 'REJECTED') return 'Declined';
    return 'Pending';
  }

  // Load attendance
  loadAttendance(): void {
    this.apiService.getAttendance().subscribe({
      next: (attendance) => {
        this.logs = attendance.map((att: any) => ({
          intern: att.intern?.name || 'Unknown',
          date: new Date(att.date),
          location: att.location || 'N/A',
          timeIn: att.timeIn ? new Date(att.timeIn) : null,
          timeOut: att.timeOut ? new Date(att.timeOut) : null,
          action: att.status === 'SIGNED_IN' ? 'Signed In' : 'Signed Out'
        }));
        this.calculateAttendanceRecords();
        this.calculateOverviewStats();
      },
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          console.warn('Access denied to attendance endpoint');
          return;
        }
        console.error('Error loading attendance:', error);
      }
    });
  }

  // Calculate attendance records for overview
  calculateAttendanceRecords(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendanceMap: { [key: string]: any } = {};
    
    // Group attendance by intern
    this.logs.forEach(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      
      if (logDate.getTime() === today.getTime()) {
        const internName = log.intern;
        if (!attendanceMap[internName]) {
          attendanceMap[internName] = {
            name: internName,
            present: 0,
            absent: 0,
            leave: 0
          };
        }
        
        if (log.action === 'Signed In' || log.action === 'Signed Out') {
          attendanceMap[internName].present = 1;
        }
      }
    });
    
    // Check leave requests for today
    this.leaveRequests.forEach(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      if (today >= startDate && today <= endDate && leave.status === 'Approved') {
        if (attendanceMap[leave.name]) {
          attendanceMap[leave.name].leave = 1;
          attendanceMap[leave.name].present = 0;
        }
      }
    });
    
    // Convert to array and calculate rates
    this.overviewAttendance = Object.values(attendanceMap).map((record: any) => {
      const intern = this.allInterns.find((i: any) => i.name === record.name);
      return {
        ...record,
        department: intern?.department?.name || 'N/A',
        field: intern?.field || 'N/A',
        attendanceRate: record.present > 0 ? 100 : 0
      };
    });
  }

  // Calculate overview statistics
  calculateOverviewStats(): void {
    const totalInterns = this.allInterns.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Count present today
    const presentToday = this.logs.filter(log => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && 
             (log.action === 'Signed In' || log.action === 'Signed Out');
    }).length;
    
    // Count on leave today
    const onLeaveToday = this.leaveRequests.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return today >= startDate && today <= endDate && leave.status === 'Approved';
    }).length;
    
    // Calculate absent
    const absentToday = totalInterns - presentToday - onLeaveToday;
    
    this.overviewStats = [
      { label: 'Total Interns', value: totalInterns, icon: 'bi bi-people-fill', color: 'primary' },
      { label: 'Present Today', value: presentToday, icon: 'bi bi-check-circle', color: 'success' },
      { label: 'On Leave', value: onLeaveToday, icon: 'bi bi-clock', color: 'warning' },
      { label: 'Absent', value: Math.max(0, absentToday), icon: 'bi bi-x-circle', color: 'danger' },
    ];
  }
}
