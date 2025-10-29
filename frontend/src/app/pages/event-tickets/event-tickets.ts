import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Ticket {
  id: number;
  user_id: number;
  quantity: number;
  total: number;
  used: boolean;
  qr_code: string;
}

@Component({
  selector: 'app-event-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './event-tickets.html',
  styleUrls: ['./event-tickets.scss']
})
export class EventTickets implements OnInit {
  tickets: Ticket[] = [];
  eventId: number = 0;
  message: string = '';

  faCheck = faCheck;
  faTimes = faTimes;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTickets();
  }

  loadTickets() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<Ticket[]>(`http://localhost:8000/api/events/${this.eventId}/orders`, { headers })
      .subscribe({
        next: (res) => this.tickets = res,
        error: (err) => console.error(err)
      });
  }

  markAsUsed(ticket: Ticket) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(`http://localhost:8000/api/orders/validate`, { qr_data: ticket.qr_code }, { headers })
      .subscribe({
        next: (res: any) => {
          ticket.used = true;
          this.message = res.message;
        },
        error: (err) => this.message = err.error.message || 'Error al validar ticket'
      });
  }
}
