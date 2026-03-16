import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Observable, finalize } from 'rxjs';
import { AlertComponent } from '../../../shared/components/alert.component';
import { CardComponent } from '../../../shared/components/card.component';
import { DataTableComponent } from '../../../shared/components/data-table.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { WatchlistService } from '../../watchlist/services/watchlist.service';
import { WatchlistEntry } from '../../watchlist/models/watchlist.model';
import { Company } from '../models/companies.model';
import { CompaniesService } from '../services/companies.service';

@Component({
  selector: 'ledger-axis-companies-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    CardComponent,
    AlertComponent,
    DataTableComponent,
    LoadingStateComponent,
    EmptyStateComponent
  ],
  template: `
    <section class="page-stack">
      <ledger-axis-page-header
        title="Companies"
        eyebrow="Core workflow"
        subtitle="Search, review, and maintain tenant-visible companies."
        [actions]="[true]"
      >
        <a page-actions class="app-button" routerLink="/companies/new">Add company</a>
      </ledger-axis-page-header>

      <ledger-axis-card title="Filters" subtitle="Refine the company list using server-backed query options.">
        <form class="filters-grid" [formGroup]="filtersForm" (ngSubmit)="applyFilters()">
          <div class="app-field">
            <label class="app-label" for="q">Search</label>
            <input id="q" class="app-input" formControlName="q" placeholder="Name or registration no." />
          </div>

          <div class="app-field">
            <label class="app-label" for="industry">Industry</label>
            <input id="industry" class="app-input" formControlName="industry" placeholder="Technology" />
          </div>

          <div class="app-field">
            <label class="app-label" for="source">Source</label>
            <select id="source" class="app-input" formControlName="source">
              <option value="">All sources</option>
              <option value="manual">Manual</option>
              <option value="registry">Registry</option>
              <option value="ssm_feed">SSM feed</option>
            </select>
          </div>

          <div class="app-field">
            <label class="app-label" for="sortBy">Sort by</label>
            <select id="sortBy" class="app-input" formControlName="sortBy">
              <option value="updated_at">Updated</option>
              <option value="created_at">Created</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div class="app-field">
            <label class="app-label" for="sortOrder">Order</label>
            <select id="sortOrder" class="app-input" formControlName="sortOrder">
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div class="app-field">
            <label class="app-label" for="limit">Page size</label>
            <select id="limit" class="app-input" formControlName="limit">
              <option [ngValue]="10">10</option>
              <option [ngValue]="20">20</option>
              <option [ngValue]="50">50</option>
            </select>
          </div>

          <div class="filters-grid__actions">
            <button class="app-button" type="submit">Apply filters</button>
            <button class="app-button app-button--ghost" type="button" (click)="resetFilters()">Reset</button>
          </div>
        </form>
      </ledger-axis-card>

      <ledger-axis-alert *ngIf="errorMessage" tone="danger" [message]="errorMessage"></ledger-axis-alert>

      <ledger-axis-card title="Results" [subtitle]="resultsSummary">
        <ledger-axis-loading-state *ngIf="loading" message="Loading companies..."></ledger-axis-loading-state>

        <ledger-axis-empty-state
          *ngIf="!loading && !errorMessage && companies.length === 0"
          title="No companies found"
          message="Adjust the filters or create a company to start building the tenant dataset."
        >
          <a class="app-button" routerLink="/companies/new">Create company</a>
        </ledger-axis-empty-state>

        <ledger-axis-data-table *ngIf="!loading && companies.length > 0">
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Status</th>
              <th>Source</th>
              <th>Updated</th>
              <th class="app-table__actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let company of companies">
              <td>
                <div class="app-table__primary">
                  <a class="app-link" [routerLink]="['/companies', company.id]">{{ company.name }}</a>
                </div>
                <div class="app-table__secondary">Reg. no. {{ company.registrationNo }}</div>
              </td>
              <td>{{ company.industry || 'Unspecified' }}</td>
              <td><span class="app-badge" [class.app-badge--muted]="company.status !== 'active'">{{ company.status }}</span></td>
              <td>{{ company.source }}</td>
              <td>{{ company.updatedAt | date: 'mediumDate' }}</td>
              <td class="app-table__actions">
                <a class="app-button app-button--ghost" [routerLink]="['/companies', company.id]">Open</a>
                <button type="button" class="app-button app-button--ghost" (click)="toggleWatchlist(company)" [disabled]="pendingCompanyId === company.id">
                  {{ watchlistMap.has(company.id) ? 'Watching' : 'Watch' }}
                </button>
              </td>
            </tr>
          </tbody>
        </ledger-axis-data-table>

        <footer class="pagination-bar" *ngIf="!loading">
          <span>Page {{ page }}</span>
          <div class="pagination-bar__actions">
            <button class="app-button app-button--ghost" type="button" (click)="changePage(-1)" [disabled]="page === 1">Previous</button>
            <button class="app-button app-button--ghost" type="button" (click)="changePage(1)" [disabled]="companies.length < filtersForm.controls.limit.value">
              Next
            </button>
          </div>
        </footer>
      </ledger-axis-card>
    </section>
  `
})
export class CompaniesListComponent {
  readonly filtersForm = this.formBuilder.nonNullable.group({
    q: [''],
    industry: [''],
    source: [''],
    sortBy: this.formBuilder.nonNullable.control<'name' | 'created_at' | 'updated_at'>('updated_at'),
    sortOrder: this.formBuilder.nonNullable.control<'asc' | 'desc'>('desc'),
    limit: this.formBuilder.nonNullable.control(10)
  });

