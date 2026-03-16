import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ShellComponent } from '../src/app/core/layout/shell.component';
import { AuthService } from '../src/app/features/auth/services/auth.service';
import { ThemeService } from '../src/app/core/services/theme.service';

describe('ShellComponent', () => {
  let fixture: ComponentFixture<ShellComponent>;
  let authService: { isAuthenticated: jest.Mock; logout: jest.Mock; session: ReturnType<typeof signal> };

  beforeEach(async () => {
    authService = {
      isAuthenticated: jest.fn().mockReturnValue(true),
      logout: jest.fn(),
      session: signal({
        accessToken: 'token-1',
        tenantId: 'tenant-1',
        user: { id: 'u1', email: 'admin.alpha@ledgeraxis.local', name: 'Alpha Admin', role: 'admin' }
      })
    };

    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ThemeService, useValue: { init: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
  });

  it('renders primary navigation and session details', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Companies');
    expect(text).toContain('Watchlist');
    expect(text).toContain('Analytics soon');
    expect(text).toContain('Alpha Admin');
  });

  it('logs out from the shell action', () => {
    const button = Array.from(fixture.nativeElement.querySelectorAll('button'))
      .map((item) => item as HTMLButtonElement)
      .find((item) => item.textContent?.includes('Logout')) as HTMLButtonElement;

    button.click();

    expect(authService.logout).toHaveBeenCalled();
  });
});
