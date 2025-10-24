import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { Login } from './auth/login/login';
import { Home } from './pages/home/home';
import { CreateEvent } from './pages/create-event/create-event';   
import { AdminGuard } from './guards/admin-guard';
import { EventDetail } from './pages/event-detail/event-detail';
import { Checkout } from './pages/checkout/checkout';
import { TicketScanner } from './pages/ticket-scanner/ticket-scanner';
import { MyTickets } from './pages/my-tickets/my-tickets';
import { VerifyAccount} from './pages/verify-account/verify-account';
import { Verified } from './pages/verified/verified'; 
import { UserStats } from './pages/user-stats/user-stats';
export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login },
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'home', component: Home},
  { path: 'create-event', component: CreateEvent, canActivate: [AdminGuard] },
  { path: 'event/:id', component: EventDetail },
  { path: 'checkout/:id',component: Checkout },
  { path: 'validate-tickets', component: TicketScanner },
  { path: 'my-tickets', component: MyTickets },
  { path: 'verify-account', component: VerifyAccount },
  { path: 'verified', component: Verified },
  { path: 'my-events', component: UserStats }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}