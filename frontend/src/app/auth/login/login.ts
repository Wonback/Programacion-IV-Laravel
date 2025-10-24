import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginResponse } from '../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  faEnvelope = faEnvelope;
  faLock = faLock;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: LoginResponse) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.user.id.toString());
        localStorage.setItem('role', res.user.role);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = 'Credenciales inválidas';
        console.error(err);
      }
    });
  }
}
