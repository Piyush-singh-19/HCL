import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, of, catchError } from "rxjs";
import { TechnicalAnalysis } from "../models/analysis.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";
import { DemoService } from "./demo.service";

@Injectable({ providedIn: "root" })
export class AnalysisService {
  private http = inject(HttpClient);
  private demoService = inject(DemoService);
  private apiUrl = `${environment.apiUrl}/analysis`;

  private buildDemoAnalysis(symbol: string): TechnicalAnalysis {
    const stock = this.demoService.getStock(symbol);
    const price = stock?.currentPrice ?? 1000;
    const history = this.demoService.getStockHistory(symbol);
    return {
      symbol, name: stock?.name ?? symbol, currentPrice: price,
      sma20: parseFloat((price * 0.97).toFixed(2)), sma50: parseFloat((price * 0.93).toFixed(2)),
      ema12: parseFloat((price * 0.98).toFixed(2)), ema26: parseFloat((price * 0.95).toFixed(2)),
      rsi14: 58.4, rsiCondition: 'Neutral',
      macdLine: 12.5, signalLine: 8.3, macdHistogram: 4.2, macdSignal: 'Bullish',
      bbUpper: parseFloat((price * 1.04).toFixed(2)), bbMiddle: parseFloat((price * 1.0).toFixed(2)), bbLower: parseFloat((price * 0.96).toFixed(2)), bbCondition: 'Normal',
      overallSignal: 'BUY', bullishScore: 68, signalReason: 'Stock is trading above all major moving averages with positive MACD crossover.',
      signalBreakdown: ['Price above SMA20 (Bullish)', 'Price above SMA50 (Bullish)', 'RSI at 58 – Neutral zone', 'MACD bullish crossover', 'Trading within Bollinger Bands'],
      history
    };
  }

  getTechnicalAnalysis(symbol: string): Observable<TechnicalAnalysis> {
    if (this.demoService.isDemoMode()) { return of(this.buildDemoAnalysis(symbol)); }
    return this.http.get<ApiResponse<TechnicalAnalysis>>(`${this.apiUrl}/${symbol}`).pipe(
      map(res => {
        const data = res.data;
        if (data && data.history) {
          data.history = data.history.map(item => ({ ...item, date: item.date || item.formattedDate || (item.timestamp ? item.timestamp.substring(0, 10) : '') }));
        }
        return data;
      }),
      catchError(() => of(this.buildDemoAnalysis(symbol)))
    );
  }
}
