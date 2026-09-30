import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map } from "rxjs";
import { PortfolioSummary, Holding } from "../models/portfolio.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class PortfolioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/portfolio`;

  getPortfolioSummary(): Observable<PortfolioSummary> {
    return this.http.get<ApiResponse<PortfolioSummary>>(`${this.apiUrl}/summary`).pipe(
      map(res => res.data)
    );
  }

  getHoldings(): Observable<Holding[]> {
    return this.http.get<ApiResponse<Holding[]>>(`${this.apiUrl}/holdings`).pipe(
      map(res => res.data || [])
    );
  }
}
