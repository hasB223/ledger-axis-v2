import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ledger-axis-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-alert" [class.app-alert--danger]="tone === 'danger'" [class.app-alert--success]="tone === 'success'">
      <strong *ngIf="title">{{ title }}</strong>
      <span>{{ message }}</span>
    </div>
  `
})
export class AlertComponent {
  @Input() tone: 'info' | 'success' | 'danger' = 'info';
  @Input() title = '';
  @Input({ required: true }) message = '';
}
