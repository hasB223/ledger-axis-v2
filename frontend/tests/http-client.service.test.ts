import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClientService } from '../src/app/core/api/http-client.service';

describe('HttpClientService', () => {
  let service: HttpClientService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), HttpClientService]
    });

    service = TestBed.inject(HttpClientService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('passes query params and returns typed data', () => {
    let response: { total: number } | undefined;

    service.get<{ total: number }>('/api/companies', { page: 2, active: true }).subscribe((value) => {
      response = value;
    });

    const request = httpTestingController.expectOne('/api/companies?page=2&active=true');
    expect(request.request.method).toBe('GET');
    request.flush({ total: 3 });

    expect(response).toEqual({ total: 3 });
  });

  it('maps backend errors into ApiError objects', () => {
    let receivedError: { status: number; message: string } | undefined;

    service.post('/api/auth/login', { email: 'user@example.com' }).subscribe({
      error: (error) => {
        receivedError = error;
      }
    });

    const request = httpTestingController.expectOne('/api/auth/login');
    request.flush({ message: 'Rejected' }, { status: 401, statusText: 'Unauthorized' });

    expect(receivedError).toEqual({ status: 401, message: 'Rejected' });
  });
});