  companies: Company[] = [];
  watchlistMap = new Map<string | number, WatchlistEntry>();
  loading = true;
  errorMessage = '';
  pendingCompanyId: string | number | null = null;
  page = 1;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly companiesService: CompaniesService,
    private readonly watchlistService: WatchlistService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  get resultsSummary(): string {
    if (this.loading) {
      return 'Retrieving tenant-visible companies.';
    }

    return `${this.companies.length} result${this.companies.length === 1 ? '' : 's'} on the current page`;
  }

  applyFilters(): void {
    this.page = 1;
    this.loadCompanies();
  }

  resetFilters(): void {
    this.filtersForm.reset({
      q: '',
      industry: '',
      source: '',
      sortBy: 'updated_at',
      sortOrder: 'desc',
      limit: 10
    });
    this.page = 1;
    this.loadCompanies();
  }

  changePage(delta: number): void {
    const nextPage = this.page + delta;
    if (nextPage < 1) {
      return;
    }

    this.page = nextPage;
    this.loadCompanies();
  }

  toggleWatchlist(company: Company): void {
    this.errorMessage = '';
    this.pendingCompanyId = company.id;
    const existingEntry = this.watchlistMap.get(company.id);

    const request$: Observable<unknown> = existingEntry
      ? this.watchlistService.remove(existingEntry.id)
      : this.watchlistService.add(company.id);

    request$.pipe(finalize(() => (this.pendingCompanyId = null))).subscribe({
      next: (entry) => {
        if (existingEntry) {
          this.watchlistMap.delete(company.id);
        } else {
          this.watchlistMap.set(company.id, entry as WatchlistEntry);
        }
      },
      error: (error: { message?: string }) => {
        this.errorMessage = error.message ?? 'Unable to update watchlist.';
      }
    });
  }

  private loadCompanies(): void {
    this.loading = true;
    this.errorMessage = '';

    const query = this.filtersForm.getRawValue();

    this.companiesService
      .list({
        q: query.q || undefined,
        industry: query.industry || undefined,
        source: query.source || undefined,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        limit: query.limit,
        page: this.page
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (companies) => {
          this.companies = companies;
          this.watchlistService.list().subscribe({
            next: (entries) => {
              this.watchlistMap = new Map(entries.map((entry) => [entry.companyId, entry]));
            },
            error: () => {
              this.watchlistMap = new Map<string | number, WatchlistEntry>();
            }
          });
        },
        error: (error: { message?: string }) => {
          this.errorMessage = error.message ?? 'Unable to load companies.';
        }
      });
  }
}
