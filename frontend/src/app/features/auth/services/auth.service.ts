import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClientService } from '../../../core/api/http-client.service';
import { AuthSession, LoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'ledgeraxis.session';
  readonly session = signal<AuthSession | null>(this.readSession());

  constructor(private readonly httpClient: HttpClientService) {}

  login(credentials: LoginRequest): Observable<AuthSession> {
    return this.httpClient.post<LoginRequest, AuthSession>('/api/auth/login', credentials).pipe(
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
    return this.session()?.tenantId ?? null;
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
