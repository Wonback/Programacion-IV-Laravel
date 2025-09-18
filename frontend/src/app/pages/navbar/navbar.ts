import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  searchTerm = '';
  userRole: string = 'user';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUser().subscribe({
      next: (user) => {
        this.userRole = user.role; 
      },
      error: (err) => {
        console.error('Error al obtener usuario:', err);
      }
    });
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
      console.log('Buscando:', this.searchTerm);
    }
    this.isMenuOpen = false;
  }
}
