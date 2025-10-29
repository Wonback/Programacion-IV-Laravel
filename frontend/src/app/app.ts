import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './pages/navbar/navbar';
import { FooterComponent } from './pages/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  showLayout = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenRoutes = ['/login', '/register'];
        this.showLayout = !hiddenRoutes.includes(event.url);
      });
  }
}
