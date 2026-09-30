import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, of, catchError } from "rxjs";
import { AdminStats, User } from "../models/user.model";
import { Stock } from "../models/stock.model";
import { OrderResponse } from "../models/order.model";
import { Trade } from "../models/trade.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";
import { DemoService } from "./demo.service";

@Injectable({ providedIn: "root" })
export class AdminService {
  private http = inject(HttpClient);
  private demoService = inject(DemoService);
  private apiUrl = `${environment.apiUrl}/admin`;

  getAdminStats(): Observable<AdminStats> {
    if (this.demoService.isDemoMode()) {
      const s = this.demoService.getAdminStats();
      const stats: AdminStats = { totalUsers: s.totalUsers, activeUsers: s.activeUsers, totalOrders: 1284, executedTrades: 1156, totalTradingVolume: s.totalVolume, totalStocksListed: 20 };
      return of(stats);
    }
    return this.http.get<ApiResponse<AdminStats>>(`${this.apiUrl}/stats`).pipe(
      map(res => res.data),
      catchError(() => { const s = this.demoService.getAdminStats(); return of({ totalUsers: s.totalUsers, activeUsers: s.activeUsers, totalOrders: 1284, executedTrades: 1156, totalTradingVolume: s.totalVolume, totalStocksListed: 20 } as AdminStats); })
    );
  }

  getAllUsers(): Observable<User[]> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getAdminStats().recentUsers as unknown as User[]); }
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`).pipe(
      map(res => res.data || []),
      catchError(() => of(this.demoService.getAdminStats().recentUsers as unknown as User[]))
    );
  }

  updateUser(id: number, payload: { virtualBalance?: number; role?: string; isActive?: boolean }): Observable<User | null> {
    if (this.demoService.isDemoMode()) { return of(null); }
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${id}`, payload).pipe(map(res => res.data || null));
  }

  createStock(stock: Partial<Stock>): Observable<Stock> {
    if (this.demoService.isDemoMode()) { return of(stock as Stock); }
    return this.http.post<ApiResponse<Stock>>(`${this.apiUrl}/stocks`, stock).pipe(map(res => res.data));
  }

  updateStock(id: number, stock: Partial<Stock>): Observable<Stock | null> {
    if (this.demoService.isDemoMode()) { return of(null); }
    return this.http.put<ApiResponse<Stock>>(`${this.apiUrl}/stocks/${id}`, stock).pipe(map(res => res.data || null));
  }

  getAllOrders(): Observable<OrderResponse[]> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getOrders()); }
    return this.http.get<ApiResponse<OrderResponse[]>>(`${this.apiUrl}/orders`).pipe(
      map(res => res.data || []),
      catchError(() => of(this.demoService.getOrders()))
    );
  }

  getAllTrades(): Observable<Trade[]> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getTrades()); }
    return this.http.get<ApiResponse<Trade[]>>(`${this.apiUrl}/trades`).pipe(
      map(res => res.data || []),
      catchError(() => of(this.demoService.getTrades()))
    );
  }
}
