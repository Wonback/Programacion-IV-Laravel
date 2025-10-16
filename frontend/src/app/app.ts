import { Component } from '@angular/core';
import { NavbarComponent } from './pages/navbar/navbar';
import { FooterComponent } from './pages/footer/footer';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {}
