import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { AdminStats, User } from "../models/user.model";
import { Stock } from "../models/stock.model";
import { OrderResponse } from "../models/order.model";
import { Trade } from "../models/trade.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin`;

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<ApiResponse<AdminStats>>(`${this.apiUrl}/stats`).pipe(
      map(res => res.data)
    );
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`).pipe(
      map(res => res.data || [])
    );
  }

  updateUser(
    id: number,
    payload: { virtualBalance?: number; role?: string; isActive?: boolean },
  ): Observable<User | null> {
    return this.http.put<ApiResponse<User>>(`${this.apiUrl}/users/${id}`, payload).pipe(
      map(res => res.data || null)
    );
  }

  createStock(stock: Partial<Stock>): Observable<Stock> {
    return this.http.post<ApiResponse<Stock>>(`${this.apiUrl}/stocks`, stock).pipe(
      map(res => res.data)
    );
  }

  updateStock(id: number, stock: Partial<Stock>): Observable<Stock | null> {
    return this.http.put<ApiResponse<Stock>>(`${this.apiUrl}/stocks/${id}`, stock).pipe(
      map(res => res.data || null)
    );
  }

  getAllOrders(): Observable<OrderResponse[]> {
    return this.http.get<ApiResponse<OrderResponse[]>>(`${this.apiUrl}/orders`).pipe(
      map(res => res.data || [])
    );
  }

  getAllTrades(): Observable<Trade[]> {
    return this.http.get<ApiResponse<Trade[]>>(`${this.apiUrl}/trades`).pipe(
      map(res => res.data || [])
    );
  }
}
