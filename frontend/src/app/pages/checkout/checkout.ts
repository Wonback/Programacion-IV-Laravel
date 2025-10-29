import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faEnvelope, faUserShield, faTimesCircle, faTicketAlt, faCalendar, faDollarSign, faDownload, faCreditCard, faHome } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, QRCodeComponent, FontAwesomeModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss']
})
export class Checkout implements OnInit {
  eventId!: number;
  eventTitle: string = '';
  price: number = 0;
  paymentDone = false;
  qrData: string | null = null;
  faCheckCircle = faCheckCircle;
  faEnvelope = faEnvelope;
  faUserShield = faUserShield;
  faTimesCircle = faTimesCircle;
  faTicketAlt = faTicketAlt;
  faCalendar = faCalendar;
  faDollarSign = faDollarSign;
  faDownload = faDownload;
  faCreditCard = faCreditCard;
  faHome = faHome;
  constructor(public router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEvent();
  }

  loadEvent() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`http://localhost:8000/api/events/${this.eventId}`, { headers }).subscribe({
      next: res => {
        this.eventTitle = res.title;
        this.price = res.price;
      },
      error: err => console.error(err)
    });
  }

  processPayment() {
    // Simulación de pago
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const body = { event_id: this.eventId, quantity: 1 };

    this.http.post<any>(`http://localhost:8000/api/orders`, body, { headers }).subscribe({
      next: res => {
        // Generar QR con info de la orden
        this.qrData = `ORDEN-${res.id}-EVENT-${this.eventId}-USER-${localStorage.getItem('userId')}`;
        this.paymentDone = true;
      },
      error: err => console.error(err)
    });
  }

  downloadQR() {
    if (!this.qrData) return;

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `ticket_event_${this.eventId}.png`;
    link.click();
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
