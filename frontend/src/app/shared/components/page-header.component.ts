import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ledger-axis-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <div>
        <p class="page-header__eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
        <h1 class="page-header__title">{{ title }}</h1>
        <p class="page-header__subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-header__actions" *ngIf="actions?.length">
        <ng-content select="[page-actions]" />
      </div>
    </header>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
  @Input() eyebrow = '';
  @Input() actions: unknown[] | null = null;
}
