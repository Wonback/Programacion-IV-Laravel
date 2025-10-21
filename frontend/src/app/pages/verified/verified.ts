import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verified',
  template: `
    <div class="verified">
      <h1>✅ Cuenta verificada con éxito</h1>
      <p>Redirigiendo al inicio...</p>
    </div>
  `,
  styles: [`
    .verified { text-align: center; margin-top: 50px; }
  `]
})
export class Verified implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    setTimeout(() => this.router.navigate(['/home']), 3000);
  }
}
