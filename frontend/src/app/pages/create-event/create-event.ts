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
    }
  }

  onSubmit() {
    if (this.eventForm.invalid) return;

    const formData = new FormData();
    Object.entries(this.eventForm.value).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value as any);
    });
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post('http://localhost:8000/api/events', formData, { headers }).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
      this.errorMessage = err.error?.message || 'Error al crear evento';
      }
    });
  }
}
