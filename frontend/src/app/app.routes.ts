import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { Login } from './auth/login/login';
import { Home } from './pages/home/home';
import { CreateEvent } from './pages/create-event/create-event';   

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'create-event', component: CreateEvent },
  { path: 'home', component: Home},
];
