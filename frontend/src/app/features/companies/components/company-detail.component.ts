import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { AlertComponent } from '../../../shared/components/alert.component';
import { CardComponent } from '../../../shared/components/card.component';
import { LoadingStateComponent } from '../../../shared/components/loading-state.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { WatchlistService } from '../../watchlist/services/watchlist.service';
import { WatchlistEntry } from '../../watchlist/models/watchlist.model';
import { Company, CompanyPayload } from '../models/companies.model';
import { CompaniesService } from '../services/companies.service';

@Component({
  selector: 'ledger-axis-company-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, CardComponent, AlertComponent, LoadingStateComponent],
  template: `
    <section class="page-stack">
      <ledger-axis-page-header
        [title]="companyId ? form.controls.name.value || 'Company detail' : 'Create company'"
        eyebrow="Company workspace"
        [subtitle]="companyId ? 'Review metadata, watch status, and update core records.' : 'Create a tenant-visible company record.'"
      ></ledger-axis-page-header>

      <ledger-axis-alert *ngIf="errorMessage" tone="danger" [message]="errorMessage"></ledger-axis-alert>
      <ledger-axis-alert *ngIf="saveMessage" tone="success" [message]="saveMessage"></ledger-axis-alert>

      <ledger-axis-loading-state *ngIf="loading" message="Loading company..."></ledger-axis-loading-state>

      <div class="detail-grid" *ngIf="!loading">
        <ledger-axis-card title="Company details" subtitle="Core metadata used across review workflows.">
          <form class="app-form" [formGroup]="form" (ngSubmit)="save()">
            <div class="detail-grid__two-col">
              <div class="app-field">
                <label class="app-label" for="registrationNo">Registration no.</label>
                <input id="registrationNo" class="app-input" formControlName="registrationNo" />
                <p class="app-field__hint" *ngIf="form.controls.registrationNo.touched && form.controls.registrationNo.hasError('required')">
                  Registration number is required.
                </p>
              </div>

              <div class="app-field">
                <label class="app-label" for="name">Company name</label>
                <input id="name" class="app-input" formControlName="name" />
                <p class="app-field__hint" *ngIf="form.controls.name.touched && form.controls.name.hasError('required')">Name is required.</p>
              </div>
            </div>

            <div class="detail-grid__two-col">
              <div class="app-field">
                <label class="app-label" for="industry">Industry</label>
                <input id="industry" class="app-input" formControlName="industry" />
              </div>

              <div class="app-field">
                <label class="app-label" for="source">Source</label>
                <select id="source" class="app-input" formControlName="source">
                  <option value="manual">Manual</option>
                  <option value="registry">Registry</option>
                  <option value="ssm_feed">SSM feed</option>
                </select>
              </div>
            </div>

            <div class="detail-grid__two-col">
              <div class="app-field">
                <label class="app-label" for="status">Status</label>
                <select id="status" class="app-input" formControlName="status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div class="app-field">
                <label class="app-label" for="annualRevenue">Annual revenue</label>
                <input id="annualRevenue" class="app-input" type="number" min="0" step="0.01" formControlName="annualRevenue" />
              </div>
            </div>

            <div class="detail-actions">
              <button class="app-button" type="submit" [disabled]="saving">{{ saving ? 'Saving...' : companyId ? 'Update company' : 'Create company' }}</button>
            </div>
          </form>
        </ledger-axis-card>

        <div class="page-stack">
          <ledger-axis-card title="Record summary" subtitle="This section prepares the screen for future directors and audit views.">
            <dl class="meta-list">
              <div>
                <dt>Registration</dt>
                <dd>{{ form.controls.registrationNo.value || 'Not set' }}</dd>
              </div>
              <div>
                <dt>Industry</dt>
                <dd>{{ form.controls.industry.value || 'Unspecified' }}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>{{ form.controls.source.value || 'Manual' }}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{{ form.controls.status.value }}</dd>
              </div>
            </dl>

            <div class="detail-actions" *ngIf="companyId">
              <button class="app-button app-button--ghost" type="button" (click)="toggleWatchlist()" [disabled]="watchlistPending">
                {{ watchlistPending ? 'Updating watchlist...' : isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist' }}
              </button>
            </div>
          </ledger-axis-card>

          <ledger-axis-card title="Upcoming sections" subtitle="Reserved for the next product milestone.">
            <div class="stacked-note">
              <strong>Directors and affiliations</strong>
              <p>Future work will surface linked directors and relationship context here.</p>
            </div>
            <div class="stacked-note">
              <strong>Audit history</strong>
              <p>Change history and evidence trails will be introduced as a dedicated section.</p>
            </div>
          </ledger-axis-card>
        </div>
      </div>
    </section>
  `
})
export class CompanyDetailComponent {
  readonly form = this.formBuilder.nonNullable.group({
    registrationNo: ['', Validators.required],
    name: ['', Validators.required],
    industry: [''],
    source: ['manual', Validators.required],
    status: this.formBuilder.nonNullable.control<'active' | 'inactive'>('active', Validators.required),
    annualRevenue: this.formBuilder.control<number | null>(null)
  });

  companyId = this.route.snapshot.paramMap.get('id');
  loading = !!this.companyId;
  saving = false;
  watchlistPending = false;
  isInWatchlist = false;
  watchlistEntryId: string | number | null = null;
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
        const entry = entries.find((current) => String(current.companyId) === this.companyId);
        this.isInWatchlist = !!entry;
        this.watchlistEntryId = entry?.id ?? null;
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
      ? this.companiesService.update(this.companyId, {
          name: payload.name,
          industry: payload.industry || null,
          source: payload.source,
          status: payload.status,
          annualRevenue: payload.annualRevenue
        })
      : this.companiesService.create(payload);

    request$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: (company) => {
        this.companyId = String(company.id);
        this.patchForm(company);
        this.saveMessage = this.route.snapshot.paramMap.get('id') ? 'Company updated successfully.' : 'Company created successfully.';
      },
      error: (error: { message?: string }) => {
        this.errorMessage = error.message ?? 'Unable to save company.';
      }
    });
  }

  toggleWatchlist(): void {
    if (!this.companyId || this.watchlistPending || (!this.isInWatchlist && !this.companyId)) {
      return;
    }

    this.watchlistPending = true;
    this.errorMessage = '';

    const request$: Observable<unknown> = this.isInWatchlist
      ? this.watchlistService.remove(this.watchlistEntryId as string | number)
      : this.watchlistService.add(this.companyId);

    request$.pipe(finalize(() => (this.watchlistPending = false))).subscribe({
      next: (entry) => {
        this.isInWatchlist = !this.isInWatchlist;
        this.watchlistEntryId = this.isInWatchlist ? (entry as WatchlistEntry).id : null;
      },
      error: (error: { message?: string }) => {
        this.errorMessage = error.message ?? 'Unable to update watchlist.';
      }
    });
  }

  private patchForm(company: Company): void {
    this.form.setValue({
      registrationNo: company.registrationNo,
      name: company.name,
      industry: company.industry ?? '',
      source: company.source,
      status: company.status,
      annualRevenue: company.annualRevenue
    });
  }
}
