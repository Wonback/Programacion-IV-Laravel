import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';
import { AuthService, ProfileResponse, User } from '../../services/auth.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCamera,
  faFloppyDisk,
  faRotateLeft,
  faShieldHalved,
  faLock,
  faBell,
  faTrash,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent, FontAwesomeModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.scss'],
})
export class UserProfile implements OnInit, OnDestroy {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: User | null = null;
  loadingProfile = false;
  loadingPassword = false;
  successMessage: string | null = null;
  passwordMessage: string | null = null;
  errorMessage: string | null = null;
  passwordError: string | null = null;
  avatarPreview: string | null = null;
  avatarFile: File | null = null;
  removeAvatar = false;
  private subscriptions: Subscription[] = [];
  private initialProfile: Partial<User> | null = null;

  // Icons
  faCamera = faCamera;
  faFloppyDisk = faFloppyDisk;
  faRotateLeft = faRotateLeft;
  faShieldHalved = faShieldHalved;
  faLock = faLock;
  faBell = faBell;
  faTrash = faTrash;
  faCircleInfo = faCircleInfo;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(30)]],
      bio: ['', [Validators.maxLength(500)]],
      email_notifications: [true],
    });

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    if (this.avatarPreview && this.avatarFile) {
      URL.revokeObjectURL(this.avatarPreview);
    }
  }

  loadProfile(): void {
    const sub = this.authService.getUser().subscribe({
      next: (user) => {
        this.user = user;
        this.initialProfile = { ...user };
        this.avatarPreview = user.avatar_url;
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          bio: user.bio || '',
          email_notifications: user.email_notifications,
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar tu perfil. Intenta nuevamente.';
      },
    });

    this.subscriptions.push(sub);
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.loadingProfile = true;
    this.successMessage = null;
    this.errorMessage = null;

    const formData = new FormData();
    const values = this.profileForm.value;
    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
        return;
      }

      if (value instanceof Date) {
        formData.append(key, value.toISOString());
        return;
      }

      const stringValue = value.toString();
      formData.append(key, stringValue);
    });

    if (this.avatarFile) {
      formData.append('avatar', this.avatarFile);
    }

    if (this.removeAvatar) {
      formData.append('remove_avatar', '1');
    }

    const sub = this.authService.updateProfile(formData).subscribe({
      next: (res: ProfileResponse) => {
        this.loadingProfile = false;
        this.successMessage = res.message || 'Perfil actualizado correctamente.';
        this.user = res.user;
        this.initialProfile = { ...res.user };
        this.profileForm.patchValue({
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || '',
          bio: res.user.bio || '',
          email_notifications: res.user.email_notifications,
        });
        this.avatarPreview = res.user.avatar_url;
        this.avatarFile = null;
        this.removeAvatar = false;
      },
      error: (err) => {
        this.loadingProfile = false;
        this.errorMessage = err.error?.message || 'No se pudo actualizar el perfil.';
      },
    });

    this.subscriptions.push(sub);
  }

  onPasswordSubmit(): void {
    this.passwordError = null;
    this.passwordMessage = null;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { current_password, password, password_confirmation } = this.passwordForm.value;
    if (password !== password_confirmation) {
      this.passwordError = 'Las contraseñas nuevas no coinciden.';
      return;
    }

    this.loadingPassword = true;

    const sub = this.authService
      .updateProfile({ current_password, password, password_confirmation })
      .subscribe({
        next: (res) => {
          this.loadingPassword = false;
          this.passwordMessage = res.message || 'Contraseña actualizada correctamente.';
          this.passwordForm.reset();
        },
        error: (err) => {
          this.loadingPassword = false;
          this.passwordError = err.error?.message || 'No se pudo actualizar la contraseña.';
        },
      });

    this.subscriptions.push(sub);
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (this.avatarPreview && this.avatarFile) {
      URL.revokeObjectURL(this.avatarPreview);
    }

    this.avatarFile = file;
    this.avatarPreview = URL.createObjectURL(file);
    this.removeAvatar = false;
  }

  clearAvatar(): void {
    if (this.avatarPreview && this.avatarFile) {
      URL.revokeObjectURL(this.avatarPreview);
    }

    this.avatarFile = null;
    this.avatarPreview = null;
    this.removeAvatar = true;
  }

  resetProfile(): void {
    if (!this.initialProfile) {
      return;
    }

    this.profileForm.patchValue({
      name: this.initialProfile.name ?? '',
      email: this.initialProfile.email ?? '',
      phone: this.initialProfile.phone ?? '',
      bio: this.initialProfile.bio ?? '',
      email_notifications: this.initialProfile.email_notifications ?? true,
    });
    this.errorMessage = null;
    this.successMessage = null;
    if (this.avatarPreview && this.avatarFile) {
      URL.revokeObjectURL(this.avatarPreview);
    }
    this.avatarFile = null;
    this.avatarPreview = this.initialProfile.avatar_url ?? null;
    this.removeAvatar = false;
  }
}
