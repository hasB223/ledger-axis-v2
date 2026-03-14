import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'ledger-axis-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="auth">
      <h2>Sign in</h2>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Email
          <input type="email" formControlName="email" />
        </label>
        <p *ngIf="form.controls.email.touched && form.controls.email.hasError('required')">Email is required.</p>
        <p *ngIf="form.controls.email.touched && form.controls.email.hasError('email')">Enter a valid email.</p>

        <label>
          Password
          <input type="password" formControlName="password" />
        </label>
        <p *ngIf="form.controls.password.touched && form.controls.password.hasError('required')">Password is required.</p>
        <p *ngIf="form.controls.password.touched && form.controls.password.hasError('minlength')">
          Password must be at least 8 characters.
        </p>

        <p *ngIf="errorMessage()">{{ errorMessage() }}</p>

        <button type="submit" [disabled]="submitting()">
          {{ submitting() ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
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
