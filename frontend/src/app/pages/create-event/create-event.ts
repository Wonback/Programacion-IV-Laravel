import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.scss']
})
export class CreateEvent {
  eventForm: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  uploading: boolean = false;
  imagePreview: string | null = null;  

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(180)]],
      description: [''],
      starts_at: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      image: [null]
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async onSubmit() {
    if (this.eventForm.invalid) return;
    this.uploading = true;
  
    try {
      let imageUrl: string | null = null;
  
      if (this.selectedFile) {
        // Subida a Cloudinary
        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('upload_preset', 'utnentradas'); // tu preset de Cloudinary
  
        const cloudRes: any = await this.http
          .post('https://api.cloudinary.com/v1_1/da80v8vj1/image/upload', formData)
          .toPromise();
  
        imageUrl = cloudRes.secure_url; // URL final de la imagen
      }
  
      // Preparar datos para el backend
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
      const body = {
        ...this.eventForm.value,
        image_path: imageUrl
      };
  
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
