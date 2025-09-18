import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.scss']
})
export class EventDetail implements OnInit {
  event?: Event;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const token = localStorage.getItem('token');

    if (id) {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      this.http.get<Event>(`http://localhost:8000/api/events/${id}`, { headers })
        .subscribe({
          next: (res) => {
            this.event = res;   
            console.log('Evento cargado:', this.event);
          },
          error: (err) => {
            console.error('Error al obtener evento:', err);
          }
        });
    }
  }
}
