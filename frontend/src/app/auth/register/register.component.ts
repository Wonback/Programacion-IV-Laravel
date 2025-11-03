import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUserShield,
  faEnvelope,
  faLock,
  faTimesCircle,
  faCheckCircle,
  faExclamationCircle,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  faUserShield = faUserShield;
  faEnvelope = faEnvelope;
  faLock = faLock;
  faTimesCircle = faTimesCircle;
  faCheckCircle = faCheckCircle;
  faExclamationCircle = faExclamationCircle;
  faCheckDouble = faCheckDouble;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        password_confirmation: ['', [Validators.required]],
        role: 'user',
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('password_confirmation')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error en el registro';
      },
    });
  }
}
