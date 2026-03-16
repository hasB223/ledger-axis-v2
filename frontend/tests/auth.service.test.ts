import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../src/app/features/auth/services/auth.service';
import { HttpClientService } from '../src/app/core/api/http-client.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HttpClientService, AuthService]
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('stores the authenticated session after login', () => {
    let accessToken: string | null = null;

    service.login({ email: 'user@example.com', password: 'password123' }).subscribe((session) => {
      accessToken = session.accessToken;
    });

    const request = httpTestingController.expectOne('/api/auth/login');
    request.flush({
      success: true,
      data: {
        token: 'token-1',
        user: { id: 'user-1', tenantId: 'tenant-1', email: 'user@example.com', fullName: 'User One', role: 'admin' }
      }
    });

    expect(accessToken).toBe('token-1');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.accessToken()).toBe('token-1');
    expect(JSON.parse(localStorage.getItem('ledgeraxis.session') ?? '{}')).toMatchObject({
      tenantId: 'tenant-1'
    });
  });

  it('clears invalid stored sessions during construction', () => {
    localStorage.setItem('ledgeraxis.session', '{bad json');
    const rebuilt = new AuthService(TestBed.inject(HttpClientService));

    expect(rebuilt.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('ledgeraxis.session')).toBeNull();
  });

  it('removes the session on logout', () => {
    localStorage.setItem(
      'ledgeraxis.session',
      JSON.stringify({
        accessToken: 'token-1',
        tenantId: 'tenant-1',
        user: { id: 'user-1', email: 'user@example.com', name: 'User One', role: 'admin' }
      })
    );
    const rebuilt = new AuthService(TestBed.inject(HttpClientService));

    rebuilt.logout();

    expect(rebuilt.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('ledgeraxis.session')).toBeNull();
  });
});
