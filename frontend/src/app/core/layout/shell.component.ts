import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'ledger-axis-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <header class="shell__header">
        <h1>LedgerAxis</h1>
        <nav>
          <a routerLink="/companies" routerLinkActive="active">Companies</a>
          <a routerLink="/login" routerLinkActive="active">Login</a>
        </nav>
      </header>
      <main class="shell__main">
        <router-outlet />
      </main>
    </div>
  `
})
export class ShellComponent {
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.themeService.init();
  }
}
