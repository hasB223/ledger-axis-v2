import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'ledger-axis-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="app-shell__header">
        <div class="app-shell__brand">
          <div class="app-shell__logo">LA</div>
          <div>
            <p class="app-shell__eyebrow">Internal due diligence</p>
            <h1>LedgerAxis</h1>
          </div>
        </div>

        <nav class="app-shell__nav" aria-label="Primary">
          <a routerLink="/companies" routerLinkActive="active">Companies</a>
          <a routerLink="/watchlist" routerLinkActive="active">Watchlist</a>
          <span class="app-shell__nav-placeholder" aria-disabled="true">Analytics soon</span>
        </nav>

        <div class="app-shell__session">
          <div *ngIf="sessionSummary(); else loggedOut">
            <p class="app-shell__session-label">Signed in</p>
            <strong>{{ sessionSummary()?.name }}</strong>
            <span>{{ sessionSummary()?.email }}</span>
          </div>
          <ng-template #loggedOut>
            <div>
              <p class="app-shell__session-label">Session</p>
              <strong>Guest</strong>
              <span>Sign in to continue</span>
            </div>
          </ng-template>

          <a *ngIf="!authService.isAuthenticated()" class="app-button app-button--ghost" routerLink="/login">Sign in</a>
          <button *ngIf="authService.isAuthenticated()" type="button" class="app-button app-button--ghost" (click)="logout()">
            Logout
          </button>
        </div>
      </header>

      <main class="app-shell__main">
        <div class="app-shell__container">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class ShellComponent {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly sessionSummary = computed(() => {
    const session = this.authService.session();
    if (!session) {
      return null;
    }

    return {
      name: session.user.name,
      email: session.user.email
    };
  });

  constructor() {
    this.themeService.init();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}
