import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SignatureResponse {
  hasSignature: boolean;
  signature: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserSignatureService {
  private baseUrl = '/api/users';

  constructor(private apiService: ApiService) {}

  /**
   * Get current user's signature
   */
  getMySignature(): Observable<SignatureResponse> {
    return this.apiService.get<SignatureResponse>(`${this.baseUrl}/me/signature`);
  }

  /**
   * Update current user's signature
   */
  updateMySignature(signature: string): Observable<any> {
    return this.apiService.put(`${this.baseUrl}/me/signature`, {
      signature
    });
  }
}

