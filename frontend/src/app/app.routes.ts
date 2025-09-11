import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { Login } from './auth/login/login';
import { Home } from './auth/home/home';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'home', component: Home},
];
