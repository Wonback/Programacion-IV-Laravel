import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  email_notifications: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface ProfileResponse {
  message: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = 'http://localhost:8000/api';
  private readonly authUrl = `${this.baseUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(data: { name: string; email: string; password: string }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.authUrl}/register`, data).pipe(
      tap((res: RegisterResponse) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.user.id.toString());
        localStorage.setItem('role', res.user.role);
        localStorage.setItem('email', res.user.email);
      })
    );
  }

  login(data: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, data).pipe(
      tap((res: LoginResponse) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.user.id.toString());
        localStorage.setItem('role', res.user.role);
        localStorage.setItem('email', res.user.email);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
  }

  getUser(): Observable<User> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<User>(`${this.authUrl}/me`, { headers });
  }

  updateProfile(data: FormData | Partial<User> & {
    current_password?: string;
    password?: string;
    password_confirmation?: string;
    remove_avatar?: boolean;
  }): Observable<ProfileResponse> {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const body = data instanceof FormData ? data : JSON.stringify(data);
    if (!(data instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return this.http.request<ProfileResponse>('PATCH', `${this.authUrl}/profile`, {
      body,
      headers,
    }).pipe(
      tap((res) => {
        if (res?.user) {
          localStorage.setItem('role', res.user.role);
          localStorage.setItem('email', res.user.email);
        }
      })
    );
  }
}
