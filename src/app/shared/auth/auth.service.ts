import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

@Injectable()
export class AuthService {
  authToken: string | null = null;

  constructor(
    private http: HttpClient,
  ) {
    this.authToken = localStorage.getItem('auth-token');
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    localStorage.setItem('auth-token', token);
  }

  getAuthToken(): string {
    if (!this.authToken) return '';
    return this.authToken;
  }

  authorize(token: string): Observable<boolean> {
    return this.http.get('https://skillproxy.i9.ar/', {
      responseType: 'text',
      headers: {
        'X-PROXY-HOST': 'example.org',
        'X-PROXY-PREVENT-OPTIONS': '',
        'X-PROXY-AUTHORIZATION': `Bearer ${token}`,
      }
    }).pipe(
      catchError(() => of(false)),
      map((v) => {
        if (!v) return false;
        this.setAuthToken(token);
        return true;
      }),
    );
  }

  isAuthorized(): boolean {
    return this.authToken !== null;
  }
}
