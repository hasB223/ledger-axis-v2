import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientService } from '../../../core/api/http-client.service';
import { Company, CompanyPayload } from '../models/companies.model';

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  constructor(private readonly httpClient: HttpClientService) {}

  list(): Observable<Company[]> {
    return this.httpClient.get<Company[]>('/api/companies');
  }

  getById(id: string): Observable<Company> {
    return this.httpClient.get<Company>(`/api/companies/${id}`);
  }

  create(payload: CompanyPayload): Observable<Company> {
    return this.httpClient.post<CompanyPayload, Company>('/api/companies', payload);
  }

  update(id: string, payload: CompanyPayload): Observable<Company> {
    return this.httpClient.put<CompanyPayload, Company>(`/api/companies/${id}`, payload);
  }
}
