import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";
import { OrderRequest, OrderResponse } from "../models/order.model";
import { Trade } from "../models/trade.model";
import { ApiResponse } from "../models/api-response.model";
import { AuthService } from "./auth.service";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class TradingService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/trading`;

  placeOrder(order: OrderRequest): Observable<OrderResponse> {
    return this.http
      .post<ApiResponse<OrderResponse>>(`${this.apiUrl}/order`, order)
      .pipe(
        map((res) => res.data),
        tap(() => {
          // Sync user balance & portfolio metrics from backend
          this.authService.fetchCurrentUser().subscribe();
        }),
      );
  }

  cancelOrder(id: number): Observable<OrderResponse | null> {
    return this.http
      .post<ApiResponse<OrderResponse>>(`${this.apiUrl}/order/${id}/cancel`, {})
      .pipe(
        map((res) => res.data),
        tap(() => {
          this.authService.fetchCurrentUser().subscribe();
        }),
      );
  }

  getUserOrders(): Observable<OrderResponse[]> {
    return this.http
      .get<ApiResponse<OrderResponse[]>>(`${this.apiUrl}/orders`)
      .pipe(map((res) => res.data || []));
  }

  getUserTrades(): Observable<Trade[]> {
    return this.http
      .get<ApiResponse<Trade[]>>(`${this.apiUrl}/trades`)
      .pipe(map((res) => res.data || []));
  }
}
