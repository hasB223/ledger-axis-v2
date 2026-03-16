import { Component, Input } from '@angular/core';

@Component({
  selector: 'ledger-axis-loading-state',
  standalone: true,
  template: `
    <div class="app-state app-state--loading">
      <div class="app-spinner" aria-hidden="true"></div>
      <p>{{ message }}</p>
    </div>
  `
})
export class LoadingStateComponent {
  @Input() message = 'Loading...';
}
