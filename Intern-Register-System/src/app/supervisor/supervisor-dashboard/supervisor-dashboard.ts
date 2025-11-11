import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { ApiService } from '../../services/api.service';
import { Sidebar } from '../../shared/sidebar/sidebar';
import Swal from 'sweetalert2';


declare var bootstrap: any;

interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  attachment?: string;
  supervisorEmail?: string;
  email?: string;
  name?: string;
  reason?: string; // ✅ Added
}
interface Intern {
  name: string;
  email: string;
  supervisor: string;
  department: string;
  field: string;
  status: 'Present' | 'Absent' | 'On Leave';
}



@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './supervisor-dashboard.html',
  styleUrls: ['./supervisor-dashboard.css']
})
export class SupervisorDashboard implements OnInit {


  constructor(
    private authService: Auth,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadSupervisorData();
    this.loadAllData();
  }

  loadSupervisorData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      this.apiService.getSupervisors().subscribe({
        next: (supervisors) => {
          const supervisorData = supervisors.find((s: any) => s.email === currentUser.email);
          if (supervisorData) {
      this.supervisor = {
              name: supervisorData.name,
              email: supervisorData.email,
              role: 'Supervisor',
              Department: supervisorData.department?.name || '',
              field: supervisorData.field || 'Supervisor'
      };
    } else {
      this.supervisor = {
              name: currentUser.username || 'Unknown Supervisor',
              email: currentUser.email || 'unidentified@univen.ac.za',
              role: 'Supervisor',
              Department: '',
              field: 'Supervisor'
            };
          }
        },
        error: (error) => {
          // Suppress 403/401 errors and use stored user data
          if (error.status === 403 || error.status === 401) {
            console.warn('Access denied to supervisors endpoint, using stored user data');
          } else {
            console.error('Error loading supervisor data:', error);
          }
          const currentUser = this.authService.getCurrentUser();
          this.supervisor = {
            name: currentUser?.username || 'Unknown Supervisor',
            email: currentUser?.email || 'unidentified@univen.ac.za',
        role: 'Supervisor',
            Department: '',
            field: 'Supervisor'
      };
    }
      });
    }
  }

  loadAllData(): void {
    // Load departments first
    this.loadDepartments();
    // Wait a bit for supervisor email to be set, then load dependent data
    setTimeout(() => {
      this.loadInterns();
      this.loadLeaveRequests();
      this.loadAttendance();
    }, 300);
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
  interns: Array<{ name: string; email: string; supervisor: string; department: string; field: string; status: string; internId?: number }> = [];
  allInterns: any[] = [];

  loadInterns(): void {
    this.apiService.getInterns().subscribe({
      next: (interns) => {
        this.allInterns = interns;
        // Filter interns assigned to this supervisor
        const supervisorEmail = this.supervisor.email;
        this.interns = interns
          .filter((intern: any) => intern.supervisor?.email === supervisorEmail)
          .map((intern: any) => ({
            name: intern.name,
            email: intern.email,
            supervisor: intern.supervisor?.name || 'N/A',
            department: intern.department?.name || 'N/A',
            field: intern.field || 'N/A',
            status: this.calculateInternStatus(intern),
            internId: intern.internId
          }));
        this.updateSummaries();
      },
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          console.warn('Access denied to interns endpoint');
          return;
        }
        console.error('Error loading interns:', error);
      }
    });
  }

  calculateInternStatus(intern: any): 'Present' | 'Absent' | 'On Leave' {
    // This will be calculated based on today's attendance and leave requests
    return 'Absent'; // Default, will be updated when attendance is loaded
  }

  // ===== Intern Management =====
  currentIntern: any = {};
  isEditing = false;
  editIndex: number = -1;
  availableDepartments: string[] = [];
  availableFields: string[] = [];

  openEditModal(index: number) {
    this.isEditing = true;
    this.editIndex = index;
    const intern = this.interns[index];
    const backendIntern = this.allInterns.find((i: any) => i.internId === intern.internId);
    
    this.currentIntern = {
      internId: intern.internId,
      name: intern.name,
      email: intern.email,
      department: intern.department,
      field: intern.field,
      originalDepartment: intern.department,
      originalField: intern.field
    };
    
    // Load available departments and fields
    this.availableDepartments = [...this.departmentList];
    this.updateAvailableFields(this.currentIntern.department);
    
    const modalEl = document.getElementById('internModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }

  onDepartmentChange() {
    this.updateAvailableFields(this.currentIntern.department);
    // Reset field when department changes
    if (this.currentIntern.field && !this.availableFields.includes(this.currentIntern.field)) {
      this.currentIntern.field = '';
    }
  }

  updateAvailableFields(department: string) {
    if (department && this.fieldMap[department]) {
      this.availableFields = [...this.fieldMap[department]];
    } else {
      this.availableFields = [];
    }
  }

  saveIntern() {
    if (!this.currentIntern.internId) {
      Swal.fire('Error', 'Intern ID not found', 'error');
      return;
    }

    // Check if department or field changed
    const departmentChanged = this.currentIntern.department !== this.currentIntern.originalDepartment;
    const fieldChanged = this.currentIntern.field !== this.currentIntern.originalField;

    if (!departmentChanged && !fieldChanged) {
      Swal.fire('Info', 'No changes detected', 'info');
      const modalEl = document.getElementById('internModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
      return;
    }

    // Prepare update data
    const updateData: any = {};
    if (departmentChanged) {
      updateData.departmentName = this.currentIntern.department;
    }
    if (fieldChanged) {
      updateData.field = this.currentIntern.field;
    }

    // Call backend API
    this.apiService.updateIntern(this.currentIntern.internId, updateData).subscribe({
      next: (response) => {
        // Update local intern data
        if (this.editIndex > -1) {
          this.interns[this.editIndex].department = this.currentIntern.department;
          this.interns[this.editIndex].field = this.currentIntern.field;
        }
        
        // Reload interns to get updated data from backend
        this.loadInterns();
        
        Swal.fire('Success', 'Intern information updated successfully', 'success');
    const modalEl = document.getElementById('internModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal?.hide();
      },
      error: (error) => {
        console.error('Error updating intern:', error);
        Swal.fire('Error', error.error?.error || 'Failed to update intern information', 'error');
      }
    });
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
  leaveRequests: Array<{ name: string; email: string; department: string; field: string; reason: string; document?: string; status: 'Approved' | 'Pending' | 'Declined'; startDate?: string; endDate?: string; requestId?: number }> = [];
  backendLeaveRequests: any[] = [];

  loadLeaveRequests(): void {
    // Wait for supervisor email to be loaded
    if (!this.supervisor.email) {
      setTimeout(() => this.loadLeaveRequests(), 100);
      return;
    }
    
    this.apiService.getLeaveRequests().subscribe({
      next: (leaves) => {
        this.backendLeaveRequests = leaves;
        // Filter leave requests for interns assigned to this supervisor
        const supervisorEmail = this.supervisor.email;
        this.leaveRequests = leaves
          .filter((leave: any) => leave.intern?.supervisor?.email === supervisorEmail)
          .map((leave: any) => ({
            name: leave.intern?.name || 'Unknown',
            email: leave.intern?.email || '',
            department: leave.intern?.department?.name || 'N/A',
            field: leave.intern?.field || 'N/A',
            reason: leave.reason || '',
            document: leave.attachmentPath,
            status: this.mapLeaveStatus(leave.status),
            startDate: leave.fromDate,
            endDate: leave.toDate,
            requestId: leave.requestId
          }));
        this.updateSummaries();
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

  mapLeaveStatus(status: string): 'Approved' | 'Pending' | 'Declined' {
    if (status === 'APPROVED') return 'Approved';
    if (status === 'PENDING') return 'Pending';
    if (status === 'REJECTED') return 'Declined';
    return 'Pending';
  }

  loadAttendance(): void {
    this.apiService.getAttendance().subscribe({
      next: (attendance) => {
        // Update intern statuses based on today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        this.interns = this.interns.map(intern => {
          const internData = this.allInterns.find((i: any) => i.internId === intern.internId);
          if (!internData) return intern;
          
          const todayAtt = attendance.find((att: any) => {
            const attDate = new Date(att.date);
            attDate.setHours(0, 0, 0, 0);
            return att.intern?.internId === intern.internId &&
                   attDate.getTime() === today.getTime();
          });
          
          // Check if on leave
          const onLeave = this.leaveRequests.some(lr => 
            lr.email === intern.email && 
            lr.status === 'Approved' &&
            new Date(lr.startDate!) <= today &&
            new Date(lr.endDate!) >= today
          );
          
          if (onLeave) {
            intern.status = 'On Leave';
          } else if (todayAtt && todayAtt.status === 'SIGNED_IN') {
            intern.status = 'Present';
          } else {
            intern.status = 'Absent';
          }
          
          return intern;
        });
        
        this.updateSummaries();
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
    const backendLeave = this.backendLeaveRequests.find((lr: any) => 
      lr.requestId === request.requestId
    );
    if (backendLeave?.requestId) {
      this.apiService.approveLeaveRequest(backendLeave.requestId).subscribe({
        next: () => {
    request.status = 'Approved';
          Swal.fire('Approved!', 'Leave request has been approved.', 'success');
          this.loadLeaveRequests();
          this.loadAttendance(); // Reload to update intern statuses
        },
        error: (error) => {
          Swal.fire('Error', error.error?.error || 'Failed to approve leave request', 'error');
  }
      });
    }
  }

  declineRequest(request: any): void {
    Swal.fire({
      title: 'Decline Leave Request',
      input: 'textarea',
      inputLabel: 'Reason for declining:',
      inputPlaceholder: 'Type your reason here...',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      preConfirm: (reason) => {
        if (!reason.trim()) {
          Swal.showValidationMessage('A reason is required to decline the request.');
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = result.value;
        const backendLeave = this.backendLeaveRequests.find((lr: any) => 
          lr.requestId === request.requestId
        );
        if (backendLeave?.requestId) {
          this.apiService.rejectLeaveRequest(backendLeave.requestId).subscribe({
            next: () => {
              request.status = 'Declined';
              request.reason = reason;
        Swal.fire({
          icon: 'success',
          title: 'Leave Declined',
          text: 'The leave request was declined successfully.',
          timer: 2500,
          showConfirmButton: false
        });
              this.loadLeaveRequests();
              this.loadAttendance(); // Reload to update intern statuses
            },
            error: (error) => {
              Swal.fire('Error', error.error?.error || 'Failed to reject leave request', 'error');
            }
          });
        }
      }
    });
  }



  // ===== Overview Stats =====
  overviewStats = [
    { label: 'Total Interns', value: 0, icon: 'bi bi-people-fill', color: 'primary' },
    { label: 'Present Today', value: 0, icon: 'bi bi-person-check-fill', color: 'success' },
    { label: 'On Leave', value: 0, icon: 'bi bi-calendar-event', color: 'warning' },
    { label: 'Absent', value: 0, icon: 'bi bi-person-x-fill', color: 'danger' }
  ];

  // Removed dummy data - using real data from backend

  lastUpdated = new Date();

  // ===== Overview Modal =====
  selectedStat: any = null;

// Filters for On Leave
  filterName: string = '';
  filterDepartment: string = '';
  filterField: string = '';
  filteredFields: string[] = [];

// Pagination for On Leave
  currentPage: number = 1;
  pageSize: number = 5;

  get filteredLeaves() {
    let leaves = this.interns.filter(i => i.status === 'On Leave');

    if (this.filterName) {
      leaves = leaves.filter(i => i.name.toLowerCase().includes(this.filterName.toLowerCase()));
    }
    if (this.filterDepartment) {
      leaves = leaves.filter(i => i.department === this.filterDepartment);
    }
    if (this.filterField) {
      leaves = leaves.filter(i => i.field === this.filterField);
    }
    return leaves;
  }

  get paginatedLeaves() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeaves.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredLeaves.length / this.pageSize) || 1;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

// Filters for Absent Attendance
  attendanceFilterName: string = '';
  attendanceFilterDepartment: string = '';
  attendanceFilterField: string = '';
  filteredAttendanceFields: string[] = [];
  attendancePage: number = 1;
  attendancePageSize: number = 5;

  get filteredAttendance() {
    let data = this.interns.filter(i => i.status === 'Absent');

    if (this.attendanceFilterName) data = data.filter(i => i.name.toLowerCase().includes(this.attendanceFilterName.toLowerCase()));
    if (this.attendanceFilterDepartment) data = data.filter(i => i.department === this.attendanceFilterDepartment);
    if (this.attendanceFilterField) data = data.filter(i => i.field === this.attendanceFilterField);

    return data;
  }

  get paginatedAttendance() {
    const start = (this.attendancePage - 1) * this.attendancePageSize;
    return this.filteredAttendance.slice(start, start + this.attendancePageSize);
  }

  get totalAttendancePages() {
    return Math.ceil(this.filteredAttendance.length / this.attendancePageSize) || 1;
  }

  prevAttendancePage() { if (this.attendancePage > 1) this.attendancePage--; }
  nextAttendancePage() { if (this.attendancePage < this.totalAttendancePages) this.attendancePage++; }

// Filters for Present Today
  presentFilterName: string = '';
  presentFilterDepartment: string = '';
  presentFilterField: string = '';
  filteredPresentFields: string[] = [];
  presentPage: number = 1;
  presentPageSize: number = 5;

  get filteredPresentInterns() {
    let data = this.interns.filter(i => i.status === 'Present');

    if (this.presentFilterName) data = data.filter(i => i.name.toLowerCase().includes(this.presentFilterName.toLowerCase()));
    if (this.presentFilterDepartment) data = data.filter(i => i.department === this.presentFilterDepartment);
    if (this.presentFilterField) data = data.filter(i => i.field === this.presentFilterField);

    return data;
  }

  get paginatedPresentInterns() {
    const start = (this.presentPage - 1) * this.presentPageSize;
    return this.filteredPresentInterns.slice(start, start + this.presentPageSize);
  }

  get totalPresentPages() {
    return Math.ceil(this.filteredPresentInterns.length / this.presentPageSize) || 1;
  }

  prevPresentPage() { if (this.presentPage > 1) this.presentPage--; }
  nextPresentPage() { if (this.presentPage < this.totalPresentPages) this.presentPage++; }


  openModal(stat: any) {
    this.selectedStat = stat;

    // Reset pagination & filters when opening modal
    this.currentPage = 1;
    this.attendancePage = 1;
    this.presentPage = 1;
    this.filterName = '';
    this.filterDepartment = '';
    this.filterField = '';
    this.attendanceFilterName = '';
    this.attendanceFilterDepartment = '';
    this.attendanceFilterField = '';
    this.presentFilterName = '';
    this.presentFilterDepartment = '';
    this.presentFilterField = '';
    this.filteredFields = [];
    this.filteredAttendanceFields = [];
    this.filteredPresentFields = [];

    const modalEl = document.getElementById('supervisorModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
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

  //updateAttendanceFields() and updatePresentFields() errors
  updateAttendanceFields() {
    if (this.attendanceFilterDepartment && this.fieldMap[this.attendanceFilterDepartment]) {
      this.filteredAttendanceFields = this.fieldMap[this.attendanceFilterDepartment];
    } else {
      this.filteredAttendanceFields = [];
    }
    this.attendanceFilterField = '';
  }

  updatePresentFields() {
    if (this.presentFilterDepartment && this.fieldMap[this.presentFilterDepartment]) {
      this.filteredPresentFields = this.fieldMap[this.presentFilterDepartment];
    } else {
      this.filteredPresentFields = [];
    }
    this.presentFilterField = '';
  }


  // ===== Departments & Fields =====
  departmentList: string[] = [];
  departments: any[] = [];
  fieldMap: { [dept: string]: string[] } = {};
  fieldList: string[] = [];

  loadDepartments(): void {
    this.apiService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.departmentList = departments.map((d: any) => d.name);
        this.fieldMap = {};
        departments.forEach((dept: any) => {
          this.fieldMap[dept.name] = dept.fields || [];
        });
        this.fieldList = Object.values(this.fieldMap).flat();
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }
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
    
    // Load attendance for the selected week
    this.apiService.getAttendance().subscribe({
      next: (attendance) => {
    const weekDates: Date[] = [];
    for (let d = new Date(monday); d <= friday; d.setDate(d.getDate() + 1)) {
      weekDates.push(new Date(d));
    }

    const result: any[] = [];
        const supervisorEmail = this.supervisor.email;

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
            const log = attendance.find(
              (att: any) =>
                att.intern?.internId === intern.internId &&
                att.intern?.supervisor?.email === supervisorEmail &&
                new Date(att.date).toDateString() === date.toDateString()
        );

        result.push(
          log
                ? {
                    intern: intern.name,
                    date: new Date(date),
                    location: log.location || 'N/A',
                    timeIn: log.timeIn ? new Date(log.timeIn) : null,
                    timeOut: log.timeOut ? new Date(log.timeOut) : null,
                    action: log.status === 'SIGNED_IN' ? 'Signed In' : 'Signed Out'
                  }
            : {
              intern: intern.name,
                    image: null,
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
      },
      error: (error) => {
        console.error('Error loading attendance history:', error);
      }
    });

    return this.filteredLogs;
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
  }> = [];

  filteredReportData: any[] = [];
  lastReportGenerated: Date | null = null;

  // ===== Overview Attendance Data (calculated from real data) =====
  get overviewAttendance() {
    // Calculate attendance statistics for each intern
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.interns.map(intern => {
      // Get attendance records for this intern
      const internData = this.allInterns.find((i: any) => i.internId === intern.internId);
      if (!internData) {
        return {
          name: intern.name,
          department: intern.department,
          field: intern.field,
          present: 0,
          absent: 0,
          leave: 0,
          attendanceRate: 0
        };
      }

      // Calculate present/absent/leave counts (simplified - you can enhance this)
      const present = intern.status === 'Present' ? 1 : 0;
      const absent = intern.status === 'Absent' ? 1 : 0;
      const leave = intern.status === 'On Leave' ? 1 : 0;
      const total = present + absent + leave;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        name: intern.name,
        department: intern.department,
        field: intern.field,
        present: present,
        absent: absent,
        leave: leave,
        attendanceRate: attendanceRate
      };
    });
  }

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
