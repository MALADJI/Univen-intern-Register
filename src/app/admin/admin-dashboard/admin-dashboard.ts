import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth'; // Update path if necessary

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

interface LeaveRequest {
  name: string;
  email: string;
  department: string;
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
  Department:string
}

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

  // ===== Admin User Card =====
  admin: Admin | null = null;

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ===== Navigation =====
  activeSection: string = 'overview';

  // ===== Overview =====
  overviewStats: OverviewStat[] = [
    { label: 'Total Interns', value: 12, icon: 'bi bi-people-fill', color: 'primary' },
    { label: 'Present Today', value: 8, icon: 'bi bi-check-circle', color: 'success' },
    { label: 'On Leave', value: 2, icon: 'bi bi-clock', color: 'warning' },
    { label: 'Absent', value: 2, icon: 'bi bi-x-circle', color: 'danger' },
  ];

  overviewAttendance: AttendanceRecord[] = [
    { name: 'Alice', department: 'Marketing', present: 4, absent: 1, leave: 0, attendanceRate: 80, field: 'Digital' },
    { name: 'Bob', department: 'Development', present: 5, absent: 0, leave: 1, attendanceRate: 100, field: 'Frontend' },
    { name: 'Charlie', department: 'Design', present: 3, absent: 2, leave: 0, attendanceRate: 60, field: 'UI/UX' },
  ];

  overviewLeaves: LeaveRequest[] = [
    {
      name: 'Alice',
      email: 'alice@example.com',
      department: 'Marketing',
      startDate: '2025-11-04',
      endDate: '2025-11-05',
      reason: 'Medical',
      status: 'Pending',
      document: 'assets/docs/alice.pdf',
    },
    {
      name: 'Bob',
      email: 'bob@example.com',
      department: 'Development',
      startDate: '2025-11-06',
      endDate: '2025-11-06',
      reason: 'Personal',
      status: 'Approved',
    },
  ];

  // ===== Interns =====
  interns: Intern[] = [
    { name: 'Alice', email: 'alice@example.com', supervisor: 'John Doe', department: 'Marketing', field: 'Digital', status: 'Present', recordsByDay: {} },
    { name: 'Bob', email: 'bob@example.com', supervisor: 'Jane Smith', department: 'Development', field: 'Frontend', status: 'On Leave', recordsByDay: {} },
    { name: 'Charlie', email: 'charlie@example.com', supervisor: 'John Doe', department: 'Design', field: 'UI/UX', status: 'Absent', recordsByDay: {} },
  ];

  internSearch: string = '';
  get filteredInterns(): Intern[] {
    if (!this.internSearch) return this.interns;
    return this.interns.filter((i) => i.name.toLowerCase().includes(this.internSearch.toLowerCase()));
  }

  // ===== Leave Requests =====
  leaveRequests: LeaveRequest[] = [...this.overviewLeaves];
  clearedLeaveRequests: LeaveRequest[] = [];

  approveRequest(request: LeaveRequest) { request.status = 'Approved'; }
  declineRequest(request: LeaveRequest) { request.status = 'Declined'; }
  clearLeaveRequest(index: number) {
    this.clearedLeaveRequests.push(this.leaveRequests[index]);
    this.leaveRequests.splice(index, 1);
  }
  undoClear() {
    this.leaveRequests.push(...this.clearedLeaveRequests);
    this.clearedLeaveRequests = [];
  }

  // ===== Attendance History =====
  internsForWeek: Intern[] = [
    {
      name: 'Alice', email: 'alice@example.com', supervisor: 'John Doe', department: 'Marketing', field: 'Digital', status: 'Present',
      recordsByDay: {
        Monday: { action: 'Signed In', timeIn: new Date(), timeOut: new Date() },
        Tuesday: { action: 'Signed In', timeIn: new Date(), timeOut: new Date() },
        Wednesday: { action: 'On Leave' },
        Thursday: { action: 'Signed In', timeIn: new Date(), timeOut: new Date() },
        Friday: { action: 'Signed In', timeIn: new Date(), timeOut: new Date() },
      },
    },
  ];

  historyFilterMonday?: string;
  historyFilterFriday?: string;
  historyFilterName: string = '';
  historyFilterDepartment: string = '';
  historyFilterField: string = '';
  weekendSelected: boolean = false;

  departmentList: string[] = ['ICT','Marketing','HR','Finance','Design'];
  fieldMap: { [department: string]: string[] } = {
    'ICT': ['Software Development','Support','Networking','Music','business analysis'],
    'Marketing': ['Digital','Content','SEO','PR'],
    'HR': ['Recruitment','Payroll','Employee Relations'],
    'Finance': ['Accounting','Auditing','Budgeting'],
    'Design': ['UI/UX','Graphics','Product'],

  };

  filteredFieldsForHistory: string[] = [];
  filteredFieldsForReport: string[] = [];

  // ===== Filter Helpers =====
  updateHistoryFields() {
    this.filteredFieldsForHistory = this.historyFilterDepartment ? this.fieldMap[this.historyFilterDepartment] : [];
    this.historyFilterField = '';
  }

  updateReportFields() {
    this.filteredFieldsForReport = this.reportDepartment ? this.fieldMap[this.reportDepartment] : [];
    this.reportField = '';
  }

  getWeeklyRegister(): Intern[] {
    return this.internsForWeek.filter((i) => {
      if (this.historyFilterName && !i.name.toLowerCase().includes(this.historyFilterName.toLowerCase())) return false;
      if (this.historyFilterDepartment && i.department !== this.historyFilterDepartment) return false;
      if (this.historyFilterField && i.field !== this.historyFilterField) return false;
      return true;
    });
  }

  resetHistoryFilter() {
    this.historyFilterMonday = '';
    this.historyFilterFriday = '';
    this.historyFilterName = '';
    this.historyFilterDepartment = '';
    this.historyFilterField = '';
    this.weekendSelected = false;
    this.filteredFieldsForHistory = [];
  }

  // ===== Reports =====
  reportInternName: string = '';
  reportDepartment: string = '';
  reportField: string = '';
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

  downloadReportPDF() { alert('Export PDF triggered!'); }
  downloadReportExcel() { alert('Export Excel triggered!'); }

  // ===== Helpers =====
  filteredLogs: Intern[] = [];

  openEditModal(index: number) { alert(`Edit intern ${this.interns[index].name}`); }
  removeIntern(index: number) {
    const intern = this.interns[index];
    if (confirm(`Are you sure you want to remove ${intern.name}?`)) {
      this.interns.splice(index, 1);
    }
  }

  showSection(section: string) { this.activeSection = section; }

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
        Department:'Ict'
      };
    }
  }
}
