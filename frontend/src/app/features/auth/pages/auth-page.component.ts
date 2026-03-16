import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertComponent } from '../../../shared/components/alert.component';
import { CardComponent } from '../../../shared/components/card.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'ledger-axis-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, AlertComponent],
  template: `
    <section class="auth-page">
      <ledger-axis-card title="Sign in" subtitle="Access the internal company review workspace.">
        <form class="app-form" [formGroup]="form" (ngSubmit)="submit()">
          <div class="app-field">
            <label class="app-label" for="email">Email</label>
            <input id="email" class="app-input" type="email" formControlName="email" autocomplete="email" />
            <p class="app-field__hint" *ngIf="form.controls.email.touched && form.controls.email.hasError('required')">Email is required.</p>
            <p class="app-field__hint" *ngIf="form.controls.email.touched && form.controls.email.hasError('email')">Enter a valid email.</p>
          </div>

          <div class="app-field">
            <label class="app-label" for="password">Password</label>
            <input id="password" class="app-input" type="password" formControlName="password" autocomplete="current-password" />
            <p class="app-field__hint" *ngIf="form.controls.password.touched && form.controls.password.hasError('required')">Password is required.</p>
            <p class="app-field__hint" *ngIf="form.controls.password.touched && form.controls.password.hasError('minlength')">
              Password must be at least 8 characters.
            </p>
          </div>

          <ledger-axis-alert *ngIf="errorMessage()" tone="danger" [message]="errorMessage()"></ledger-axis-alert>

          <div class="auth-page__actions">
            <button class="app-button" type="submit" [disabled]="submitting()">
              {{ submitting() ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>
      </ledger-axis-card>
    </section>
  `
})
export class AuthPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly submitting = signal(false);
  readonly errorMessage = signal('');
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/companies';
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: { message?: string }) => {
          this.errorMessage.set(error.message ?? 'Unable to sign in.');
        }
      });
  }
}
