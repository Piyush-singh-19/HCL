import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, of, catchError } from "rxjs";
import { RiskReport } from "../models/risk.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";
import { DemoService } from "./demo.service";

@Injectable({ providedIn: "root" })
export class RiskService {
  private http = inject(HttpClient);
  private demoService = inject(DemoService);
  private apiUrl = `${environment.apiUrl}/risk`;

  getRiskReport(): Observable<RiskReport> {
    if (this.demoService.isDemoMode()) {
      const m = this.demoService.getRiskMetrics();
      const report: RiskReport = {
        portfolioVolatility: m.volatility,
        concentrationRiskIndex: 32.0,
        maxDrawdown: m.maxDrawdown,
        valueAtRisk95: m.portfolioVaR,
        valueAtRisk95Percent: m.portfolioVaRPercent,
        portfolioBeta: m.beta,
        riskLevel: 'MODERATE',
        riskScore: 42,
        warnings: ['Portfolio is moderately diversified across 4 holdings', 'HDFCBANK has the highest allocation at 32%'],
        assetWeights: { RELIANCE: 28.5, TCS: 18.7, HDFCBANK: 32.0, INFY: 20.7 }
      };
      return of(report);
    }
    return this.http.get<ApiResponse<RiskReport>>(`${this.apiUrl}/report`).pipe(
      map(res => res.data),
      catchError(() => {
        const m = this.demoService.getRiskMetrics();
        const report: RiskReport = { portfolioVolatility: m.volatility, concentrationRiskIndex: 32.0, maxDrawdown: m.maxDrawdown, valueAtRisk95: m.portfolioVaR, valueAtRisk95Percent: m.portfolioVaRPercent, portfolioBeta: m.beta, riskLevel: 'MODERATE', riskScore: 42, warnings: ['Backend unavailable – showing demo data'], assetWeights: { RELIANCE: 28.5, TCS: 18.7, HDFCBANK: 32.0, INFY: 20.7 } };
        return of(report);
      })
    );
  }
}
