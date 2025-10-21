import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificationService } from '../../services/verification.service';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  templateUrl: './verify-account.html',
  styleUrls: ['./verify-account.scss'],
})
export class VerifyAccount implements OnInit {
  message = '';
  loading = false;
  isVerified = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private verificationService: VerificationService
  ) {}

  ngOnInit() {
    // Detectar token en el query param
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyEmail(token);
      }
    });
  }

  verifyEmail(token: string) {
    this.loading = true;
    this.verificationService.verifyEmail(token).subscribe({
      next: (res) => {
        this.message = res.message;
        this.isVerified = true; // ya puede pedir admin
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al verificar la cuenta.';
        this.loading = false;
      }
    });
  }

  sendMail(email: string) {
    if (!email) {
      this.message = 'Por favor ingresa un correo válido.';
      return;
    }

    this.loading = true;
    this.verificationService.sendVerification(email).subscribe({
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
        this.loading = false;
      },
      error: (err) => {
        this.message = err.error?.message || 'No se pudo solicitar rol de administrador.';
        this.loading = false;
      }
    });
  }
}
