import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  sendVerification(email: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/send-verification`, { email }, { headers });
  }

  // NUEVO: solicitar rol de admin
  requestAdmin(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/request-admin`, {}, { headers });
  }

  // NUEVO: verificar email desde token
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email/${token}`);
  }
}
