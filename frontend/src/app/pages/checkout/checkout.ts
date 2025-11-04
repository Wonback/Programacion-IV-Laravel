import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavbarComponent } from '../navbar/navbar';
import { FooterComponent } from '../footer/footer';

// Íconos FontAwesome (solo los que mantenemos)
import {
  faCheckCircle,
  faEnvelope,
  faUserShield,
  faTicketAlt,
  faDollarSign,
  faDownload,
  faCreditCard,
  faHome,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    QRCodeComponent,
    FontAwesomeModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class Checkout implements OnInit {
  eventId!: number;
  eventTitle = '';
  price = 0;
  paymentDone = false;
  qrData: string | null = null;

  // Datos de la tarjeta
  cardNumber = '';
  cardHolder = '';
  expiration = '';
  cvv = '';
  cardType: 'visa' | 'mastercard' | 'amex' | 'unknown' = 'unknown';
  cardTouched = false;
  loading = false;
  userEmail = '';

  // Íconos FontAwesome (los que dejamos)
  faCheckCircle = faCheckCircle;
  faEnvelope = faEnvelope;
  faUserShield = faUserShield;
  faTicketAlt = faTicketAlt;
  faDollarSign = faDollarSign;
  faDownload = faDownload;
  faCreditCard = faCreditCard;
  faHome = faHome;
  faSpinner = faSpinner;

  constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.userEmail = localStorage.getItem('email') || '';
    this.loadEvent();
  }

  loadEvent(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<any>(`http://localhost:8000/api/events/${this.eventId}`, { headers }).subscribe({
      next: (res) => {
        this.eventTitle = res.title;
        this.price = res.price;
      },
      error: (err) => console.error(err),
    });
  }

  formatCardNumber(): void {
    this.cardTouched = true;
    this.cardNumber = this.cardNumber
      .replace(/\D/g, '')
      .replace(/(\d{4})(?=\d)/g, '$1 ')
      .trim();
    this.detectCardType();
  }

  detectCardType(): void {
    const num = this.cardNumber.replace(/\s+/g, '');
    if (/^4[0-9]{0,}$/.test(num)) this.cardType = 'visa';
    else if (/^5[1-5][0-9]{0,}$/.test(num) || /^2[2-7][0-9]{0,}$/.test(num)) this.cardType = 'mastercard';
    else if (/^3[47][0-9]{0,}$/.test(num)) this.cardType = 'amex';
    else this.cardType = 'unknown';
  }

  processPayment(): void {
    this.loading = true;
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const body = { event_id: this.eventId, quantity: 1 };

    setTimeout(() => {
      this.http.post<any>(`http://localhost:8000/api/orders`, body, { headers }).subscribe({
        next: (res) => {
          this.qrData = `ORDEN-${res.id}-EVENT-${this.eventId}-USER-${localStorage.getItem('userId')}`;
          this.paymentDone = true;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
    }, 1500);
  }

  downloadQR(): void {
    if (!this.qrData) return;
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `ticket_event_${this.eventId}.png`;
    link.click();
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
