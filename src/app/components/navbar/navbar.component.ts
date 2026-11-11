import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-light bg-white border-bottom px-3 px-md-4 mb-4 gap-2">
      <a routerLink="/dashboard" class="navbar-brand fw-bold text-warning-emphasis">💶 El meu pressupost</a>

      <div class="d-flex gap-2 flex-wrap">
        <a routerLink="/dashboard" routerLinkActive="active" class="btn btn-outline-secondary btn-sm">Dashboard</a>
        <a routerLink="/historial" routerLinkActive="active" class="btn btn-outline-secondary btn-sm">Historial</a>
        <a routerLink="/analisi" routerLinkActive="active" class="btn btn-outline-secondary btn-sm">Anàlisi</a>
      </div>

      <div class="ms-auto d-flex align-items-center gap-3">
        @if (auth.getUser(); as user) {
          <span class="text-muted small d-none d-sm-inline">Hola, {{ user.name }}</span>
        }
        <button class="btn btn-outline-secondary btn-sm" (click)="auth.logout()">Tancar sessió</button>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
}
