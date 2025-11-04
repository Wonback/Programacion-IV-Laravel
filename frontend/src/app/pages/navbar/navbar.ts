import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { VerificationService } from '../../services/verification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SearchService } from '../../services/search.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faMeteor,
  faSearch,
  faRightFromBracket,
  faRightToBracket,
  faExclamation,
} from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  searchTerm = '';
  userRole: string = '';
  isLoggedIn = false;
  isVerified: boolean = false;
  verifyMessage: string = '';
  loadingVerify: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private verificationService: VerificationService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const storedEmail = localStorage.getItem('email');

    this.isLoggedIn = !!token;
    if (storedRole) this.userRole = storedRole;

    if (token && storedEmail) {
      this.authService.getUser().subscribe({
        next: (user: User) => {
          if (user && user.role) {
            this.userRole = user.role;
            localStorage.setItem('role', user.role);
          }
          if (user && typeof user.is_verified === 'boolean') {
            this.isVerified = user.is_verified;
          }
          // Guardar email por las dudas
          if (user && user.email) {
            localStorage.setItem('email', user.email);
          }
        },
        error: () => this.logout(false),
      });
    }
  }

  // Icons
  faMeteor = faMeteor;
  faSearch = faSearch;
  faRightFromBracket = faRightFromBracket;
  faRightToBracket = faRightToBracket;
  faExclamation = faExclamation;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.isMenuOpen = false;
  }

  onSearch(): void {
    const term = this.searchTerm.trim();
    this.searchService.updateSearchTerm(term);

    if (this.router.url !== '/home') {
      this.router.navigate(['/home']);
    }

    this.isMenuOpen = false;
  }

  logout(navigate = true): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userRole = '';
    this.isVerified = false;
    this.cdr.detectChanges();
    if (navigate) this.router.navigate(['/login']);
  }

  requestVerification(): void {
    if (this.loadingVerify || !this.isLoggedIn) return;

    const email = localStorage.getItem('email');
    if (!email) {
      this.verifyMessage = 'No se encontró tu correo';
      return;
    }

    this.loadingVerify = true;
    this.verificationService.sendVerification(email).subscribe({
      next: (res: any) => {
        this.verifyMessage = res.message || 'Correo enviado correctamente';
        this.loadingVerify = false;
      },
      error: (err: HttpErrorResponse) => {
        this.verifyMessage = err.error?.message || 'Error al enviar correo';
        this.loadingVerify = false;
      },
    });
  }
}
