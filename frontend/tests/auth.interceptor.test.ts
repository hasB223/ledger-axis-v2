import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { authInterceptor } from '../src/app/core/interceptors/auth.interceptor';
import { AuthService } from '../src/app/features/auth/services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let authService: { accessToken: jest.Mock; tenantId: jest.Mock };

  beforeEach(() => {
    authService = {
      accessToken: jest.fn(),
      tenantId: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('adds auth and tenant headers when a session exists', () => {
    authService.accessToken.mockReturnValue('token-1');
    authService.tenantId.mockReturnValue('tenant-1');

    http.get('/api/companies').subscribe();

    const request = httpTestingController.expectOne('/api/companies');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-1');
    expect(request.request.headers.get('X-Tenant-Id')).toBe('tenant-1');
    request.flush([]);
  });

  it('passes requests through untouched when there is no session', () => {
    authService.accessToken.mockReturnValue(null);

    http.get('/api/companies').subscribe();

    const request = httpTestingController.expectOne('/api/companies');
    expect(request.request.headers.has('Authorization')).toBe(false);
    expect(request.request.headers.has('X-Tenant-Id')).toBe(false);
    request.flush([]);
  });
});
