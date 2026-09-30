import { Injectable, signal, computed, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap, map, catchError, of } from "rxjs";
import { User, AuthResponse } from "../models/user.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private tokenKey = "portfolio_pro_token";
  private userKey = "portfolio_pro_user";

  // Angular Signals for reactive state
  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === "ROLE_ADMIN");

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage(): void {
    const savedToken = localStorage.getItem(this.tokenKey);
    const savedUser = localStorage.getItem(this.userKey);

    if (savedToken && savedUser) {
      try {
        this.token.set(savedToken);
        const user = JSON.parse(savedUser) as User;
        this.currentUser.set(user);
        // Refresh latest user state from backend
        this.fetchCurrentUser().subscribe({
          error: () => {
            // Invalid or expired token
            this.logout();
          },
        });
      } catch {
        this.logout();
      }
    }
  }

  fetchCurrentUser(): Observable<User | null> {
    if (!this.token()) return of(null);
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/me`).pipe(
      map((res) => res.data),
      tap((user) => {
        if (user) {
          this.currentUser.set(user);
          localStorage.setItem(this.userKey, JSON.stringify(user));
        }
      }),
      catchError((err) => {
        return of(null);
      }),
    );
  }

  login(credentials: {
    username: string;
    password?: string;
  }): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((res) => {
          const authData = res.data;
          this.token.set(authData.token);
          localStorage.setItem(this.tokenKey, authData.token);

          const basicUser: User = {
            id: authData.id,
            username: authData.username,
            email: authData.email,
            fullName: authData.fullName,
            virtualBalance: authData.virtualBalance,
            realizedPnl: 0,
            role: authData.role,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          this.currentUser.set(basicUser);
          localStorage.setItem(this.userKey, JSON.stringify(basicUser));

          // Sync complete profile
          this.fetchCurrentUser().subscribe();
        }),
      );
  }

  register(userData: {
    username: string;
    email: string;
    password?: string;
    fullName: string;
  }): Observable<ApiResponse<AuthResponse>> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap((res) => {
          const authData = res.data;
          this.token.set(authData.token);
          localStorage.setItem(this.tokenKey, authData.token);

          const basicUser: User = {
            id: authData.id,
            username: authData.username,
            email: authData.email,
            fullName: authData.fullName,
            virtualBalance: authData.virtualBalance,
            realizedPnl: 0,
            role: authData.role,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          this.currentUser.set(basicUser);
          localStorage.setItem(this.userKey, JSON.stringify(basicUser));

          this.fetchCurrentUser().subscribe();
        }),
      );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(["/login"]);
  }

  updateProfile(
    fullName: string,
    email: string,
  ): Observable<ApiResponse<User>> {
    return this.http
      .put<ApiResponse<User>>(`${this.apiUrl}/profile`, { fullName, email })
      .pipe(
        tap((res) => {
          if (res.data) {
            this.currentUser.set(res.data);
            localStorage.setItem(this.userKey, JSON.stringify(res.data));
          }
        }),
      );
  }

  resetBalance(): Observable<ApiResponse<User>> {
    return this.http
      .post<ApiResponse<User>>(`${this.apiUrl}/reset-balance`, {})
      .pipe(
        tap((res) => {
          if (res.data) {
            this.currentUser.set(res.data);
            localStorage.setItem(this.userKey, JSON.stringify(res.data));
          }
        }),
      );
  }

  addVirtualFunds(amount: number): Observable<ApiResponse<User>> {
    return this.http
      .post<ApiResponse<User>>(`${this.apiUrl}/add-funds`, { amount })
      .pipe(
        tap((res) => {
          if (res.data) {
            this.currentUser.set(res.data);
            localStorage.setItem(this.userKey, JSON.stringify(res.data));
          }
        }),
      );
  }

  syncCurrentUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}
