import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter, UrlTree } from '@angular/router';
import { authGuard } from '../src/app/core/guards/auth.guard';
import { AuthService } from '../src/app/features/auth/services/auth.service';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: DummyComponent }]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: jest.fn()
          }
        }
      ]
    });
  });

  it('allows navigation for authenticated users', () => {
    const authService = TestBed.inject(AuthService) as unknown as { isAuthenticated: jest.Mock };
    authService.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/companies' } as never));

    expect(result).toBe(true);
  });

  it('redirects unauthenticated users to login with a returnUrl', () => {
    const authService = TestBed.inject(AuthService) as unknown as { isAuthenticated: jest.Mock };
    const router = TestBed.inject(Router);
    authService.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, { url: '/companies/123' } as never));

    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Fcompanies%2F123');
  });
});
