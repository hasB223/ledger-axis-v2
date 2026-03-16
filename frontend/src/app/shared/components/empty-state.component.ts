import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ledger-axis-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-state app-state--empty">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div *ngIf="actionLabel" class="app-state__actions">
        <ng-content />
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input() actionLabel = '';
}
