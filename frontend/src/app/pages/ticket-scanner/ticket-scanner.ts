import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHome, faQrcode, faUser, faTicketAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import { NavbarComponent } from '../navbar/navbar';

interface EventOption { id: number; title: string; }

interface User {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  user_id: number;
  qr_code: string;
  used: boolean;
  event_id: number;
  user?: User; // <-- incluimos la relación con el usuario
}

@Component({
  selector: 'app-ticket-scanner',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, FormsModule, ZXingScannerModule, FontAwesomeModule],
  templateUrl: './ticket-scanner.html',
  styleUrls: ['./ticket-scanner.scss']
})
export class TicketScanner implements OnInit {
  events: EventOption[] = [];
  selectedEventId: number | null = null;
  orders: Order[] = [];
  qrResult: string | null = null;
  message: string = '';
  formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];
  useFileInput = false;

  reader = new BrowserMultiFormatReader();
  faHome = faHome;
  faQrcode = faQrcode;
  faUser = faUser;
  faTicketAlt = faTicketAlt;
  faCheck = faCheck;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<EventOption[]>('http://localhost:8000/api/my-events', { headers })
      .subscribe({ next: res => this.events = res, error: err => console.error(err) });
  }

  selectEvent() {
    if (!this.selectedEventId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    // Llamamos al endpoint que devuelve las órdenes con el usuario incluido
    this.http.get<Order[]>(`http://localhost:8000/api/events/${this.selectedEventId}/orders`, { headers })
      .subscribe({
        next: res => {
          this.orders = res;
        },
        error: err => console.error(err)
      });
  }

  onCodeResult(resultString: string) {
    this.qrResult = resultString;
    this.validateQR();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        this.reader.decodeFromImage(img).then(result => {
          this.qrResult = result.getText();
          this.validateQR();
        }).catch(() => this.message = 'No se pudo leer el QR desde la imagen');
      };
    };
    reader.readAsDataURL(file);
  }

  validateQR() {
    if (!this.qrResult || !this.selectedEventId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post(`http://localhost:8000/api/orders/validate`, { qr_data: this.qrResult }, { headers })
      .subscribe({
        next: (res: any) => {
          this.message = res.message;
          this.selectEvent(); // recarga la tabla
        },
        error: (err) => this.message = err.error?.message || 'Error al validar ticket'
      });
  }
}
