import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { AuthPageComponent } from '../src/app/features/auth/pages/auth-page.component';
import { AuthService } from '../src/app/features/auth/services/auth.service';

describe('AuthPageComponent', () => {
  let fixture: ComponentFixture<AuthPageComponent>;
  let authService: { login: jest.Mock };
  let router: { navigateByUrl: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn() };
    router = { navigateByUrl: jest.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [AuthPageComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({ returnUrl: '/companies/99' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthPageComponent);
    fixture.detectChanges();
  });

  it('shows validation messages and blocks submit for invalid input', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Email is required.');
    expect(fixture.nativeElement.textContent).toContain('Password is required.');
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('submits valid credentials and navigates to the return url', () => {
    const response$ = new Subject<unknown>();
    authService.login.mockReturnValue(response$);

    fixture.componentInstance.form.setValue({
      email: 'user@example.com',
      password: 'password123'
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Signing in...');

    response$.next({});
    response$.complete();
    fixture.detectChanges();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/companies/99');
  });

  it('renders an auth error when login fails', () => {
    authService.login.mockReturnValue(throwError(() => ({ message: 'Invalid email or password.' })));

    fixture.componentInstance.form.setValue({
      email: 'user@example.com',
      password: 'password123'
    });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Invalid email or password.');
  });
});
