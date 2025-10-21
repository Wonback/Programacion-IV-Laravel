import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { QRCodeComponent } from 'angularx-qrcode';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, QRCodeComponent, NavbarComponent],
  templateUrl: './my-tickets.html',
  styleUrls: ['./my-tickets.scss'],
})
export class MyTickets implements OnInit {
  myEvents: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any[]>('http://localhost:8000/api/orders/my-tickets', { headers }).subscribe({
      next: (res) => {
        // Generamos el QR igual que en Checkout
        this.myEvents = res.map(order => ({
          ...order.event,        // info del evento
          quantity: order.quantity,
          qrData: `ORDEN-${order.id}-EVENT-${order.event.id}-USER-${userId}`,
          orderId: order.order_id
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener mis tickets:', err);
        this.loading = false;
      }
    });
  }

  downloadQR(orderId: number) {
    const canvas = document.querySelector(`#qr-${orderId} canvas`) as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `ticket_${orderId}.png`;
    link.click();
  }
}
