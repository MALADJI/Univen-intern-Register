import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:8082/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // Note: Headers are handled by authInterceptor
  // Only use getHeaders() for requests that need special Content-Type handling
  private getHeaders(skipContentType: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!skipContentType) {
      headers = headers.set('Content-Type', 'application/json');
    }
    // Authorization is added by interceptor, but we keep this for consistency
    return headers;
  }

  // Authentication endpoints
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, { username, password });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/register`, data);
  }

  getCurrentUser(): Observable<any> {
    // Interceptor handles auth token
    return this.http.get(`${API_URL}/auth/me`);
  }

  sendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/send-verification-code`, { email });
  }

  checkEmailExists(email: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/check-email`, { email });
  }

  verifyCode(email: string, code: string, purpose?: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/verify-code`, { email, code, purpose });
  }

  // Password reset endpoints
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/forgot-password`, { email });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post(`${API_URL}/auth/reset-password`, { email, code, newPassword });
  }

  // Intern endpoints (interceptor handles auth token)
  getInterns(): Observable<any> {
    return this.http.get(`${API_URL}/interns`);
  }

  getInternById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/interns/${id}`);
  }

  updateIntern(id: number, data: any): Observable<any> {
    return this.http.put(`${API_URL}/interns/${id}`, data);
  }

  // Attendance endpoints
  getAttendance(): Observable<any> {
    return this.http.get(`${API_URL}/attendance`);
  }

  signIn(internId: number, location: string): Observable<any> {
    return this.http.post(`${API_URL}/attendance/signin`, { internId, location });
  }

  signOut(attendanceId: number): Observable<any> {
    return this.http.put(`${API_URL}/attendance/signout/${attendanceId}`, {});
  }

  // Leave request endpoints
  getLeaveRequests(status?: string): Observable<any> {
    const url = status ? `${API_URL}/leave?status=${status}` : `${API_URL}/leave`;
    return this.http.get(url);
  }

  submitLeaveRequest(data: any): Observable<any> {
    return this.http.post(`${API_URL}/leave`, data);
  }

  approveLeaveRequest(id: number): Observable<any> {
    return this.http.put(`${API_URL}/leave/approve/${id}`, {});
  }

  rejectLeaveRequest(id: number): Observable<any> {
    return this.http.put(`${API_URL}/leave/reject/${id}`, {});
  }

  // Department endpoints
  getDepartments(): Observable<any> {
    return this.http.get(`${API_URL}/departments`);
  }

  createDepartment(department: any): Observable<any> {
    return this.http.post(`${API_URL}/departments`, department);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${API_URL}/departments/${id}`);
  }

  // Leave request endpoints - additional methods
  getLeaveRequestById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/leave/${id}`);
  }

  getLeaveRequestsByIntern(internId: number): Observable<any> {
    return this.http.get(`${API_URL}/leave/intern/${internId}`);
  }

  searchLeaveRequests(params: any): Observable<any> {
    const queryParams = new URLSearchParams(params).toString();
    return this.http.get(`${API_URL}/leave/search?${queryParams}`);
  }

  uploadLeaveAttachment(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
    // Interceptor will add Authorization header
    return this.http.post(`${API_URL}/leave/${id}/attachment`, formData);
  }

  downloadLeaveAttachment(filename: string): Observable<Blob> {
    return this.http.get(`${API_URL}/leave/attachment/${filename}`, {
      responseType: 'blob'
    });
  }

  // Supervisor endpoints
  getSupervisors(): Observable<any> {
    return this.http.get(`${API_URL}/supervisors`);
  }

  // Admin endpoints
  getAdmins(): Observable<any> {
    return this.http.get(`${API_URL}/admins`);
  }

  // Report endpoints
  downloadAttendanceReportPDF(params: any): Observable<Blob> {
    // Filter out empty/null values
    const cleanParams: any = {};
    if (params.internName) cleanParams.internName = params.internName;
    if (params.department) cleanParams.department = params.department;
    if (params.field) cleanParams.field = params.field;
    
    const queryParams = new URLSearchParams(cleanParams).toString();
    
    return this.http.get(`${API_URL}/reports/attendance/pdf?${queryParams}`, {
      responseType: 'blob'
    });
  }

  downloadAttendanceReportExcel(params: any): Observable<Blob> {
    // Filter out empty/null values
    const cleanParams: any = {};
    if (params.internName) cleanParams.internName = params.internName;
    if (params.department) cleanParams.department = params.department;
    if (params.field) cleanParams.field = params.field;
    
    const queryParams = new URLSearchParams(cleanParams).toString();
    
    return this.http.get(`${API_URL}/reports/attendance/excel?${queryParams}`, {
      responseType: 'blob'
    });
  }

  // Settings endpoints
  getProfile(): Observable<any> {
    return this.http.get(`${API_URL}/settings/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${API_URL}/settings/profile`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${API_URL}/settings/password`, { currentPassword, newPassword });
  }
}

