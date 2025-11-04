import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faArrowRight, faTicket, faRetweet, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../footer/footer';

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
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink, FontAwesomeModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit, OnDestroy {
  open = false;
  options = [
    { value: 'all', label: 'Todos los eventos' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'year', label: 'Este año' },
  ];
  selected = this.options[0];

  select(opt: any) {
    this.selected = opt;
    this.open = false;
    // emulá el change del <select>
    this.onFilterDateChange({ target: { value: opt.value } } as any);
  }

  events: Event[] = [];
  filteredEvents: Event[] = [];
  paginatedEvents: Event[] = [];

  // Paginación
  currentPage = 1;
  pageSize = 8;

  // Filtros
  filters = {
    term: '',
    date: 'all',
  };

  // Animación
  animated = true;

  private searchSub!: Subscription;

  // Icons
  faCalendar = faCalendar;
  faArrowRight = faArrowRight;
  faTicket = faTicket;
  faRetweet = faRetweet;
  faChevronDown = faChevronDown;

  constructor(private http: HttpClient, private searchService: SearchService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<{ data: Event[] }>('http://localhost:8000/api/events', { headers }).subscribe({
      next: (res) => {
        const now = new Date();
        this.events = res.data
          .filter((e) => new Date(e.starts_at) > now)
          .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

        this.applyFilters(true);
      },
      error: (err) => console.error('Error al obtener eventos:', err),
    });

    this.searchSub = this.searchService.searchTerm$.subscribe((term) => {
      this.filters.term = term.toLowerCase();
      this.applyFilters();
    });
  }

  // Cambio de fecha en el select
  onFilterDateChange(event: any) {
    const select = event.target as HTMLSelectElement;
    this.filters.date = select.value;
    this.applyFilters(true);
  }

  // Resetear filtros
  resetFilters() {
    this.filters = { term: '', date: 'all' };
    this.currentPage = 1;
    this.selected = this.options[0];
    this.open = false;
    this.applyFilters(true);
    this.searchService.updateSearchTerm('');
  }

  // Aplicar filtros
  applyFilters(resetPage = false) {
    if (resetPage) this.currentPage = 1;

    const now = new Date();

    this.filteredEvents = this.events.filter((ev) => {
      const starts = new Date(ev.starts_at);

      // Filtrado por término
      const matchTerm =
        !this.filters.term ||
        ev.title.toLowerCase().includes(this.filters.term) ||
        (ev.description && ev.description.toLowerCase().includes(this.filters.term));

      // Filtrado por fecha
      let matchDate = true;
      if (this.filters.date === 'today') matchDate = starts.toDateString() === now.toDateString();
      if (this.filters.date === 'week') {
        const week = new Date(now);
        week.setDate(week.getDate() + 7);
        matchDate = starts >= now && starts <= week;
      }
      if (this.filters.date === 'month') {
        const month = new Date(now);
        month.setMonth(month.getMonth() + 1);
        matchDate = starts >= now && starts <= month;
      }

      return matchTerm && matchDate;
    });

    this.updatePagination();
    this.triggerAnimation();
  }

  // Control animación
  triggerAnimation() {
    this.animated = false;
    setTimeout(() => (this.animated = true), 50);
  }

  // Paginación
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEvents = this.filteredEvents.slice(startIndex, endIndex);
  }

  totalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.pageSize);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.filteredEvents.length) {
      this.currentPage++;
      this.updatePagination();
      this.triggerAnimation();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
      this.triggerAnimation();
    }
  }

  ngOnDestroy() {
    if (this.searchSub) this.searchSub.unsubscribe();
  }
}
