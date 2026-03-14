import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { WatchlistService } from '../../watchlist/services/watchlist.service';
import { Company, CompanyPayload } from '../models/companies.model';
import { CompaniesService } from '../services/companies.service';

@Component({
  selector: 'ledger-axis-company-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section>
      <h2>{{ companyId ? 'Company detail' : 'Create company' }}</h2>

      <p *ngIf="loading">Loading company...</p>
      <p *ngIf="errorMessage">{{ errorMessage }}</p>

      <form [formGroup]="form" (ngSubmit)="save()" *ngIf="!loading">
        <label>
          Name
          <input formControlName="name" />
        </label>
        <p *ngIf="form.controls.name.touched && form.controls.name.hasError('required')">Name is required.</p>

        <label>
          Country
          <input formControlName="country" />
        </label>
        <p *ngIf="form.controls.country.touched && form.controls.country.hasError('required')">Country is required.</p>

        <label>
          Status
          <select formControlName="status">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        <label>
          Description
          <textarea formControlName="description"></textarea>
        </label>
        <p *ngIf="form.controls.description.touched && form.controls.description.hasError('minlength')">
          Description must be at least 10 characters.
        </p>

        <button type="submit" [disabled]="saving">{{ saving ? 'Saving...' : 'Save company' }}</button>
      </form>

      <button *ngIf="companyId" type="button" (click)="toggleWatchlist()" [disabled]="watchlistPending">
        {{ isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist' }}
      </button>

      <p *ngIf="saveMessage">{{ saveMessage }}</p>
    </section>
  `
})
export class CompanyDetailComponent {
  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    country: ['', Validators.required],
    status: this.formBuilder.nonNullable.control<'active' | 'inactive'>('active', Validators.required),
    description: ['', Validators.minLength(10)]
  });

  companyId = this.route.snapshot.paramMap.get('id');
  loading = !!this.companyId;
  saving = false;
  watchlistPending = false;
  isInWatchlist = false;
  errorMessage = '';
  saveMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly companiesService: CompaniesService,
    private readonly watchlistService: WatchlistService
  ) {}

  ngOnInit(): void {
    if (!this.companyId) {
      return;
    }

    this.companiesService
      .getById(this.companyId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (company) => this.patchForm(company),
        error: (error: { message?: string }) => {
          this.errorMessage = error.message ?? 'Unable to load company.';
        }
      });

    this.watchlistService.list().subscribe({
      next: (entries) => {
        this.isInWatchlist = entries.some((entry) => entry.companyId === this.companyId);
      }
    });
  }

  save(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.saving) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.saveMessage = '';

    const payload = this.form.getRawValue() as CompanyPayload;
    const request$ = this.companyId
      ? this.companiesService.update(this.companyId, payload)
      : this.companiesService.create(payload);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: (company) => {
        this.companyId = company.id;
        this.saveMessage = 'Company saved.';
      },
      error: (error: { message?: string }) => {
        this.errorMessage = error.message ?? 'Unable to save company.';
      }
    });
  }

  toggleWatchlist(): void {
    if (!this.companyId || this.watchlistPending) {
      return;
    }

    this.watchlistPending = true;
    this.errorMessage = '';

    const request$: Observable<unknown> = this.isInWatchlist
      ? this.watchlistService.remove(this.companyId)
      : this.watchlistService.add(this.companyId);

    request$.pipe(finalize(() => (this.watchlistPending = false))).subscribe({
      next: () => {
        this.isInWatchlist = !this.isInWatchlist;
      },
      error: (error: { message?: string }) => {
        this.errorMessage = error.message ?? 'Unable to update watchlist.';
      }
    });
  }

  private patchForm(company: Company): void {
    this.form.setValue({
      name: company.name,
      country: company.country,
      status: company.status,
      description: company.description
    });
  }
}
