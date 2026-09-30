import { Injectable, signal, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, BehaviorSubject, map, tap, of } from "rxjs";
import { Stock, StockPriceHistory } from "../models/stock.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class MarketService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/market`;

  // Real-time stock prices reactive subject
  private stocksSubject = new BehaviorSubject<Stock[]>([]);
  public stocks$ = this.stocksSubject.asObservable();
  public liveTickers = signal<Stock[]>([]);

  private simulationInterval: any;

  constructor() {
    this.initStocks();
    this.initLiveSimulation();
  }

  private initStocks(): void {
    this.getStocks().subscribe();
  }

  private initLiveSimulation(): void {
    // Realistic market fluctuation ticker simulation every 3.5 seconds
    this.simulationInterval = setInterval(() => {
      const current = this.stocksSubject.value;
      if (!current || current.length === 0) return;

      const updated = current.map((stock) => {
        // Randomly adjust ~40% of stocks
        if (Math.random() > 0.4) {
          const deltaPct = (Math.random() - 0.49) * 0.45; // small fluctuation ±0.25%
          const priceChange = (stock.currentPrice * deltaPct) / 100;
          const newPrice = Math.max(
            1,
            parseFloat((stock.currentPrice + priceChange).toFixed(2)),
          );
          const totalChange = parseFloat(
            (newPrice - stock.previousClose).toFixed(2),
          );
          const totalPct = parseFloat(
            ((totalChange / stock.previousClose) * 100).toFixed(2),
          );
          const dayHigh = Math.max(stock.dayHigh, newPrice);
          const dayLow = Math.min(stock.dayLow, newPrice);

          return {
            ...stock,
            currentPrice: newPrice,
            changeAmount: totalChange,
            changePercent: totalPct,
            dayHigh: parseFloat(dayHigh.toFixed(2)),
            dayLow: parseFloat(dayLow.toFixed(2)),
            volume: stock.volume + Math.floor(Math.random() * 500),
          };
        }
        return stock;
      });

      this.stocksSubject.next(updated);
      this.liveTickers.set(updated);
    }, 3500);
  }

  getStocks(search?: string): Observable<Stock[]> {
    let params = new HttpParams();
    if (search && search.trim() !== "") {
      params = params.set("search", search.trim());
    }

    return this.http
      .get<ApiResponse<Stock[]>>(`${this.apiUrl}/stocks`, { params })
      .pipe(
        map((res) => res.data || []),
        tap((stocks) => {
          if (!search || search.trim() === "") {
            this.stocksSubject.next(stocks);
            this.liveTickers.set(stocks);
          }
        }),
      );
  }

  refreshLocalStocks(): void {
    this.getStocks().subscribe();
  }

  getStockBySymbol(symbol: string): Observable<Stock | null> {
    return this.http
      .get<ApiResponse<Stock>>(`${this.apiUrl}/stocks/${symbol}`)
      .pipe(map((res) => res.data || null));
  }

  getStockHistory(symbol: string): Observable<StockPriceHistory[]> {
    return this.http
      .get<
        ApiResponse<StockPriceHistory[]>
      >(`${this.apiUrl}/stocks/${symbol}/history`)
      .pipe(
        map((res) => {
          const list = res.data || [];
          return list.map((item) => ({
            ...item,
            date:
              item.date ||
              item.formattedDate ||
              (item.timestamp ? item.timestamp.substring(0, 10) : ""),
          }));
        }),
      );
  }

  getSectors(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/sectors`).pipe(
      map((res) => {
        const sectors = res.data || [];
        return ["All", ...sectors];
      }),
    );
  }
}
