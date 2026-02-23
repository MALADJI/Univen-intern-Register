// ============================================
// EXAMPLE: Signature Upload Component
// ============================================
// This is an example component for uploading signatures
// You can integrate this into your profile or settings page

import { Component, OnInit } from '@angular/core';
import { UserSignatureService } from '../services/user-signature.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signature-upload',
  template: `
    <div class="signature-upload">
      <h3>My Signature</h3>
      
      <!-- Signature Display -->
      <div *ngIf="hasSignature && signature" class="signature-display">
        <p>Current Signature:</p>
        <img [src]="signature" alt="Signature" *ngIf="isImage(signature)" style="max-width: 300px; border: 1px solid #ccc;">
        <p *ngIf="!isImage(signature)">{{ signature }}</p>
      </div>
      
      <!-- Signature Input -->
      <div class="signature-input">
        <label>Upload Signature (Base64 encoded image or text):</label>
        <textarea 
          [(ngModel)]="signatureInput" 
          rows="5" 
          placeholder="Paste base64 image data or enter text signature"
          style="width: 100%; padding: 10px;">
        </textarea>
        
        <!-- File Upload Alternative -->
        <input 
          type="file" 
          accept="image/*" 
          (change)="onFileSelected($event)"
          style="margin-top: 10px;">
      </div>
      
      <!-- Actions -->
      <div class="actions">
        <button mat-raised-button color="primary" (click)="saveSignature()" [disabled]="loading">
          {{ hasSignature ? 'Update Signature' : 'Save Signature' }}
        </button>
        <button mat-button (click)="loadSignature()" [disabled]="loading">Load Current</button>
      </div>
    </div>
  `
})
export class SignatureUploadComponent implements OnInit {
  signature: string = '';
  signatureInput: string = '';
  hasSignature: boolean = false;
  loading: boolean = false;

  constructor(
    private signatureService: UserSignatureService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSignature();
  }

  loadSignature(): void {
    this.loading = true;
    this.signatureService.getMySignature().subscribe({
      next: (response) => {
        this.hasSignature = response.hasSignature;
        this.signature = response.signature || '';
        this.signatureInput = this.signature;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading signature:', error);
        this.snackBar.open('Failed to load signature', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  saveSignature(): void {
    if (!this.signatureInput.trim()) {
      this.snackBar.open('Please enter a signature', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    this.signatureService.updateMySignature(this.signatureInput).subscribe({
      next: () => {
        this.snackBar.open('Signature saved successfully', 'Close', { duration: 3000 });
        this.hasSignature = true;
        this.signature = this.signatureInput;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving signature:', error);
        this.snackBar.open('Failed to save signature', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Convert to base64
        this.signatureInput = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  isImage(data: string): boolean {
    return data.startsWith('data:image/') || data.startsWith('data:image/png') || data.startsWith('data:image/jpeg');
  }
}

