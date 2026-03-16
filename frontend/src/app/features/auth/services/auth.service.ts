import { Injectable, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { HttpClientService } from '../../../core/api/http-client.service';
import { AuthApiResponse, AuthSession, LoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'ledgeraxis.session';
  readonly session = signal<AuthSession | null>(this.readSession());

  constructor(private readonly httpClient: HttpClientService) {}

  login(credentials: LoginRequest): Observable<AuthSession> {
    return this.httpClient.post<LoginRequest, AuthApiResponse>('/api/auth/login', credentials).pipe(
      map((response) => ({
        accessToken: response.token,
        tenantId: response.user.tenantId,
        user: {
          id: String(response.user.id),
          email: response.user.email,
          name: response.user.fullName,
          role: response.user.role
        }
      })),
      tap((session) => {
        this.session.set(session);
        localStorage.setItem(this.storageKey, JSON.stringify(session));
      })
    );
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return this.session() !== null;
  }

  accessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  tenantId(): string | null {
    const tenantId = this.session()?.tenantId;
    return tenantId == null ? null : String(tenantId);
  }

  private readSession(): AuthSession | null {
    const raw = localStorage.getItem(this.storageKey);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
