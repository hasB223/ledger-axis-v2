import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'ledger-axis-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-shell">
      <table class="app-table">
        <ng-content />
      </table>
    </div>
  `
})
export class DataTableComponent {}
