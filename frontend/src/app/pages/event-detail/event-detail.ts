import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faTicket,
  faArrowLeft,
  faPen,
  faTrash,
  faCalendar,
  faUsers,
  faMoneyBill,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons';

interface EventModel {
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
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    FormsModule,
    FaIconComponent,
    FontAwesomeModule,
  ],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.scss'],
})
export class EventDetail implements OnInit {
  event?: EventModel;
  currentUserId: number = 0;
  editMode = false;
  formData: any = {};
  selectedFile: File | null = null;
  uploading = false;
  imagePreview: string | null = null;
  faTicket = faTicket;
  faArrowLeft = faArrowLeft;
  faPen = faPen;
  faTrash = faTrash;
  faCalendar = faCalendar;
  faUsers = faUsers;
  faMoney = faMoneyBill;
  faDollarSign = faDollarSign;

  constructor(public router: Router, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.currentUserId = Number(localStorage.getItem('userId') || 0);
    this.loadEvent();
  }

  loadEvent() {
    const eventId = this.route.snapshot.paramMap.get('id');
    const token = localStorage.getItem('token');

    if (eventId && token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.http
        .get<EventModel>(`http://localhost:8000/api/events/${eventId}`, { headers })
        .subscribe({
          next: (res) => {
            this.event = res;
            this.formData = { ...res };
          },
          error: (err) => console.error('Error al obtener evento:', err),
        });
    }
  }

  canEdit(): boolean {
    return this.event?.user_id === this.currentUserId;
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    if (this.event) this.formData = { ...this.event };
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async saveEdit(form: any) {
    if (!this.event) return;
    this.uploading = true;

    try {
      let imageUrl = this.formData.image_path;

      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('upload_preset', 'eventos_preset');

        const cloudRes: any = await this.http
          .post('https://api.cloudinary.com/v1_1/da80v8vj1/image/upload', formData)
          .toPromise();

        imageUrl = cloudRes.secure_url;
      }

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      const body = { ...this.formData, image_path: imageUrl };

      await this.http
        .put(`http://localhost:8000/api/events/${this.event.id}`, body, { headers })
        .toPromise();

      this.event = { ...body };
      this.editMode = false;
    } catch (err) {
      console.error('Error al editar evento:', err);
    } finally {
      this.uploading = false;
    }
  }

  deleteEvent() {
    if (!this.event) return;
    if (!confirm('¿Seguro que querés cancelar este evento?')) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.delete(`http://localhost:8000/api/events/${this.event.id}`, { headers }).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => console.error('Error al borrar evento:', err),
    });
  }

  // Navegación pública
  goToCheckout(eventId: number) {
    this.router.navigate(['/checkout', eventId]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
