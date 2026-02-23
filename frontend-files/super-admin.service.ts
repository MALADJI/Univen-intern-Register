import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Admin {
  adminId: number;
  userId: number;
  name: string;
  email: string;
  createdAt: string;
  hasSignature: boolean;
  active?: boolean;
  departmentId?: number;
  departmentName?: string;
}

export interface AdminRequest {
  name: string;
  email: string;
  password: string;
  signature?: string;
  departmentId?: number | string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {
  private baseUrl = '/api/super-admin';

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  /**
   * Get all admins (Super Admin only)
   */
  getAllAdmins(): Observable<Admin[]> {
    return this.apiService.get<Admin[]>(`${this.baseUrl}/admins`);
  }

  /**
   * Send invitation email to admin (Super Admin only)
   * This sends an invitation email before creating the account
   */
  sendAdminInvite(email: string, name?: string): Observable<any> {
    return this.apiService.post(`${this.baseUrl}/admins/send-invite`, {
      email,
      name: name || ''
    });
  }

  /**
   * Create a new admin (Super Admin only)
   */
  createAdmin(adminRequest: AdminRequest): Observable<any> {
    return this.apiService.post(`${this.baseUrl}/admins`, adminRequest);
  }

  /**
   * Update admin details (Super Admin only)
   */
  updateAdmin(adminId: number, updateData: any): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/admins/${adminId}`, updateData);
  }

  /**
   * Update admin signature (Super Admin only)
   */
  updateAdminSignature(adminId: number, signature: string): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/admins/${adminId}/signature`, {
      signature
    });
  }

  /**
   * Deactivate an admin (Super Admin only)
   * This disables the admin account but doesn't delete it
   */
  deactivateAdmin(adminId: number): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/admins/${adminId}/deactivate`, {});
  }

  /**
   * Activate an admin (Super Admin only)
   * This re-enables a previously deactivated admin account
   */
  activateAdmin(adminId: number): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/admins/${adminId}/activate`, {});
  }

  /**
   * Update admin department (Super Admin only)
   * @param adminId The ID of the admin to update
   * @param departmentId The ID of the department to assign (null to remove department)
   */
  updateAdminDepartment(adminId: number, departmentId: number | null): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/admins/${adminId}/department`, {
      departmentId: departmentId
    });
  }
}

