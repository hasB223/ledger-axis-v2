import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { finalize } from 'rxjs';
import { AlertComponent } from '../../../shared/components/alert.component';
import { CardComponent } from '../../../shared/components/card.component';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { WatchlistEntry } from '../models/watchlist.model';
import { WatchlistService } from '../services/watchlist.service';

@Component({
  selector: 'ledger-axis-watchlist-page',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    CardComponent,
    AlertComponent,
    DataTableComponent,
    EmptyStateComponent,
    LoadingStateComponent
  ],
  template: `
    <section class="page-stack">
      <ledger-axis-page-header
        title="Watchlist"
        eyebrow="Monitoring"
        subtitle="Track companies that need follow-up attention."
      ></ledger-axis-page-header>

      <ledger-axis-alert *ngIf="errorMessage" tone="danger" [message]="errorMessage"></ledger-axis-alert>

      <ledger-axis-card title="Tracked companies" subtitle="Entries are scoped to your current user and tenant.">
        <ledger-axis-loading-state *ngIf="loading" message="Loading watchlist..."></ledger-axis-loading-state>

        <ledger-axis-empty-state
          *ngIf="!loading && !errorMessage && entries.length === 0"
          title="No watchlist entries yet"
          message="Add companies from the companies list or detail page to keep them close at hand."
        ></ledger-axis-empty-state>

        <ledger-axis-data-table *ngIf="!loading && entries.length > 0">
          <thead>
            <tr>
              <th>Company</th>
              <th>Note</th>
              <th>Added</th>
              <th class="app-table__actions">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of entries">
              <td>
                <div class="app-table__primary">{{ entry.companyName || ('Company #' + entry.companyId) }}</div>
                <div class="app-table__secondary">Company ID: {{ entry.companyId }}</div>
              </td>
              <td>{{ entry.note || 'No note' }}</td>
              <td>{{ entry.createdAt ? (entry.createdAt | date: 'mediumDate') : 'Recently added' }}</td>
              <td class="app-table__actions">
                <button
                  class="app-button app-button--ghost"
                  type="button"
                  (click)="remove(entry)"
                  [disabled]="pendingEntryId === entry.id"
                >
                  {{ pendingEntryId === entry.id ? 'Removing...' : 'Remove' }}
                </button>
              </td>
            </tr>
          </tbody>
        </ledger-axis-data-table>
      </ledger-axis-card>
    </section>
  `
})
export class WatchlistPageComponent {
  entries: WatchlistEntry[] = [];
  loading = true;
  errorMessage = '';
  pendingEntryId: string | number | null = null;

  constructor(private readonly watchlistService: WatchlistService) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  remove(entry: WatchlistEntry): void {
    this.pendingEntryId = entry.id;
    this.errorMessage = '';

    this.watchlistService
      .remove(entry.id)
      .pipe(finalize(() => (this.pendingEntryId = null)))
      .subscribe({
        next: () => {
          this.entries = this.entries.filter((current) => current.id !== entry.id);
        },
        error: (error: { message?: string }) => {
          this.errorMessage = error.message ?? 'Unable to update watchlist.';
        }
      });
  }

  private loadEntries(): void {
    this.loading = true;
    this.errorMessage = '';

    this.watchlistService
      .list()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (entries) => {
          this.entries = entries;
        },
        error: (error: { message?: string }) => {
          this.errorMessage = error.message ?? 'Unable to load watchlist.';
        }
      });
  }
}
