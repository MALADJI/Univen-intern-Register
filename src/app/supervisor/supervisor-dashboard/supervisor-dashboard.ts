import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisor-dashboard.html',
  styleUrls: ['./supervisor-dashboard.css']
})
export class SupervisorDashboard implements OnInit {

  constructor(private authService: Auth) {
    this.updateSummaries();
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.supervisor = {
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        Department:currentUser.Department ,
        field:currentUser.field || 'Supervisor'
      };
    } else {
      this.supervisor = {
        name: 'Unknown Supervisor',
        email: 'unidentified@univen.ac.za',
        role: 'Supervisor',
        Department:'Uknown Department',
        field:'unknown field'
      };
    }
  }

  // ===== Navigation =====
  activeSection: 'overview' | 'interns' | 'Intern Leave status' | 'history' | 'reports' = 'overview';

  showSection(section: string) {
    const validSections: Array<'overview' | 'interns' | 'Intern Leave status' | 'history' | 'reports'> = [
      'overview', 'interns', 'Intern Leave status', 'history', 'reports'
    ];
    if (validSections.includes(section as any)) {
      this.activeSection = section as
        | 'overview'
        | 'interns'
        | 'Intern Leave status'
        | 'history'
        | 'reports';
    }
  }

  // ===== Supervisor Info =====
  supervisor = {
    name: '',
    email: '',
    role: '',
    Department:'',
    field:''

  };

  // ===== Intern List =====
  interns: Array<{ name: string; email: string; supervisor: string; department: string; field: string; status: string; }> = [
    { name: 'Dzulani Monyayi', email: 'dzulani@email.com', supervisor: 'Mr. Smith', department: 'IT', field: 'Software Development', status: 'Present' },
    { name: 'Jane Doe', email: 'jane@email.com', supervisor: 'Ms. Johnson', department: 'HR', field: 'Recruitment', status: 'On Leave' },
    { name: 'John Smith', email: 'john@email.com', supervisor: 'Mr. Smith', department: 'IT', field: 'Networking', status: 'Absent' },
    { name: 'Alice Brown', email: 'alice@email.com', supervisor: 'Ms. Johnson', department: 'HR', field: 'Training', status: 'Present' },
    { name: 'Bob White', email: 'bob@email.com', supervisor: 'Mr. Smith', department: 'IT', field: 'Support', status: 'Present' },
    { name: 'Charlie Green', email: 'charlie@email.com', supervisor: 'Ms. Johnson', department: 'HR', field: 'Payroll', status: 'On Leave' }
  ];

  // ===== Intern Management =====
  currentIntern: any = {};
  isEditing = false;
  editIndex: number = -1;

  openEditModal(index: number) {
    this.isEditing = true;
    this.editIndex = index;
    this.currentIntern = { ...this.interns[index] };
    const modalEl = document.getElementById('internModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  saveIntern() {
    if (this.isEditing && this.editIndex > -1) {
      this.interns[this.editIndex] = { ...this.currentIntern };
      this.updateSummaries();
    }
    const modalEl = document.getElementById('internModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
  }

  removeIntern(index: number) {
    const intern = this.interns[index];
    const confirmed = window.confirm(`Are you sure you want to remove ${intern.name}? This action cannot be undone.`);
    if (confirmed) {
      this.interns.splice(index, 1);
      this.updateSummaries();
    }
  }

  internSearch: string = '';
  get filteredInterns() {
    let filtered = this.interns;

    if (this.internSearch) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(this.internSearch.toLowerCase())
      );
    }

    return filtered;
  }

  // ===== Leave Requests =====
  leaveRequests: Array<{ name: string; email: string; department: string; reason: string; document?: string; status: 'Approved' | 'Pending' | 'Declined'; startDate?: string; endDate?: string; }> = [
    { name: 'Dzulani Monyayi', email: 'dzulani@email.com', department: 'IT', reason: 'Medical appointment', document: 'assets/docs/dzulani_leave.pdf', status: 'Approved', startDate: '2025-11-01', endDate: '2025-11-03' },
    { name: 'Jane Doe', email: 'jane@email.com', department: 'HR', reason: 'Family emergency', document: 'assets/docs/jane_leave.pdf', status: 'Pending', startDate: '2025-11-05', endDate: '2025-11-07' },
    { name: 'Michael Smith', email: 'michael@email.com', department: 'IT', reason: 'Personal matters', document: 'assets/docs/michael_leave.pdf', status: 'Declined', startDate: '2025-11-10', endDate: '2025-11-12' }
  ];

  clearedLeaveRequests: any[] = [];

  clearLeaveRequest(index: number) {
    const removed = this.leaveRequests.splice(index, 1)[0];
    this.clearedLeaveRequests.push(removed);
    this.updateSummaries();
  }

  undoClear() {
    this.leaveRequests.push(...this.clearedLeaveRequests);
    this.clearedLeaveRequests = [];
    this.updateSummaries();
  }

  approveRequest(request: any) {
    request.status = 'Approved';
    this.updateSummaries();
  }

  declineRequest(request: any) {
    request.status = 'Declined';
    this.updateSummaries();
  }

  // ===== Overview Stats =====
  overviewStats = [
    { label: 'Total Interns', value: 0, icon: 'bi bi-people-fill', color: 'primary' },
    { label: 'Present Today', value: 0, icon: 'bi bi-person-check-fill', color: 'success' },
    { label: 'On Leave', value: 0, icon: 'bi bi-calendar-event', color: 'warning' },
    { label: 'Absent', value: 0, icon: 'bi bi-person-x-fill', color: 'danger' }
  ];

  overviewAttendance = [
    { name: 'Jane Doe', department: 'IT', present: 5, absent: 0, leave: 0, attendanceRate: 100 },
    { name: 'John Smith', department: 'Finance', present: 4, absent: 1, leave: 0, attendanceRate: 80 },
    { name: 'Alice Brown', department: 'Marketing', present: 3, absent: 1, leave: 1, attendanceRate: 60 }
  ];

  overviewLeaves = [
    { name: 'John Smith', department: 'Finance', startDate: '2025-10-28', endDate: '2025-10-30', reason: 'Family Emergency', status: 'Approved' },
    { name: 'Alice Brown', department: 'Marketing', startDate: '2025-10-31', endDate: '2025-11-02', reason: 'Medical', status: 'Pending' }
  ];

  lastUpdated = new Date();

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

  // ===== Reports with Date Filter =====
  reportInternName: string = '';
  reportDepartment: string = '';
  reportField: string = '';
  reportFromDate: string = '';
  reportToDate: string = '';

  allReportData: Array<{
    name: string;
    department: string;
    field: string;
    present: number;
    absent: number;
    leave: number;
    attendanceRate: number;
    lastActive?: string;
  }> = [
    { name: 'Jane Doe', department: 'IT', field: 'Software Development', present: 20, absent: 1, leave: 2, attendanceRate: 90, lastActive: '2025-11-01' },
    { name: 'John Smith', department: 'Finance', field: 'Accounting', present: 18, absent: 3, leave: 2, attendanceRate: 78, lastActive: '2025-11-03' },
    { name: 'Alice Brown', department: 'Marketing', field: 'Digital Marketing', present: 15, absent: 5, leave: 3, attendanceRate: 68, lastActive: '2025-11-02' },
    { name: 'David Lee', department: 'Engineering', field: 'Mechanical Design', present: 21, absent: 0, leave: 1, attendanceRate: 95, lastActive: '2025-11-04' }
  ];

  filteredReportData: any[] = [];
  lastReportGenerated: Date | null = null;

  generateReport() {
    this.filteredReportData = this.allReportData.filter((item) => {
      const matchesIntern = !this.reportInternName || item.name.toLowerCase().includes(this.reportInternName.toLowerCase());
      const matchesDept = !this.reportDepartment || item.department === this.reportDepartment;
      const matchesField = !this.reportField || item.field === this.reportField;

      let matchesDate = true;
      if (this.reportFromDate) matchesDate = matchesDate && new Date(item.lastActive!) >= new Date(this.reportFromDate);
      if (this.reportToDate) matchesDate = matchesDate && new Date(item.lastActive!) <= new Date(this.reportToDate);

      return matchesIntern && matchesDept && matchesField && matchesDate;
    });
    this.lastReportGenerated = new Date();
  }

  resetReportFilter() {
    this.reportInternName = '';
    this.reportDepartment = '';
    this.reportField = '';
    this.reportFromDate = '';
    this.reportToDate = '';
    this.filteredReportData = [];
    this.filteredFieldsForReport = [...this.fieldList];
  }

  downloadReportPDF() {
    console.log('PDF Download triggered', this.filteredReportData);
  }

  downloadReportExcel() {
    console.log('Excel Download triggered', this.filteredReportData);
  }

  // ===== Summary helpers =====
  get leaveSummaryStats() {
    const pending = this.leaveRequests.filter((l) => l.status === 'Pending').length;
    const approved = this.leaveRequests.filter((l) => l.status === 'Approved').length;
    const declined = this.leaveRequests.filter((l) => l.status === 'Declined').length;

    return [
      { label: 'Pending', value: pending, icon: 'bi bi-clock-history', color: 'warning' },
      { label: 'Approved', value: approved, icon: 'bi bi-check-circle', color: 'success' },
      { label: 'Declined', value: declined, icon: 'bi bi-x-circle', color: 'danger' }
    ];
  }

  get historySummary() {
    const totalLogs = this.logs.length;
    const signedIn = this.logs.filter((l) => l.action === 'Signed In').length;
    const signedOut = this.logs.filter((l) => l.action === 'Signed Out').length;
    const absentCount = this.filteredLogs.filter((r) => r.action === 'Absent').length;

    return [
      { label: 'Total Records', value: totalLogs, icon: 'bi bi-list-check', color: 'primary' },
      { label: 'Signed In', value: signedIn, icon: 'bi bi-person-check', color: 'success' },
      { label: 'Signed Out', value: signedOut, icon: 'bi bi-person-dash', color: 'secondary' },
      { label: 'Absent (filtered)', value: absentCount, icon: 'bi bi-person-x', color: 'danger' }
    ];
  }

  // ===== Update overview summary =====
  updateSummaries() {
    const total = this.interns.length;
    const present = this.interns.filter(i => i.status === 'Present').length;
    const onLeave = this.interns.filter(i => i.status === 'On Leave').length;
    const absent = this.interns.filter(i => i.status === 'Absent').length;

    this.overviewStats = [
      { label: 'Total Interns', value: total, icon: 'bi bi-people-fill', color: 'primary' },
      { label: 'Present Today', value: present, icon: 'bi bi-person-check-fill', color: 'success' },
      { label: 'On Leave', value: onLeave, icon: 'bi bi-calendar-event', color: 'warning' },
      { label: 'Absent', value: absent, icon: 'bi bi-person-x-fill', color: 'danger' }
    ];
    this.lastUpdated = new Date();
  }
}
