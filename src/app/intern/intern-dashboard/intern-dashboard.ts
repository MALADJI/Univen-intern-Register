import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-intern-dashboard',
  standalone: true,
  templateUrl: './intern-dashboard.html',
  styleUrls: ['./intern-dashboard.css']
})
export class InternDashboard implements AfterViewInit {
  @ViewChild('signaturePad') signaturePadElement!: ElementRef<HTMLCanvasElement>;
  signaturePad!: SignaturePad;

  signedInMessage: string | null = null;

  ngAfterViewInit(): void {
    this.initSignaturePad();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private initSignaturePad(): void {
    const canvas = this.signaturePadElement.nativeElement;
    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255,255,255)'
    });
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.signaturePadElement.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
    this.signaturePad.clear();
  }

  clearSignature(): void {
    this.signaturePad.clear();
    this.signedInMessage = null;
  }

  saveSignature(): void {
    if (this.signaturePad.isEmpty()) {
      alert('Please provide a signature before saving.');
      return;
    }
    const dataURL = this.signaturePad.toDataURL();
    console.log('Signature saved:', dataURL);
    alert('Signature saved successfully!');
  }

  signIn(): void {
    if (this.signaturePad.isEmpty()) {
      alert('Please provide a signature before signing in.');
      return;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString();
    this.signedInMessage = `Signed in at The University of Venda Main Admin (${currentTime})`;

    // Optionally save signature automatically on sign in
    const dataURL = this.signaturePad.toDataURL();
    console.log('Signature saved on sign in:', dataURL);
  }
}
