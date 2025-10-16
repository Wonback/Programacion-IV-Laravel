import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  searchTerm = '';
  userRole: string = '';
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Leer datos del localStorage al iniciar
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');

    this.isLoggedIn = !!token;
    if (storedRole) {
      this.userRole = storedRole;
    }
    // Si hay token, refrescar info desde backend
    if (token) {
      this.authService.getUser().subscribe({
        next: (user) => {
          if (user && user.role) {
            this.userRole = user.role;
            localStorage.setItem('role', user.role);
          }
        },
        error: () => this.logout(false), // logout sin redirigir si falla
      });
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigate(path: string): void {
    this.router.navigate([path]);
    this.isMenuOpen = false;
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchTerm } });
    }
    this.isMenuOpen = false;
  }

  logout(navigate = true): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userRole = '';
    this.cdr.detectChanges();
    if (navigate) this.router.navigate(['/login']);
  }
}
