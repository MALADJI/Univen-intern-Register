import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Department {
  departmentId: number;
  name: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private baseUrl = '/api/departments';

  constructor(private apiService: ApiService) {}

  /**
   * Get all departments
   */
  getAllDepartments(): Observable<Department[]> {
    return this.apiService.get<Department[]>(this.baseUrl);
  }

  /**
   * Get department by ID
   */
  getDepartmentById(id: number): Observable<Department> {
    return this.apiService.get<Department>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new department
   */
  createDepartment(name: string): Observable<Department> {
    return this.apiService.post<Department>(this.baseUrl, { name });
  }

  /**
   * Update department name
   */
  updateDepartment(id: number, name: string): Observable<Department> {
    return this.apiService.put<Department>(`${this.baseUrl}/${id}`, { name });
  }

  /**
   * Deactivate a department (Super Admin only)
   * This disables the department but doesn't delete it
   */
  deactivateDepartment(id: number): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/${id}/deactivate`, {});
  }

  /**
   * Activate a department (Super Admin only)
   * This re-enables a previously deactivated department
   */
  activateDepartment(id: number): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/${id}/activate`, {});
  }

  /**
   * Delete a department (permanent deletion)
   * Note: Cannot delete if department has interns or supervisors assigned
   */
  deleteDepartment(id: number): Observable<any> {
    return this.apiService.delete(`${this.baseUrl}/${id}`);
  }
}

