import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, of, catchError } from "rxjs";
import { PortfolioSummary, Holding } from "../models/portfolio.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";
import { DemoService } from "./demo.service";

@Injectable({ providedIn: "root" })
export class PortfolioService {
  private http = inject(HttpClient);
  private demoService = inject(DemoService);
  private apiUrl = `${environment.apiUrl}/portfolio`;

  getPortfolioSummary(): Observable<PortfolioSummary> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getPortfolioSummary()); }
    return this.http.get<ApiResponse<PortfolioSummary>>(`${this.apiUrl}/summary`).pipe(
      map(res => res.data),
      catchError(() => of(this.demoService.getPortfolioSummary()))
    );
  }

  getHoldings(): Observable<Holding[]> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getHoldings()); }
    return this.http.get<ApiResponse<Holding[]>>(`${this.apiUrl}/holdings`).pipe(
      map(res => res.data || []),
      catchError(() => of(this.demoService.getHoldings()))
    );
  }
}
