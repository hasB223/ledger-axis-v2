import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

export interface ApiError {
  status: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class HttpClientService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<T>(url, { params: this.toParams(params) }).pipe(catchError(this.mapError));
  }

  post<TRequest, TResponse>(url: string, body: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(url, body).pipe(catchError(this.mapError));
  }

  put<TRequest, TResponse>(url: string, body: TRequest): Observable<TResponse> {
    return this.http.put<TResponse>(url, body).pipe(catchError(this.mapError));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url).pipe(catchError(this.mapError));
  }

  private toParams(params?: Record<string, string | number | boolean>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    return Object.entries(params).reduce((httpParams, [key, value]) => httpParams.set(key, String(value)), new HttpParams());
  }

  private mapError(error: HttpErrorResponse) {
    const apiError: ApiError = {
      status: error.status,
      message: typeof error.error?.message === 'string' ? error.error.message : error.message
    };

    return throwError(() => apiError);
  }
}
