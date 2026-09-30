import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap, of, catchError, throwError } from "rxjs";
import { OrderRequest, OrderResponse } from "../models/order.model";
import { Trade } from "../models/trade.model";
import { ApiResponse } from "../models/api-response.model";
import { AuthService } from "./auth.service";
import { DemoService } from "./demo.service";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class TradingService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private demoService = inject(DemoService);
  private apiUrl = `${environment.apiUrl}/trading`;

  placeOrder(order: OrderRequest): Observable<OrderResponse> {
    if (this.demoService.isDemoMode()) {
      try {
        const result = this.demoService.placeOrder(order);
        return of(result);
      } catch (e: any) {
        return throwError(() => ({ error: { message: e.message } }));
      }
    }
    return this.http.post<ApiResponse<OrderResponse>>(`${this.apiUrl}/order`, order).pipe(
      map((res) => res.data),
      tap(() => { this.authService.fetchCurrentUser().subscribe(); })
    );
  }

  cancelOrder(id: number): Observable<OrderResponse | null> {
    if (this.demoService.isDemoMode()) {
      return of(this.demoService.cancelOrder(id));
    }
    return this.http.post<ApiResponse<OrderResponse>>(`${this.apiUrl}/order/${id}/cancel`, {}).pipe(
      map((res) => res.data),
      tap(() => { this.authService.fetchCurrentUser().subscribe(); })
    );
  }

  getUserOrders(): Observable<OrderResponse[]> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getOrders()); }
    return this.http.get<ApiResponse<OrderResponse[]>>(`${this.apiUrl}/orders`).pipe(
      map((res) => res.data || []),
      catchError(() => of(this.demoService.getOrders()))
    );
  }

  getUserTrades(): Observable<Trade[]> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getTrades()); }
    return this.http.get<ApiResponse<Trade[]>>(`${this.apiUrl}/trades`).pipe(
      map((res) => res.data || []),
      catchError(() => of(this.demoService.getTrades()))
    );
  }
}
