declare var bootstrap: any;

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
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
  name: string;
  email: string;
  department: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Approved' | 'Pending' | 'Declined';
  document?: string;
  field?: string;
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
  imports: [CommonModule, FormsModule],
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ===== Overview Stats =====
  overviewStats: OverviewStat[] = [
    { label: 'Total Interns', value: 12, icon: 'bi bi-people-fill', color: 'primary' },
    { label: 'Present Today', value: 8, icon: 'bi bi-check-circle', color: 'success' },
    { label: 'On Leave', value: 2, icon: 'bi bi-clock', color: 'warning' },
    { label: 'Absent', value: 2, icon: 'bi bi-x-circle', color: 'danger' },
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
        this.departmentList.push(deptName);
        this.fieldMap[deptName] = [];
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
        this.departmentList.splice(index, 1);
        delete this.fieldMap[dept];
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
  overviewAttendance: AttendanceRecord[] = [
    { name: 'Alice', department: 'Marketing', present: 4, absent: 1, leave: 0, attendanceRate: 80, field: 'Digital' },
    { name: 'Bob', department: 'Development', present: 5, absent: 0, leave: 1, attendanceRate: 100, field: 'Frontend' },
    { name: 'Charlie', department: 'Design', present: 3, absent: 2, leave: 0, attendanceRate: 60, field: 'UI/UX' },
    { name: 'Mack', department: 'ICT', present: 3, absent: 2, leave: 0, attendanceRate: 60, field: 'Software' },
    { name: 'Joseph', department: 'Finance', present: 3, absent: 2, leave: 0, attendanceRate: 60, field: 'Accounting' },
  ];

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
  overviewLeaves: LeaveRequest[] = [
    { name: 'Alice', email: 'alice@example.com', department: 'Marketing', field: 'CEO', startDate: '2025-11-04', endDate: '2025-11-05', reason: 'Medical', status: 'Pending', document: 'assets/docs/alice.pdf' },
    { name: 'Bob', email: 'bob@example.com', department: 'HR', field: 'Payroll', startDate: '2025-11-06', endDate: '2025-11-06', reason: 'Personal', status: 'Approved' },
    { name: 'Charlie', email: 'charlie@example.com', department: 'Design', field: 'Graphics', startDate: '2025-11-06', endDate: '2025-11-06', reason: 'Personal', status: 'Approved' },
    { name: 'Mack', email: 'mack@example.com', department: 'ICT', field: 'Software', startDate: '2025-11-06', endDate: '2025-11-06', reason: 'Personal', status: 'Approved' },
    { name: 'Dash', email: 'dash@example.com', department: 'Finance', field: 'Accounting', startDate: '2025-11-06', endDate: '2025-11-06', reason: 'Personal', status: 'Approved' },
  ];

  // ===== Interns =====
  interns: Intern[] = [
    { name: 'Alice', email: 'alice@example.com', supervisor: 'John Doe', department: 'Marketing', field: 'Digital', status: 'Present', recordsByDay: {} },
    { name: 'Bob', email: 'bob@example.com', supervisor: 'Jane Smith', department: 'Development', field: 'Frontend', status: 'On Leave', recordsByDay: {} },
    { name: 'Charlie', email: 'charlie@example.com', supervisor: 'John Doe', department: 'Design', field: 'UI/UX', status: 'Absent', recordsByDay: {} },
  ];

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
  leaveRequests: LeaveRequest[] = [...this.overviewLeaves];
  clearedLeaveRequests: LeaveRequest[] = [];

  approveRequest(request: LeaveRequest) {
    request.status = 'Approved';
  }

  declineRequest(request: LeaveRequest) {
    request.status = 'Declined';
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
  leaveItemsPerPage = 2; // Number of rows per page

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
  filteredReportData: AttendanceRecord[] = [...this.overviewAttendance];

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
    alert('Export PDF triggered!');
  }

  downloadReportExcel() {
    alert('Export Excel triggered!');
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
  supervisors: Supervisor[] = [
    { name: 'John Doe', email: 'john@example.com', department: 'ICT', field: 'Software Development', assignedInterns: ['Alice', 'Charlie'], status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', field: 'Digital Marketing', assignedInterns: ['Bob'], status: 'On Leave' },
    { name: 'Mike Brown', email: 'mike@example.com', department: 'Finance', field: 'Accounting', assignedInterns: [], status: 'Inactive' },
  ];

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
  constructor(private authService: Auth, private router: Router) {}

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
  }
}
