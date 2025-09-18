import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

interface Event {
  id: number;
  title: string;
  description?: string;
  starts_at: string;
  capacity: number;
  price: number;
  image_path?: string;
}
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filePreview' })
export class FilePreviewPipe implements PipeTransform {
  transform(file: File): string {
    return file ? URL.createObjectURL(file) : '';
  }
}

@Component({
  selector: 'app-admin-event-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, FilePreviewPipe],
  templateUrl: './admin-edit.html',
})
export class AdminEventEdit implements OnInit {
  event?: Event;
  eventForm!: FormGroup;
  imageFile?: File;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    if (id) {
      this.http.get<Event>(`http://localhost:8000/api/events/${id}`, { headers })
        .subscribe({
          next: (res) => {
            this.event = res;
            this.initForm();
          },
          error: (err) => console.error('Error al obtener evento:', err)
        });
    }
  }

  initForm(): void {
    this.eventForm = this.fb.group({
      title: [this.event?.title, [Validators.required, Validators.maxLength(180)]],
      description: [this.event?.description],
      starts_at: [this.event?.starts_at, Validators.required],
      capacity: [this.event?.capacity, [Validators.required, Validators.min(0)]],
      price: [this.event?.price, [Validators.required, Validators.min(0)]],
      image: [null]
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) this.imageFile = file;
  }

  submit(): void {
    if (!this.eventForm.valid || !this.event) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const formData = new FormData();
    Object.keys(this.eventForm.value).forEach(key => {
      if (key !== 'image') formData.append(key, this.eventForm.value[key]);
    });
    if (this.imageFile) formData.append('image', this.imageFile);

    this.http.post<Event>(`http://localhost:8000/api/events/${this.event.id}`, formData, { headers })
      .subscribe({
        next: () => this.router.navigate(['/admin/event', this.event!.id]),
        error: (err) => console.error('Error al actualizar evento:', err)
      });
  }
}
