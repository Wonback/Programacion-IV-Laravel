import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';

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
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    RouterLink,
    FontAwesomeModule,
    BaseChartDirective,
  ],
  templateUrl: './user-stats.html',
  styleUrls: ['./user-stats.scss'],
})
export class UserStats implements OnInit, AfterViewInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  faCalendar = faCalendar;

  Math = Math;

  events: EventStat[] = [];
  totalEvents = 0;
  totalTickets = 0;

  public barChartType: 'bar' = 'bar';

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // usa la altura del contenedor (definida en el HTML)
    plugins: {
      legend: {
        display: false,
        labels: { color: '#d1d5db' },
      },
      title: {
        display: true,
        text: 'Entradas vendidas por evento',
        color: '#00d58b',
        font: { size: 18 },
      },
      tooltip: {
        backgroundColor: '#001a1f',
        titleColor: '#e5e7eb',
        bodyColor: '#9ca3af',
        borderColor: '#00d58b',
        borderWidth: 1,
      },
    },
    elements: {
      bar: { borderRadius: 6 },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,213,139,0.15)' },
        ticks: { color: '#a3a3a3', maxRotation: 30, autoSkip: true },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,213,139,0.10)' },
        ticks: { color: '#a3a3a3', precision: 0, stepSize: 1 },
      },
    },
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Tickets vendidos',
        data: [],
        backgroundColor: 'rgba(0,213,139,0.35)',
        hoverBackgroundColor: 'rgba(0,213,139,0.55)',
        borderColor: '#00d58b',
        borderWidth: 2,
        maxBarThickness: 100, // más grosor absoluto
        barPercentage: 0.9, // barras más anchas dentro de su espacio
        categoryPercentage: 0.9,
      },
    ],
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserEvents();
  }

  ngAfterViewInit(): void {
    // Si el canvas se montó antes de que el contenedor tenga tamaño final
    setTimeout(() => this.chart?.chart?.resize(), 0);
  }

  private loadUserEvents(): void {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<EventStat[]>('/api/my-events', { headers }).subscribe({
      next: (events) => {
        this.events = events;
        this.totalEvents = events.length;
        this.totalTickets = events.reduce((sum, e) => sum + e.orders_count, 0);

        const labels = events.map((e) => e.title);
        const data = events.map((e) => e.orders_count);

        // Reasignar objeto para disparar cambio en ng2-charts
        this.barChartData = {
          labels,
          datasets: [
            {
              ...this.barChartData.datasets[0],
              data,
            },
          ],
        };

        // Forzar actualización/redimensionado por si el layout cambió
        this.chart?.update();
        this.chart?.chart?.resize();
      },
      error: (err) => {
        console.error('Error cargando eventos del usuario:', err);
      },
    });
  }
}
