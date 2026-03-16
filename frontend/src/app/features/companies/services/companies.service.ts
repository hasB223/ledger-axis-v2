import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../core/api/http-client.service';
import { CompaniesQuery, Company, CompanyPayload } from '../models/companies.model';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  constructor(private readonly httpClient: HttpClientService) {}

  list(query: CompaniesQuery = {}): Observable<Company[]> {
    const params: Record<string, string | number | boolean> = {};

    if (query.q) params.q = query.q;
    if (query.page) params.page = query.page;
    if (query.limit) params.limit = query.limit;
    if (query.industry) params.industry = query.industry;
    if (query.source) params.source = query.source;
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortOrder) params.sortOrder = query.sortOrder;

    return this.httpClient.get<Company[]>('/api/companies', params);
  }

  getById(id: string): Observable<Company> {
    return this.httpClient.get<Company>(`/api/companies/${id}`);
  }

  create(payload: CompanyPayload): Observable<Company> {
    return this.httpClient.post<CompanyPayload, Company>('/api/companies', payload);
  }

  update(id: string, payload: Partial<CompanyPayload>): Observable<Company> {
    return this.httpClient.put<Partial<CompanyPayload>, Company>(`/api/companies/${id}`, payload);
  }
}
