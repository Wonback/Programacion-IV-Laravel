import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faUsers, faMoneyBillWave, faImage } from '@fortawesome/free-solid-svg-icons';
import { FooterComponent } from '../footer/footer';
import { EVENT_CATEGORIES } from '../../shared/event-categories';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent, CommonModule, FontAwesomeModule, FooterComponent],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.scss'],
})
export class CreateEvent {
  eventForm: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  uploading: boolean = false;
  imagePreview: string | null = null;
  categories = EVENT_CATEGORIES;

  faCalendar = faCalendar;
  faUsers = faUsers;
  faMoneyBillWave = faMoneyBillWave;
  faImage = faImage;

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(180)]],
      description: [''],
      category: ['', Validators.required],
      starts_at: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
    });
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

  async onSubmit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }
    this.uploading = true;

    try {
      let imageUrl: string | null = null;

      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('upload_preset', 'utnentradas');

        const cloudRes: any = await this.http
          .post('https://api.cloudinary.com/v1_1/da80v8vj1/image/upload', formData)
          .toPromise();
        imageUrl = cloudRes.secure_url;
      }

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      const body = { ...this.eventForm.value, image_path: imageUrl };
      await this.http.post('http://localhost:8000/api/events', body, { headers }).toPromise();
      this.router.navigate(['/home']);
    } catch (err: any) {
      console.error('Error al crear evento:', err);
      this.errorMessage = err.error?.message || 'Error al crear evento';
    } finally {
      this.uploading = false;
    }
  }
}
