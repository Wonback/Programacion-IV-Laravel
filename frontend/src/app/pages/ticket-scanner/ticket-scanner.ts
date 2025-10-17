import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/library';

interface EventOption {
  id: number;
  title: string;
}

interface Order {
  id: number;
  user_id: number;
  qr_code: string;
  used: boolean;
  event_id: number;
}

@Component({
  selector: 'app-ticket-scanner',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ZXingScannerModule],
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

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
  
    this.http.get<EventOption[]>('http://localhost:8000/api/my-events', { headers })
      .subscribe({
        next: res => this.events = res,
        error: err => console.error('Error cargando eventos', err)
      });
  }

  selectEvent() {
    if (!this.selectedEventId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<Order[]>(`http://localhost:8000/api/events/${this.selectedEventId}/orders`, { headers })
      .subscribe({
        next: res => this.orders = res,
        error: err => console.error('Error cargando tickets', err)
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
        }).catch(err => {
          this.message = 'No se pudo leer el QR desde la imagen';
          console.error(err);
        });
      };
    };
    reader.readAsDataURL(file);
  }

  validateQR() {
    if (!this.qrResult || !this.selectedEventId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    this.http.post(`http://localhost:8000/api/orders/validate`, 
      { qr_data: this.qrResult }, 
      { headers }
    ).subscribe({
      next: (res: any) => {
        this.message = res.message;
        this.selectEvent(); // refresca listado de tickets
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al validar ticket';
      }
    });
  }
}
