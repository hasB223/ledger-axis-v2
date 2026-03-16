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

  add(companyId: string | number, note?: string): Observable<WatchlistEntry> {
    return this.httpClient.post<{ companyId: string | number; note?: string }, WatchlistEntry>('/api/watchlist', { companyId, note });
  }

  remove(entryId: string | number): Observable<void> {
    return this.httpClient.delete<void>(`/api/watchlist/${entryId}`);
  }
}
