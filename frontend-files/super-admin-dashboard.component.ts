import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SuperAdminService, Admin, AdminRequest } from '../services/super-admin.service';
import { AuthService } from '../services/auth.service';
import { DepartmentService, Department } from '../services/department.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css']
})
export class SuperAdminDashboardComponent implements OnInit {
  admins: Admin[] = [];
  filteredAdmins: MatTableDataSource<Admin> = new MatTableDataSource<Admin>([]);
  displayedColumns: string[] = ['name', 'email', 'department', 'createdAt', 'hasSignature', 'active', 'actions'];
  loading = false;
  showCreateForm = false;
  
  // Filter properties
  searchFilter: string = '';
  statusFilter: string = '';
  signatureFilter: string = '';
  recentlyAddedFilter: string = '';
  dateFromFilter: Date | null = null;
  dateToFilter: Date | null = null;
  
  createAdminForm: FormGroup;
  editAdminForm: FormGroup;
  departments: Department[] = [];
  loadingDepartments = false;
  showEditModal = false;
  editingAdmin: Admin | null = null;

  constructor(
    private superAdminService: SuperAdminService,
    private authService: AuthService,
    private departmentService: DepartmentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.createAdminForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      signature: [''],
      departmentId: [null]
    });
    
    this.editAdminForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
      departmentId: [null]
    });
  }

  ngOnInit(): void {
    this.loadAdmins();
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        console.log('Opening create admin form. Available departments:', departments.length);
        console.log('Active departments:', departments.filter(d => d.active !== false));
        this.loadingDepartments = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.snackBar.open('Failed to load departments', 'Close', { duration: 3000 });
        this.loadingDepartments = false;
      }
    });
  }

  loadAdmins(): void {
    this.loading = true;
    this.superAdminService.getAllAdmins().subscribe({
      next: (admins) => {
        // Process admins to ensure departmentId is properly typed (number or null, not string)
        this.admins = admins.map(admin => {
          // Ensure departmentId is a number or null, not a string
          if (admin.departmentId !== null && admin.departmentId !== undefined) {
            const deptId = typeof admin.departmentId === 'string' ? Number(admin.departmentId) : admin.departmentId;
            if (!isNaN(deptId) && deptId > 0) {
              admin.departmentId = deptId;
            } else {
              admin.departmentId = null;
              admin.departmentName = null;
            }
          } else {
            admin.departmentId = null;
            admin.departmentName = null;
          }
          return admin;
        });
        
        console.log('Admins loaded with department info:', this.admins.length);
        // Log department info for debugging
        this.admins.forEach(admin => {
          if (admin.departmentId) {
            console.log(`Admin ${admin.name}: Department ID ${admin.departmentId}, Name: ${admin.departmentName}`);
          } else {
            console.log(`Admin ${admin.name}: No department assigned`);
          }
        });
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading admins:', error);
        this.snackBar.open('Failed to load admins', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.admins];

    // Search filter (name or email)
    if (this.searchFilter.trim()) {
      const searchLower = this.searchFilter.toLowerCase().trim();
      filtered = filtered.filter(admin => 
        admin.name.toLowerCase().includes(searchLower) ||
        admin.email.toLowerCase().includes(searchLower)
      );
    }

    // Status filter (Active/Inactive)
    if (this.statusFilter) {
      if (this.statusFilter === 'active') {
        filtered = filtered.filter(admin => admin.active !== false);
      } else if (this.statusFilter === 'inactive') {
        filtered = filtered.filter(admin => admin.active === false);
      }
    }

    // Signature filter
    if (this.signatureFilter) {
      if (this.signatureFilter === 'has-signature') {
        filtered = filtered.filter(admin => admin.hasSignature === true);
      } else if (this.signatureFilter === 'no-signature') {
        filtered = filtered.filter(admin => !admin.hasSignature);
      }
    }

    // Recently added filter
    if (this.recentlyAddedFilter) {
      const now = new Date();
      if (this.recentlyAddedFilter === 'last-7-days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(admin => {
          const createdAt = new Date(admin.createdAt);
          return createdAt >= sevenDaysAgo;
        });
      } else if (this.recentlyAddedFilter === 'last-30-days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(admin => {
          const createdAt = new Date(admin.createdAt);
          return createdAt >= thirtyDaysAgo;
        });
      } else if (this.recentlyAddedFilter === 'not-logged-in') {
        // Filter for admins created in last 30 days (proxy for "not logged in yet")
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(admin => {
          const createdAt = new Date(admin.createdAt);
          return createdAt >= thirtyDaysAgo;
        });
      }
    }

    // Date range filter
    if (this.dateFromFilter) {
      filtered = filtered.filter(admin => {
        const createdAt = new Date(admin.createdAt);
        return createdAt >= this.dateFromFilter!;
      });
    }

    if (this.dateToFilter) {
      filtered = filtered.filter(admin => {
        const createdAt = new Date(admin.createdAt);
        // Set time to end of day for inclusive comparison
        const toDate = new Date(this.dateToFilter!);
        toDate.setHours(23, 59, 59, 999);
        return createdAt <= toDate;
      });
    }

    this.filteredAdmins.data = filtered;
  }

  resetFilters(): void {
    this.searchFilter = '';
    this.statusFilter = '';
    this.signatureFilter = '';
    this.recentlyAddedFilter = '';
    this.dateFromFilter = null;
    this.dateToFilter = null;
    this.applyFilters();
  }

  getFilteredCount(): number {
    return this.filteredAdmins.data.length;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.createAdminForm.reset();
    }
  }

  createAdmin(): void {
    if (this.createAdminForm.invalid) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    // Properly handle departmentId - convert to number or null
    let departmentId: number | null = null;
    const deptIdValue = this.createAdminForm.value.departmentId;
    if (deptIdValue !== null && deptIdValue !== undefined && deptIdValue !== '' && deptIdValue !== 'undefined' && deptIdValue !== 'null') {
      const parsed = Number(deptIdValue);
      if (!isNaN(parsed) && parsed > 0) {
        departmentId = parsed;
      }
    }

    const adminRequest: AdminRequest = {
      name: this.createAdminForm.value.name,
      email: this.createAdminForm.value.email,
      password: this.createAdminForm.value.password,
      signature: this.createAdminForm.value.signature || undefined,
      departmentId: departmentId
    };
    
    console.log('Creating admin with department assignment:', {
      adminName: adminRequest.name,
      adminEmail: adminRequest.email,
      departmentId: adminRequest.departmentId,
      departmentName: departmentId ? this.departments.find(d => d.departmentId === departmentId)?.name || 'Unknown' : 'None'
    });
    console.log('Sending admin creation request to backend:', adminRequest);

    this.loading = true;
    this.superAdminService.createAdmin(adminRequest).subscribe({
      next: (response) => {
        console.log('Backend response:', response);
        
        // Check if department was saved
        if (response.departmentId === null || response.departmentId === undefined) {
          console.error('❌ CRITICAL ERROR: Backend did not save departmentId!');
          console.error('❌ Request sent departmentId:', adminRequest.departmentId);
          console.error('❌ Response received departmentId:', response.departmentId);
        } else {
          console.log('✅ Department saved successfully:', {
            departmentId: response.departmentId,
            departmentName: response.departmentName
          });
        }
        
        this.snackBar.open('Admin created successfully', 'Close', { duration: 3000 });
        this.createAdminForm.reset();
        this.showCreateForm = false;
        this.loadAdmins();
        this.loading = false;
        // Reset filters to show new admin
        this.resetFilters();
      },
      error: (error) => {
        console.error('Error creating admin:', error);
        const errorMessage = error.error?.message || 'Failed to create admin';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  openEditModal(admin: Admin): void {
    this.editingAdmin = admin;
    
    // Properly handle departmentId - convert to number or null
    let deptId: number | null = null;
    if (admin.departmentId !== null && admin.departmentId !== undefined) {
      const parsed = typeof admin.departmentId === 'string' ? Number(admin.departmentId) : admin.departmentId;
      if (!isNaN(parsed) && parsed > 0) {
        deptId = parsed;
      }
    }
    
    console.log('✔ Opening edit modal for admin:', {
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      departmentId: deptId,
      departmentName: admin.departmentName || null
    });
    
    this.editAdminForm.patchValue({
      name: admin.name,
      email: admin.email,
      password: '',
      confirmPassword: '',
      departmentId: deptId
    });
    
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingAdmin = null;
    this.editAdminForm.reset();
  }

  updateAdmin(): void {
    if (this.editAdminForm.invalid || !this.editingAdmin) {
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.editAdminForm.value;
    
    // Check password match if password is provided
    if (formValue.password && formValue.password !== formValue.confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
      return;
    }

    // Prepare update data
    const updateData: any = {
      name: formValue.name,
      email: formValue.email
    };

    // Add password only if provided
    if (formValue.password && formValue.password.trim() !== '') {
      updateData.password = formValue.password;
    }

    // Handle departmentId - convert to number or null
    let departmentId: number | null = null;
    const deptIdValue = formValue.departmentId;
    if (deptIdValue !== null && deptIdValue !== undefined && deptIdValue !== '' && deptIdValue !== 'undefined' && deptIdValue !== 'null') {
      const parsed = Number(deptIdValue);
      if (!isNaN(parsed) && parsed > 0) {
        departmentId = parsed;
      }
    }

    // Get previous department ID - ensure it's a number for comparison
    let previousDepartmentId: number | null = null;
    if (this.editingAdmin.departmentId !== null && this.editingAdmin.departmentId !== undefined) {
      const prevDeptId = typeof this.editingAdmin.departmentId === 'string' 
        ? Number(this.editingAdmin.departmentId) 
        : this.editingAdmin.departmentId;
      if (!isNaN(prevDeptId) && prevDeptId > 0) {
        previousDepartmentId = prevDeptId;
      }
    }
    
    console.log('✔ Updating admin with department:', {
      adminId: this.editingAdmin.adminId,
      departmentId: departmentId,
      previousDepartmentId: previousDepartmentId,
      formValueDepartmentId: formValue.departmentId,
      editingAdminDepartmentId: this.editingAdmin.departmentId
    });

    this.loading = true;

    // Always update department separately to ensure it's handled correctly
    // This prevents the department from being accidentally cleared
    this.superAdminService.updateAdminDepartment(this.editingAdmin.adminId, departmentId).subscribe({
      next: (deptResponse) => {
        console.log('Department updated:', deptResponse);
        
        // Then update other admin details
        this.superAdminService.updateAdmin(this.editingAdmin.adminId, updateData).subscribe({
          next: (response) => {
            console.log('Admin details updated:', response);
            this.snackBar.open('Admin updated successfully', 'Close', { duration: 3000 });
            this.closeEditModal();
            this.loadAdmins();
            this.loading = false;
          },
          error: (error) => {
            console.error('Error updating admin:', error);
            const errorMessage = error.error?.message || 'Failed to update admin';
            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error updating department:', error);
        // Still try to update admin details even if department update fails
        this.superAdminService.updateAdmin(this.editingAdmin.adminId, updateData).subscribe({
          next: (response) => {
            console.log('Admin details updated (department update failed):', response);
            this.snackBar.open('Admin updated but department update failed', 'Close', { duration: 5000 });
            this.closeEditModal();
            this.loadAdmins();
            this.loading = false;
          },
          error: (adminError) => {
            console.error('Error updating admin:', adminError);
            const errorMessage = adminError.error?.message || 'Failed to update admin';
            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
            this.loading = false;
          }
        });
      }
    });
      error: (error) => {
        console.error('Error updating admin:', error);
        const errorMessage = error.error?.message || 'Failed to update admin';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  updateAdminSignature(admin: Admin): void {
    // Open signature dialog or use signature pad component
    // For now, using prompt as placeholder
    const signature = prompt('Enter signature (base64 encoded image or text):');
    if (signature) {
      this.loading = true;
      this.superAdminService.updateAdminSignature(admin.adminId, signature).subscribe({
        next: () => {
          this.snackBar.open('Signature updated successfully', 'Close', { duration: 3000 });
          this.loadAdmins();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating signature:', error);
          this.snackBar.open('Failed to update signature', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  deactivateAdmin(admin: Admin): void {
    if (confirm(`Are you sure you want to deactivate ${admin.name}? They will not be able to log in until reactivated.`)) {
      this.loading = true;
      this.superAdminService.deactivateAdmin(admin.adminId).subscribe({
        next: () => {
          this.snackBar.open('Admin deactivated successfully', 'Close', { duration: 3000 });
          this.loadAdmins();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deactivating admin:', error);
          const errorMessage = error.error?.message || 'Failed to deactivate admin';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }

  activateAdmin(admin: Admin): void {
    this.loading = true;
    this.superAdminService.activateAdmin(admin.adminId).subscribe({
      next: () => {
        this.snackBar.open('Admin activated successfully', 'Close', { duration: 3000 });
        this.loadAdmins();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error activating admin:', error);
        const errorMessage = error.error?.message || 'Failed to activate admin';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  getCurrentUser(): any {
    return this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}

