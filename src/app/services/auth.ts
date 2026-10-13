import { DOCUMENT, inject, Injectable, NgZone, signal } from '@angular/core';
import { LoginData, LoginResponse, RegisterData } from '../interfaces/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  http = inject(HttpClient);
  private router = inject(Router);
  private zone = inject(NgZone);
  private window = inject(DOCUMENT).defaultView;
  private token = signal<string | null>(null);
  private expiresAt = 0;
  private logoutTimer?: ReturnType<typeof setTimeout>;
  private readonly tokenKey = 'jwtToken';
  private readonly expiryKey = 'jwtTokenExpiresAt';

  login(data: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.baseUrl}/api/Auth/Login`, data)
      .pipe(tap((response) => this.saveToken(response.jwtToken)));
  }

  register(data: RegisterData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.baseUrl}/api/Auth/Register`, data)
  }

  saveToken(jwtToken: string): void {
    const expiresAt = this.getTokenExpiry(jwtToken);
    if (expiresAt === null || expiresAt <= Date.now()) {
      this.clearSession();
      throw new Error('The server returned an invalid or expired token.');
    }

    const storage = this.window?.localStorage;
    if (!storage) throw new Error('Local storage is unavailable.');

    try {
      storage.setItem(this.tokenKey, jwtToken);
      storage.setItem(this.expiryKey, String(expiresAt));
    } catch (error) {
      this.clearSession();
      throw error;
    }
    this.token.set(jwtToken);
    this.expiresAt = expiresAt;
    this.scheduleLogout();
  }

  autoAuthenticate(): void {
    this.clearTimer();
    this.token.set(null);
    this.expiresAt = 0;

    try {
      const storage = this.window?.localStorage;
      const jwtToken = storage?.getItem(this.tokenKey);
      const savedExpiry = Number(storage?.getItem(this.expiryKey));
      const tokenExpiry = jwtToken ? this.getTokenExpiry(jwtToken) : null;

      if (!jwtToken || tokenExpiry === null || tokenExpiry <= Date.now() || savedExpiry !== tokenExpiry) {
        this.clearSession();
        return;
      }

      this.token.set(jwtToken);
      this.expiresAt = tokenExpiry;
      this.scheduleLogout();
    } catch {
      this.clearSession();
    }
  }

  getToken(): string | null {
    if (this.token() && this.expiresAt <= Date.now()) {
      this.logout();
    }
    return this.token();
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    this.clearSession();
    void this.router.navigate(['/login']);
  }

  private getTokenExpiry(jwtToken: string): number | null {
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3 || parts.some((part) => !part)) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
      const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
      const claims = JSON.parse(new TextDecoder().decode(bytes));
      const expiresAt = claims.exp * 1000;
      return typeof claims.exp === 'number' && Number.isFinite(expiresAt) && expiresAt > 0
        ? expiresAt
        : null;
    } catch {
      return null;
    }
  }

  private scheduleLogout(): void {
    this.clearTimer();
    // Recheck long-lived sessions without exceeding the browser's timer limit.
    const delay = Math.min(this.expiresAt - Date.now(), 2_147_483_647);
    if (delay <= 0) {
      this.logout();
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.logoutTimer = setTimeout(() => {
        this.zone.run(() => this.scheduleLogout());
      }, delay);
    });
  }

  private clearTimer(): void {
    if (this.logoutTimer !== undefined) clearTimeout(this.logoutTimer);
    this.logoutTimer = undefined;
  }

  private clearSession(): void {
    this.clearTimer();
    this.token.set(null);
    this.expiresAt = 0;
    try {
      this.window?.localStorage.removeItem(this.tokenKey);
      this.window?.localStorage.removeItem(this.expiryKey);
    } catch {
      // In-memory authentication is still cleared if browser storage is blocked.
    }
  }
}
