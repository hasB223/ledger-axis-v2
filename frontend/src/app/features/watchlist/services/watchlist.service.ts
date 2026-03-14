import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../core/api/http-client.service';
import { WatchlistEntry } from '../models/watchlist.model';

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  constructor(private readonly httpClient: HttpClientService) {}

  list(): Observable<WatchlistEntry[]> {
    return this.httpClient.get<WatchlistEntry[]>('/api/watchlist');
  }

  add(companyId: string): Observable<WatchlistEntry> {
    return this.httpClient.post<{ companyId: string }, WatchlistEntry>('/api/watchlist', { companyId });
  }

  remove(companyId: string): Observable<void> {
    return this.httpClient.delete<void>(`/api/watchlist/${companyId}`);
  }
}
