import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ledger-axis-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="app-card" [class.app-card--padded]="padded">
      <header class="app-card__header" *ngIf="title || subtitle">
        <div>
          <h2 class="app-card__title" *ngIf="title">{{ title }}</h2>
          <p class="app-card__subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <div class="app-card__actions">
          <ng-content select="[card-actions]" />
        </div>
      </header>
      <div class="app-card__body">
        <ng-content />
      </div>
    </section>
  `
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() padded = true;
}
