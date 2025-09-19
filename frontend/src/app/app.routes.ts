import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { Login } from './auth/login/login';
import { Home } from './pages/home/home';
import { CreateEvent } from './pages/create-event/create-event';   
import { AdminGuard } from './guards/admin-guard';
import { EventDetail } from './pages/event-detail/event-detail';


export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'home', component: Home},
  { path: 'create-event', component: CreateEvent, canActivate: [AdminGuard] },
  { path: 'event/:id', component: EventDetail },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}