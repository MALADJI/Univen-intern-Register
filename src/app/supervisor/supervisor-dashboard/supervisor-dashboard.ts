import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';
import { Navbar } from '../../shared/navbar/navbar';


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
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './supervisor-dashboard.html',
  styleUrls: ['./supervisor-dashboard.css']
})
export class SupervisorDashboard implements OnInit {


  constructor(
    private authService: Auth, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Don't call updateSummaries here as supervisor data isn't loaded yet
  }




  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('[Leave Alert] ngOnInit - currentUser:', currentUser);

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
    
    console.log('[Leave Alert] ngOnInit - supervisor set:', this.supervisor);
    
    // Initialize current date
    this.updateCurrentDate();
    
    // Load data immediately after supervisor is set
    // Load seen leave request IDs from localStorage first
    this.loadSeenLeaveRequests();
    
    // Load leave requests (this will populate mock data)
    this.loadLeaveRequests();
    
    // Update summaries
    this.updateSummaries();
    
    // Check for new leave requests after a short delay
    setTimeout(() => {
      this.checkForNewLeaveRequests();
      // Force change detection after loading
      this.cdr.detectChanges();
      console.log('[Leave Alert] After setTimeout - leaveRequests length:', this.leaveRequests.length);
      console.log('[Leave Alert] After setTimeout - filteredLeaveRequests length:', this.filteredLeaveRequests.length);
      console.log('[Leave Alert] After setTimeout - paginatedLeaveRequests length:', this.paginatedLeaveRequests.length);
      
      // Final verification
      if (this.leaveRequests.length === 0) {
        console.error('[Leave Alert] CRITICAL: leaveRequests is still empty after loadLeaveRequests()!');
        console.error('[Leave Alert] Supervisor:', this.supervisor);
      } else {
        console.log('[Leave Alert] ✅ Data loaded successfully:', this.leaveRequests.length, 'requests');
      }
    }, 500);
  }

  // ===== Sidebar =====
  isSidebarExpanded: boolean = true;
  
  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
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
      
      // Mark leave requests as seen when viewing leave status section
      if (section === 'Intern Leave status') {
        this.markLeaveRequestsAsSeen();
      }
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

  // Navigation items with icons
  navigationItems = [
    { id: 'overview', label: 'Dashboard', icon: 'bi bi-grid-3x3-gap' },
    { id: 'interns', label: 'Interns', icon: 'bi bi-people-fill' },
    { id: 'Intern Leave status', label: 'Leave Status', icon: 'bi bi-calendar-check' },
    { id: 'history', label: 'History', icon: 'bi bi-clock-history' },
    { id: 'reports', label: 'Reports', icon: 'bi bi-file-earmark-text' }
  ];

  // ===== Supervisor Info =====
  supervisor = {
    name: '',
    email: '',
    role: '',
    Department:'',
    field:''

  };

  // ===== Intern List =====
  interns: Array<{ name: string; email: string; supervisor: string; department: string; field: string; status: string;  }> = [
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

  openEditModal(intern: any) {
    const index = this.interns.findIndex(i => i === intern);
    if (index !== -1) {
      this.isEditing = true;
      this.editIndex = index;
      this.currentIntern = { ...this.interns[index] };
      const modalEl = document.getElementById('internModal');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
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

  removeIntern(intern: any) {
    const confirmed = window.confirm(`Are you sure you want to remove ${intern.name}? This action cannot be undone.`);
    if (confirmed) {
      const index = this.interns.findIndex(i => i === intern);
      if (index !== -1) {
        this.interns.splice(index, 1);
        this.updateSummaries();
        // Reset to first page if current page is empty
        if (this.paginatedInterns.length === 0 && this.internCurrentPage > 1) {
          this.internCurrentPage = 1;
        }
      }
    }
  }

  // ===== Intern Filters =====
  internFilterName: string = '';
  internFilterDepartment: string = '';
  internFilterField: string = '';
  internFilterStatus: string = '';
  filteredInternFields: string[] = [];

  // ===== Intern Pagination =====
  internCurrentPage: number = 1;
  internItemsPerPage: number = 25;

  // ===== Filtered Interns Getter =====
  get filteredInterns() {
    let filtered = this.interns;

    // Filter by name
    if (this.internFilterName) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(this.internFilterName.toLowerCase()) ||
        i.email.toLowerCase().includes(this.internFilterName.toLowerCase())
      );
    }

    // Filter by department
    if (this.internFilterDepartment) {
      filtered = filtered.filter(i =>
        i.department && i.department.toLowerCase() === this.internFilterDepartment.toLowerCase()
      );
    }

    // Filter by field
    if (this.internFilterField) {
      filtered = filtered.filter(i =>
        i.field && i.field.toLowerCase() === this.internFilterField.toLowerCase()
      );
    }

    // Filter by status
    if (this.internFilterStatus) {
      filtered = filtered.filter(i => i.status === this.internFilterStatus);
    }

    return filtered;
  }

  // ===== Paginated Interns Getter =====
  get paginatedInterns() {
    const start = (this.internCurrentPage - 1) * this.internItemsPerPage;
    return this.filteredInterns.slice(start, start + this.internItemsPerPage);
  }

  get totalInternPages(): number {
    return Math.ceil(this.filteredInterns.length / this.internItemsPerPage) || 1;
  }

  // ===== Pagination Helpers for Interns =====
  prevInternPage() {
    if (this.internCurrentPage > 1) this.internCurrentPage--;
  }

  nextInternPage() {
    if (this.internCurrentPage < this.totalInternPages) this.internCurrentPage++;
  }

  goToInternPage(page: number) {
    if (page > 0 && page <= this.totalInternPages) {
      this.internCurrentPage = page;
    }
  }

  // ===== Update Fields for Intern Field Dropdown =====
  updateInternFields() {
    this.filteredInternFields = this.internFilterDepartment ? this.fieldMap[this.internFilterDepartment] || [] : [];
    this.internFilterField = '';
    this.internCurrentPage = 1; // Reset to first page after filter
  }

  // ===== Reset Intern Filters =====
  resetInternFilters() {
    this.internFilterName = '';
    this.internFilterDepartment = '';
    this.internFilterField = '';
    this.internFilterStatus = '';
    this.filteredInternFields = [];
    this.internCurrentPage = 1;
  }

  // ===== Get Intern Page Numbers =====
  getInternPageNumbers(): number[] {
    const total = this.totalInternPages;
    const current = this.internCurrentPage;
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

  // ===== Leave Requests =====
  leaveRequests: Array<{ name: string; email: string; department: string; field: string; reason: string; document?: string; status: 'Approved' | 'Pending' | 'Declined'; startDate?: string; endDate?: string; supervisorEmail?: string; }> = [];

  clearedLeaveRequests: any[] = [];
  
  // Track seen leave request IDs
  seenLeaveRequestIds: Set<number> = new Set();
  
  // New leave requests count
  newLeaveRequestsCount: number = 0;
  
  // Track if alert has been shown this session
  alertShownThisSession: boolean = false;

  // ===== Filtered Leave Requests Getter =====
  get filteredLeaveRequests() {
    // Check if leaveRequests is empty or undefined
    if (!this.leaveRequests || this.leaveRequests.length === 0) {
      return [];
    }
    
    const filtered = this.leaveRequests.filter((r) => {
      // If name filter is set, check if it matches
      if (this.leaveFilterName && r.name && !r.name.toLowerCase().includes(this.leaveFilterName.toLowerCase())) {
        return false;
      }
      // If department filter is set, check if it matches (case-insensitive)
      if (this.leaveFilterDepartment && r.department && r.department.toLowerCase() !== this.leaveFilterDepartment.toLowerCase()) {
        return false;
      }
      // If field filter is set, check if it matches (case-insensitive)
      if (this.leaveFilterField && r.field && r.field.toLowerCase() !== this.leaveFilterField.toLowerCase()) {
        return false;
      }
      return true;
    });
    
    return filtered;
  }

  // ===== Paginated Leave Requests Getter =====
  get paginatedLeaveRequests() {
    const filtered = this.filteredLeaveRequests;
    const start = (this.leaveCurrentPage - 1) * this.leaveItemsPerPage;
    const paginated = filtered.slice(start, start + this.leaveItemsPerPage);
    
    // Reset to page 1 if current page is beyond available pages
    if (this.leaveCurrentPage > 1 && paginated.length === 0 && filtered.length > 0) {
      this.leaveCurrentPage = 1;
      return filtered.slice(0, this.leaveItemsPerPage);
    }
    
    return paginated;
  }

  get totalLeavePages(): number {
    return Math.ceil(this.filteredLeaveRequests.length / this.leaveItemsPerPage) || 1;
  }

  // ===== Pagination Helpers for Leave Status =====
  prevLeavePage() {
    if (this.leaveCurrentPage > 1) this.leaveCurrentPage--;
  }

  nextLeavePage() {
    if (this.leaveCurrentPage < this.totalLeavePages) this.leaveCurrentPage++;
  }

  // ===== Update Fields for Leave Status Field Dropdown =====
  updateLeaveFields() {
    this.filteredLeaveFields = this.leaveFilterDepartment ? this.fieldMap[this.leaveFilterDepartment] || [] : [];
    this.leaveFilterField = '';
    this.leaveCurrentPage = 1; // Reset to first page after filter
  }

  resetLeaveFilters() {
    this.leaveFilterName = '';
    this.leaveFilterDepartment = '';
    this.leaveFilterField = '';
    this.filteredLeaveFields = [];
    this.leaveCurrentPage = 1;
  }

  // Pagination helpers
  getLeavePageNumbers(): number[] {
    const total = this.totalLeavePages;
    const current = this.leaveCurrentPage;
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

  goToLeavePage(page: number) {
    if (page > 0 && page <= this.totalLeavePages) {
      this.leaveCurrentPage = page;
    }
  }

  // Expose Math for template
  Math = Math;

  clearLeaveRequest(index: number) {
    const removed = this.leaveRequests.splice(index, 1)[0];
    this.clearedLeaveRequests.push(removed);
    this.updateSummaries();
  }

  clearLeaveRequestByRequest(request: any) {
    const index = this.leaveRequests.findIndex(r => r === request);
    if (index !== -1) {
      this.clearLeaveRequest(index);
    }
  }

  undoClear() {
    this.leaveRequests.push(...this.clearedLeaveRequests);
    this.clearedLeaveRequests = [];
    this.updateSummaries();
  }

  approveRequest(request: any) {
    request.status = 'Approved';
    // Mark as seen when approved
    const requestId = this.getRequestId(request);
    this.seenLeaveRequestIds.add(requestId);
    this.saveSeenLeaveRequests();
    this.updateSummaries();
    this.checkForNewLeaveRequests(); // Update count after approval
  }
  loadLeaveRequests(): void {
    console.log('[Leave Alert] Loading leave requests...');
    console.log('[Leave Alert] Supervisor email:', this.supervisor.email);
    console.log('[Leave Alert] Supervisor object:', this.supervisor);
    
    if (!this.supervisor || !this.supervisor.email) {
      console.error('[Leave Alert] Supervisor email is not set! Supervisor:', this.supervisor);
      this.leaveRequests = [];
      return;
    }
    
    // Get the original mock data array (before any modifications)
    const originalMockData = [
      // Approved requests
      { name: 'Dzulani Monyayi', email: 'dzulani@email.com', department: 'ICT', field: 'Networking', reason: 'Medical appointment', document: 'assets/docs/dzulani_leave.pdf', status: 'Approved' as const, startDate: '2025-11-01', endDate: '2025-11-03' },
      { name: 'Thabo Mokoena', email: 'thabo.mokoena@univen.ac.za', department: 'ICT', field: 'Software Development', reason: 'Annual leave', status: 'Approved' as const, startDate: '2025-11-05', endDate: '2025-11-10' },
      { name: 'Lerato Nkosi', email: 'lerato.nkosi@email.com', department: 'Finance', field: 'Accounting', reason: 'Family vacation', document: 'assets/docs/lerato_leave.pdf', status: 'Approved' as const, startDate: '2025-11-15', endDate: '2025-11-20' },
      { name: 'Sipho Dlamini', email: 'sipho.dlamini@email.com', department: 'Marketing', field: 'Digital Marketing', reason: 'Personal leave', status: 'Approved' as const, startDate: '2025-11-25', endDate: '2025-11-27' },
      { name: 'Nomsa Khumalo', email: 'nomsa.khumalo@email.com', department: 'HR', field: 'Recruitment', reason: 'Medical checkup', status: 'Approved' as const, startDate: '2025-12-01', endDate: '2025-12-02' },
      
      // Pending requests (these will trigger alerts)
      { name: 'Jane Doe', email: 'jane@email.com', department: 'HR', field: 'Training', reason: 'Family emergency - need to attend to urgent family matter', document: 'assets/docs/jane_leave.pdf', status: 'Pending' as const, startDate: '2025-12-15', endDate: '2025-12-17' },
      { name: 'Sarah Johnson', email: 'sarah.johnson@email.com', department: 'ICT', field: 'Software Development', reason: 'Medical checkup appointment', status: 'Pending' as const, startDate: '2025-12-20', endDate: '2025-12-21' },
      { name: 'David Williams', email: 'david.williams@email.com', department: 'Finance', field: 'Accounting', reason: 'Personal leave - family event', document: 'assets/docs/david_leave.pdf', status: 'Pending' as const, startDate: '2025-12-18', endDate: '2025-12-19' },
      { name: 'Emily Brown', email: 'emily.brown@email.com', department: 'ICT', field: 'Networking', reason: 'Sick leave - doctor recommended rest', status: 'Pending' as const, startDate: '2025-12-22', endDate: '2025-12-24' },
      { name: 'James Wilson', email: 'james.wilson@email.com', department: 'HR', field: 'Recruitment', reason: 'Wedding ceremony attendance', document: 'assets/docs/james_leave.pdf', status: 'Pending' as const, startDate: '2025-12-25', endDate: '2025-12-27' },
      { name: 'Amanda Mthembu', email: 'amanda.mthembu@email.com', department: 'ICT', field: 'Support', reason: 'Personal matters', status: 'Pending' as const, startDate: '2025-12-28', endDate: '2025-12-30' },
      { name: 'Bongani Zulu', email: 'bongani.zulu@email.com', department: 'Finance', field: 'Payroll', reason: 'Medical appointment', document: 'assets/docs/bongani_leave.pdf', status: 'Pending' as const, startDate: '2026-01-02', endDate: '2026-01-03' },
      { name: 'Cynthia Ndlovu', email: 'cynthia.ndlovu@email.com', department: 'Marketing', field: 'Digital Marketing', reason: 'Family event', status: 'Pending' as const, startDate: '2026-01-05', endDate: '2026-01-07' },
      { name: 'Daniel Maseko', email: 'daniel.maseko@email.com', department: 'ICT', field: 'Business Analysis', reason: 'Sick leave', status: 'Pending' as const, startDate: '2026-01-08', endDate: '2026-01-10' },
      { name: 'Faith Khoza', email: 'faith.khoza@email.com', department: 'HR', field: 'Payroll', reason: 'Personal leave', document: 'assets/docs/faith_leave.pdf', status: 'Pending' as const, startDate: '2026-01-12', endDate: '2026-01-14' },
      { name: 'George Sibanda', email: 'george.sibanda@email.com', department: 'Engineering', field: 'Mechanical Design', reason: 'Medical procedure', status: 'Pending' as const, startDate: '2026-01-15', endDate: '2026-01-17' },
      { name: 'Hannah Mahlangu', email: 'hannah.mahlangu@email.com', department: 'ICT', field: 'Music', reason: 'Family vacation', document: 'assets/docs/hannah_leave.pdf', status: 'Pending' as const, startDate: '2026-01-18', endDate: '2026-01-20' },
      { name: 'Isaac Nkomo', email: 'isaac.nkomo@email.com', department: 'Finance', field: 'Accounting', reason: 'Wedding', status: 'Pending' as const, startDate: '2026-01-22', endDate: '2026-01-24' },
      { name: 'Joyce Mabuza', email: 'joyce.mabuza@email.com', department: 'Marketing', field: 'Advertising', reason: 'Personal matters', status: 'Pending' as const, startDate: '2026-01-25', endDate: '2026-01-27' },
      { name: 'Kevin Phiri', email: 'kevin.phiri@email.com', department: 'Engineering', field: 'Electrical', reason: 'Medical checkup', document: 'assets/docs/kevin_leave.pdf', status: 'Pending' as const, startDate: '2026-01-28', endDate: '2026-01-29' },
      { name: 'Linda Shabalala', email: 'linda.shabalala@email.com', department: 'HR', field: 'Training', reason: 'Family emergency', status: 'Pending' as const, startDate: '2026-02-01', endDate: '2026-02-03' },
      
      // Declined requests
      { name: 'Michael Smith', email: 'michael@email.com', department: 'ICT', field: 'Software Development', reason: 'Personal matters', document: 'assets/docs/michael_leave.pdf', status: 'Declined' as const, startDate: '2025-11-10', endDate: '2025-11-12' },
      { name: 'Natalie Botha', email: 'natalie.botha@email.com', department: 'Finance', field: 'Payroll', reason: 'Personal leave', status: 'Declined' as const, startDate: '2025-11-18', endDate: '2025-11-19' },
      { name: 'Oliver Van Der Merwe', email: 'oliver.vdm@email.com', department: 'Marketing', field: 'Digital Marketing', reason: 'Vacation', document: 'assets/docs/oliver_leave.pdf', status: 'Declined' as const, startDate: '2025-11-22', endDate: '2025-11-25' },
      { name: 'Patricia Molefe', email: 'patricia.molefe@email.com', department: 'HR', field: 'Recruitment', reason: 'Personal matters', status: 'Declined' as const, startDate: '2025-11-28', endDate: '2025-11-30' },
      { name: 'Quinton Radebe', email: 'quinton.radebe@email.com', department: 'Engineering', field: 'Civil', reason: 'Family event', document: 'assets/docs/quinton_leave.pdf', status: 'Declined' as const, startDate: '2025-12-05', endDate: '2025-12-07' }
    ];
    
    // Always add supervisor email to mock data
    const mockDataWithSupervisor = originalMockData.map(req => ({
      ...req,
      supervisorEmail: this.supervisor.email
    }));
    
    // Check localStorage
    const allRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    console.log('[Leave Alert] Requests in localStorage:', allRequests.length);
    
    // Filter requests for this supervisor from localStorage
    const filteredRequests = allRequests.filter((req: any) => {
      // Match if supervisorEmail matches, or if no supervisorEmail is set (legacy data)
      return req.supervisorEmail === this.supervisor.email || !req.supervisorEmail;
    });
    console.log('[Leave Alert] Filtered requests from localStorage:', filteredRequests.length);
    
    // Always use mock data - merge with localStorage if it exists
    if (filteredRequests.length > 0) {
      // Merge localStorage requests with mock data, avoiding duplicates
      const existingIds = new Set(filteredRequests.map((r: any) => this.getRequestId(r)));
      const newMockRequests = mockDataWithSupervisor.filter((req: any) => {
        const reqId = this.getRequestId(req);
        return !existingIds.has(reqId);
      });
      this.leaveRequests = [...filteredRequests, ...newMockRequests];
      console.log('[Leave Alert] Merged localStorage and mock data -', this.leaveRequests.length, 'total requests');
    } else {
      // Use mock data directly - create a new array to trigger change detection
      this.leaveRequests = [...mockDataWithSupervisor];
      console.log('[Leave Alert] Using mock data only -', this.leaveRequests.length, 'requests loaded');
    }
    
    // Log all requests for debugging
    console.log('[Leave Alert] Total leave requests loaded:', this.leaveRequests.length);
    console.log('[Leave Alert] All leave requests:', JSON.stringify(this.leaveRequests, null, 2));
    console.log('[Leave Alert] Request details:', this.leaveRequests.map(r => ({
      name: r.name,
      status: r.status,
      supervisorEmail: r.supervisorEmail,
      department: r.department
    })));
    
    // Ensure we have data
    if (this.leaveRequests.length === 0) {
      console.error('[Leave Alert] ERROR: No leave requests loaded! Check supervisor email and mock data.');
    } else {
      console.log('[Leave Alert] SUCCESS: Loaded', this.leaveRequests.length, 'leave requests');
    }
    
    // Force change detection multiple times to ensure UI updates
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('[Leave Alert] Change detection triggered again');
    }, 100);
    
    // Log pending requests for debugging
    const pendingCount = this.leaveRequests.filter(req => req.status === 'Pending').length;
    console.log('[Leave Alert] Pending requests in data:', pendingCount);
    console.log('[Leave Alert] Total requests array length:', this.leaveRequests.length);
    
    // Also log what filteredLeaveRequests will return
    console.log('[Leave Alert] Filtered leave requests count:', this.filteredLeaveRequests.length);
    console.log('[Leave Alert] Paginated leave requests count:', this.paginatedLeaveRequests.length);
  }
  
  // Debug method to manually reload data
  reloadLeaveRequests(): void {
    console.log('[Leave Alert] Manually reloading leave requests...');
    this.loadLeaveRequests();
    this.updateSummaries();
    Swal.fire({
      icon: 'info',
      title: 'Reloaded',
      text: `Loaded ${this.leaveRequests.length} leave requests. Check console for details.`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Load seen leave request IDs from localStorage
  loadSeenLeaveRequests(): void {
    const seenIds = localStorage.getItem(`seenLeaveRequests_${this.supervisor.email}`);
    if (seenIds) {
      this.seenLeaveRequestIds = new Set(JSON.parse(seenIds));
    }
  }

  // Save seen leave request IDs to localStorage
  saveSeenLeaveRequests(): void {
    localStorage.setItem(`seenLeaveRequests_${this.supervisor.email}`, JSON.stringify(Array.from(this.seenLeaveRequestIds)));
  }

  // Check for new leave requests and show alert
  checkForNewLeaveRequests(forceShow: boolean = false): void {
    // Ensure supervisor email is set
    if (!this.supervisor.email) {
      console.log('[Leave Alert] Supervisor email not set');
      this.newLeaveRequestsCount = 0;
      return;
    }
    
    console.log('[Leave Alert] Checking for new leave requests...');
    console.log('[Leave Alert] Total leave requests:', this.leaveRequests.length);
    console.log('[Leave Alert] Supervisor email:', this.supervisor.email);
    
    // Update the count first
    this.updateNewLeaveRequestsCount();
    
    // Get pending leave requests that belong to this supervisor
    const pendingRequests = this.leaveRequests.filter(req => {
      return req.status === 'Pending' && 
             (req.supervisorEmail === this.supervisor.email || !req.supervisorEmail);
    });
    
    console.log('[Leave Alert] Pending requests:', pendingRequests.length);
    console.log('[Leave Alert] Seen request IDs:', Array.from(this.seenLeaveRequestIds));
    
    // Filter new requests (not seen before)
    const newRequests = pendingRequests.filter(req => {
      const requestId = this.getRequestId(req);
      const isNew = !this.seenLeaveRequestIds.has(requestId);
      console.log(`[Leave Alert] Request ${req.name} (ID: ${requestId}): ${isNew ? 'NEW' : 'SEEN'}`);
      return isNew;
    });
    
    console.log('[Leave Alert] New requests found:', newRequests.length);
    console.log('[Leave Alert] Alert shown this session:', this.alertShownThisSession);
    
    // Show alert if there are new requests (or if forced)
    if (newRequests.length > 0 && (forceShow || !this.alertShownThisSession)) {
      if (!forceShow) {
        this.alertShownThisSession = true;
      }
      console.log('[Leave Alert] Showing alert for', newRequests.length, 'new request(s)');
      // Small delay to ensure UI is ready
      setTimeout(() => {
        this.showNewLeaveRequestAlert(newRequests);
      }, 500);
    } else {
      console.log('[Leave Alert] No alert shown - no new requests or already shown');
    }
  }
  
  // Test method to manually trigger alert check
  testLeaveAlert(): void {
    console.log('[Leave Alert] Manual test triggered');
    this.alertShownThisSession = false; // Reset to allow testing
    this.checkForNewLeaveRequests(true);
  }
  
  // Method to clear seen requests (for testing)
  clearSeenLeaveRequests(): void {
    this.seenLeaveRequestIds.clear();
    this.saveSeenLeaveRequests();
    this.updateNewLeaveRequestsCount();
    console.log('[Leave Alert] Cleared all seen leave requests');
    Swal.fire({
      icon: 'success',
      title: 'Cleared',
      text: 'All seen leave requests have been cleared. Refresh to see alerts again.',
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Generate unique ID for a leave request
  getRequestId(request: any): number {
    // Use existing id if available, otherwise generate one
    if (request.id) {
      return request.id;
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

  // Show alert for new leave requests
  showNewLeaveRequestAlert(newRequests: any[]): void {
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
      // Don't set timer property to auto-close (omitted)
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
  
  // Update new leave requests count
  updateNewLeaveRequestsCount(): void {
    if (!this.supervisor.email) {
      this.newLeaveRequestsCount = 0;
      return;
    }
    
    const pendingRequests = this.leaveRequests.filter(req => {
      return req.status === 'Pending' && 
             (req.supervisorEmail === this.supervisor.email || !req.supervisorEmail);
    });
    
    const newRequests = pendingRequests.filter(req => {
      const requestId = this.getRequestId(req);
      return !this.seenLeaveRequestIds.has(requestId);
    });
    
    this.newLeaveRequestsCount = newRequests.length;
  }

  // Mark leave requests as seen when viewing the leave status section
  markLeaveRequestsAsSeen(): void {
    const pendingRequests = this.leaveRequests.filter(req => {
      return req.status === 'Pending' && 
             (req.supervisorEmail === this.supervisor.email || !req.supervisorEmail);
    });
    pendingRequests.forEach(req => {
      const requestId = this.getRequestId(req);
      this.seenLeaveRequestIds.add(requestId);
    });
    this.saveSeenLeaveRequests();
    this.updateNewLeaveRequestsCount();
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
        request.status = 'Declined';
        request.reason = reason;

        // Save to localStorage
        const allRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
        const updatedRequests = allRequests.map((r: any) =>
          r.id === request.id ? { ...r, status: 'Declined', reason } : r
        );
        localStorage.setItem('leaveRequests', JSON.stringify(updatedRequests));

        // Mark as seen when declined
        const requestId = this.getRequestId(request);
        this.seenLeaveRequestIds.add(requestId);
        this.saveSeenLeaveRequests();

        // Refresh the UI
        this.loadLeaveRequests();

        Swal.fire({
          icon: 'success',
          title: 'Leave Declined',
          text: 'The leave request was declined successfully.',
          timer: 2500,
          showConfirmButton: false
        });
        
        // Update new requests count
        this.checkForNewLeaveRequests();
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

  overviewAttendance = [
    { name: 'Jane Doe', email: 'jane.doe@email.com', department: 'IT', field: 'Software development', present: 5, absent: 0, leave: 0, attendanceRate: 100 },
    { name: 'John Smith', email: 'john.smith@email.com', department: 'Finance', field: 'Accounting', present: 4, absent: 1, leave: 0, attendanceRate: 80 },
    { name: 'Alice Brown', email: 'alice.brown@email.com', department: 'Marketing', field: 'Logistic', present: 3, absent: 1, leave: 1, attendanceRate: 60 }
  ];

  overviewLeaves = [
    { name: 'John Smith', department: 'Finance', field: 'Accounting', startDate: '2025-10-28', endDate: '2025-10-30', reason: 'Family Emergency', status: 'Approved' },
    { name: 'Alice Brown', department: 'Marketing', field: 'Digital Marketing', startDate: '2025-10-31', endDate: '2025-11-02', reason: 'Medical', status: 'Pending' }
  ];

  lastUpdated = new Date();
  currentDate: string = '';

  // ===== Overview Modal =====
  selectedStat: any = null;

// Filters for On Leave (Modal)
  filterName: string = '';
  filterDepartment: string = '';
  filterField: string = '';
  filteredFields: string[] = [];

// Pagination for On Leave (Modal)
  currentPage: number = 1;
  pageSize: number = 5;

// Filters for Leave Status Section
  leaveFilterName: string = '';
  leaveFilterDepartment: string = '';
  leaveFilterField: string = '';
  filteredLeaveFields: string[] = [];

// Pagination for Leave Status Section
  leaveCurrentPage: number = 1;
  leaveItemsPerPage: number = 25;

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

  // Filtered leave requests for modal (based on leaveRequests array)
  get filteredModalLeaveRequests() {
    let requests = this.leaveRequests;

    if (this.filterName) {
      requests = requests.filter(r => r.name.toLowerCase().includes(this.filterName.toLowerCase()));
    }
    if (this.filterDepartment) {
      requests = requests.filter(r => r.department === this.filterDepartment);
    }
    if (this.filterField) {
      requests = requests.filter(r => r.field === this.filterField);
    }
    return requests;
  }

  get paginatedLeaves() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredLeaves.slice(start, start + this.pageSize);
  }

  // Paginated leave requests for modal
  get paginatedModalLeaveRequests() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredModalLeaveRequests.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredLeaves.length / this.pageSize) || 1;
  }

  // Total pages for leave requests modal
  get totalModalLeaveRequestPages() {
    return Math.ceil(this.filteredModalLeaveRequests.length / this.pageSize) || 1;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    // Use totalModalLeaveRequestPages for modal pagination (since modal shows leaveRequests)
    const maxPages = this.totalModalLeaveRequestPages;
    if (this.currentPage < maxPages) this.currentPage++;
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


  handleStatCardClick(stat: any) {
    // If "Total Interns" card is clicked, navigate to interns section
    if (stat.label === 'Total Interns') {
      this.showSection('interns');
    } else {
      // For other cards, open the modal
      this.openModal(stat);
    }
  }

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
  
  // Pagination for History Section
  historyCurrentPage: number = 1;
  historyItemsPerPage: number = 10;

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
  departmentList: string[] = ['ICT', 'Finance', 'Marketing', 'HR', 'Engineering'];
  fieldMap: { [dept: string]: string[] } = {
    ICT: ['Software Development', 'Networking', 'Support', 'Music', 'Business Analysis'],
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
    this.historyCurrentPage = 1;
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
    } else {
      this.filteredLogs = [];
      this.weekendSelected = false;
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

  // Paginated interns for history section
  get paginatedInternsForWeek() {
    const start = (this.historyCurrentPage - 1) * this.historyItemsPerPage;
    return this.internsForWeek.slice(start, start + this.historyItemsPerPage);
  }

  get totalHistoryPages(): number {
    return Math.ceil(this.internsForWeek.length / this.historyItemsPerPage) || 1;
  }

  // Pagination helpers for History
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
  
  // Pagination for Reports Section
  reportCurrentPage: number = 1;
  reportItemsPerPage: number = 25;

  generateReport() {
    this.reportCurrentPage = 1; // Reset to first page when generating new report
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
  
  // Paginated report data
  get paginatedReportData() {
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
    this.reportFromDate = '';
    this.reportToDate = '';
    this.filteredReportData = [];
    this.lastReportGenerated = null;
    this.filteredFieldsForReport = [...this.fieldList];
    this.reportCurrentPage = 1;
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

  // ===== Update current date =====
  updateCurrentDate() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.currentDate = now.toLocaleDateString('en-US', options);
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
