import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChartData, ChartOptions } from 'chart.js';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

interface EventStat {
  id: number;
  title: string;
  capacity: number;
  orders_count: number;
}

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink, FontAwesomeModule, BaseChartDirective],
  templateUrl: './user-stats.html',
})
export class UserStats implements OnInit {
  faCalendar = faCalendar;

  events: EventStat[] = [];
  totalEvents = 0;
  totalTickets = 0;

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Entradas vendidas por evento', color: '#00d58b', font: { size: 18 } }
    },
    scales: {
      y: { ticks: { color: '#00d58b' }, beginAtZero: true },
      x: { ticks: { color: '#00d58b' } }
    }
  };

  public barChartType: 'bar' = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { label: 'Tickets vendidos', data: [], backgroundColor: '#00d58b' }
    ]
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserEvents();
  }

  private loadUserEvents(): void {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<EventStat[]>('/api/my-events', { headers }).subscribe({
      next: (events) => {
        this.events = events;
        this.totalEvents = events.length;
        this.totalTickets = events.reduce((sum, e) => sum + e.orders_count, 0);
        this.barChartData.labels = events.map(e => e.title);
        this.barChartData.datasets[0].data = events.map(e => e.orders_count);
      },
      error: (err) => {
        console.error('Error cargando eventos del usuario:', err);
      }
    });
  }
}
