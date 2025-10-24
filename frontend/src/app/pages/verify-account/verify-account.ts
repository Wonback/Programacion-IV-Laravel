import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { VerificationService } from '../../services/verification.service';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faUserShield, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './verify-account.html',
  styleUrls: ['./verify-account.scss'],
})
export class VerifyAccount implements OnInit {
  email: string = ''; 
  message = '';
  loading = false;
  isVerified = false;
  isAdmin = false; 
  faEnvelope = faEnvelope;
  faUserShield = faUserShield;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private verificationService: VerificationService,
    private library: FaIconLibrary
  ) {
    library.addIcons(faEnvelope, faUserShield, faCheckCircle, faTimesCircle);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) this.verifyEmail(token);
    });
  }

  verifyEmail(token: string) {
    this.loading = true;
    this.verificationService.verifyEmail(token).subscribe({
      next: (res) => {
        this.message = res.message;
        this.isVerified = true;
        if (res.role === 'admin') this.isAdmin = true;
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al verificar la cuenta.';
        this.loading = false;
      }
    });
  }

  sendMail() { 
    if (!this.email) {
      this.message = 'Por favor ingresa un correo válido.';
      return;
    }

    this.loading = true;
    this.verificationService.sendVerification(this.email).subscribe({
      next: () => {
        this.message = 'Correo de verificación enviado. Revisa tu bandeja.';
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al enviar el correo.';
        this.loading = false;
      }
    });
  }

  requestAdmin() {
    this.loading = true;
    this.verificationService.requestAdmin().subscribe({
      next: (res) => {
        this.message = res.message;
        if (res.role === 'admin') this.isAdmin = true;
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'No se pudo solicitar rol de administrador.';
        this.loading = false;
      }
    });
  }
}
