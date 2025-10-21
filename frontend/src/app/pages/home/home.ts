import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, NavbarComponent, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home implements OnInit {
  events: Event[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<{ data: Event[] }>('http://localhost:8000/api/events', { headers })
      .subscribe({
        next: (res) => {
          const now = new Date();

          //Filtramos solo los eventos futuros
          this.events = res.data
            .filter(event => new Date(event.starts_at) > now)
            .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
        },
        error: (err) => {
          console.error('Error al obtener eventos:', err);
        }
      });
  }
}
