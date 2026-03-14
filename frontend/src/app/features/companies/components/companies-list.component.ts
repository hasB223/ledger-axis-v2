import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { WatchlistService } from '../../watchlist/services/watchlist.service';
import { Company } from '../models/companies.model';
import { CompaniesService } from '../services/companies.service';

@Component({
  selector: 'ledger-axis-companies-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section>
      <header>
        <h2>Companies</h2>
        <a routerLink="/companies/new">Add company</a>
      </header>

      <p *ngIf="loading">Loading companies...</p>
      <p *ngIf="errorMessage">{{ errorMessage }}</p>
      <p *ngIf="!loading && !errorMessage && companies.length === 0">No companies found.</p>

      <ul *ngIf="!loading && companies.length > 0">
        <li *ngFor="let company of companies">
          <a [routerLink]="['/companies', company.id]">{{ company.name }}</a>
          <span>{{ company.country }}</span>
          <button type="button" (click)="toggleWatchlist(company)" [disabled]="pendingCompanyId === company.id">
            {{ watchlistIds.has(company.id) ? 'Remove from watchlist' : 'Add to watchlist' }}
          </button>
        </li>
      </ul>
    </section>
  `
})
export class CompaniesListComponent {
  companies: Company[] = [];
  watchlistIds = new Set<string>();
  loading = true;
  errorMessage = '';
  pendingCompanyId: string | null = null;

  constructor(
    private readonly companiesService: CompaniesService,
    private readonly watchlistService: WatchlistService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  toggleWatchlist(company: Company): void {
    this.errorMessage = '';
    this.pendingCompanyId = company.id;

    const request$: Observable<unknown> = this.watchlistIds.has(company.id)
      ? this.watchlistService.remove(company.id)
      : this.watchlistService.add(company.id);

    request$.pipe(finalize(() => (this.pendingCompanyId = null))).subscribe({
      next: () => {
        if (this.watchlistIds.has(company.id)) {
          this.watchlistIds.delete(company.id);
        } else {
          this.watchlistIds.add(company.id);
        }
      },
      error: (error: { message?: string }) => {
        this.errorMessage = error.message ?? 'Unable to update watchlist.';
      }
    });
  }

  private loadCompanies(): void {
    this.loading = true;

    this.companiesService
      .list()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (companies) => {
          this.companies = companies;
          this.watchlistService.list().subscribe({
            next: (entries) => {
              this.watchlistIds = new Set(entries.map((entry) => entry.companyId));
            },
            error: () => {
              this.watchlistIds = new Set<string>();
            }
          });
        },
        error: (error: { message?: string }) => {
          this.errorMessage = error.message ?? 'Unable to load companies.';
        }
      });
  }
}
