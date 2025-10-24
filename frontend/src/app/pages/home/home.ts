import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faArrowRight } from '@fortawesome/free-solid-svg-icons'; // íconos

interface Event {
  id: number;
  title: string;
  description?: string;
  starts_at: string;
  capacity: number;
  price: number;
  image_path?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink, FontAwesomeModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit, OnDestroy {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  private searchSub!: Subscription;

  // FontAwesome
  faCalendar = faCalendar;
  faArrowRight = faArrowRight;

  constructor(private http: HttpClient, private searchService: SearchService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ data: Event[] }>('http://localhost:8000/api/events', { headers }).subscribe({
      next: (res) => {
        const now = new Date();
        this.events = res.data
          .filter(e => new Date(e.starts_at) > now)
          .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
        this.filteredEvents = [...this.events];
      },
      error: (err) => console.error('Error al obtener eventos:', err)
    });

    this.searchSub = this.searchService.searchTerm$.subscribe(term => {
      this.filterEvents(term);
    });
  }

  filterEvents(term: string) {
    if (!term) {
      this.filteredEvents = [...this.events];
      return;
    }
    const lower = term.toLowerCase();
    this.filteredEvents = this.events.filter(ev =>
      ev.title.toLowerCase().includes(lower) ||
      (ev.description && ev.description.toLowerCase().includes(lower))
    );
  }

  ngOnDestroy() {
    if (this.searchSub) this.searchSub.unsubscribe();
  }
}
