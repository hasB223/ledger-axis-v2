import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'ledgeraxis.theme';

  init(): Theme {
    const storedTheme = this.getStoredTheme();
    const resolvedTheme = storedTheme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.applyTheme(resolvedTheme);
    return resolvedTheme;
  }

  applyTheme(theme: Theme): void {
    this.document.body.dataset.theme = theme;
    localStorage.setItem(this.storageKey, theme);
  }

  getStoredTheme(): Theme | null {
    const value = localStorage.getItem(this.storageKey);
    return value === 'light' || value === 'dark' ? value : null;
  }
}
