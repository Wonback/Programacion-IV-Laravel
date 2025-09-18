import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
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
  user_id: number; 
}

@Component({
  selector: 'app-admin-event',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-event.html',
  styleUrls: ['./admin-event.scss']
})
export class AdminEvent implements OnInit {
  event?: Event;
  currentUserId?: number; 

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const id = localStorage.getItem('userId');
    if (id) this.currentUserId = Number(id);

    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.http.get<Event>(`http://localhost:8000/api/events/${eventId}`, { headers })
        .subscribe({
          next: (res) => this.event = res,
          error: (err) => console.error('Error al obtener evento:', err)
        });
    }
  }


  canEdit(): boolean {
    return this.event?.user_id === this.currentUserId;
  }

  deleteEvent(): void {
    if (!this.event) return;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.delete(`http://localhost:8000/api/events/${this.event.id}`, { headers })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => console.error('Error al borrar evento:', err)
      });
  }

  editEvent(): void {
    if (!this.event) return;
    this.router.navigate(['/admin/event/edit', this.event.id]);
  }
}
