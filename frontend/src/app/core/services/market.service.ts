import { Injectable, signal, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, BehaviorSubject, map, tap, of, catchError } from "rxjs";
import { Stock, StockPriceHistory } from "../models/stock.model";
import { ApiResponse } from "../models/api-response.model";
import { environment } from "../../../environments/environment";
import { DemoService } from "./demo.service";

@Injectable({ providedIn: "root" })
export class MarketService {
  private http = inject(HttpClient);
  private demoService = inject(DemoService);
  private apiUrl = `${environment.apiUrl}/market`;

  private stocksSubject = new BehaviorSubject<Stock[]>([]);
  public stocks$ = this.stocksSubject.asObservable();
  public liveTickers = signal<Stock[]>([]);
  private simulationInterval: any;

  constructor() {
    this.initStocks();
    this.initLiveSimulation();
  }

  private initStocks(): void { this.getStocks().subscribe(); }

  private initLiveSimulation(): void {
    this.simulationInterval = setInterval(() => {
      if (this.demoService.isDemoMode()) {
        const updated = this.demoService.tick();
        this.stocksSubject.next(updated);
        this.liveTickers.set(updated);
        return;
      }
      const current = this.stocksSubject.value;
      if (!current || current.length === 0) return;
      const updated = current.map((stock) => {
        if (Math.random() > 0.4) {
          const deltaPct = (Math.random() - 0.49) * 0.45;
          const priceChange = (stock.currentPrice * deltaPct) / 100;
          const newPrice = Math.max(1, parseFloat((stock.currentPrice + priceChange).toFixed(2)));
          const totalChange = parseFloat((newPrice - stock.previousClose).toFixed(2));
          const totalPct = parseFloat(((totalChange / stock.previousClose) * 100).toFixed(2));
          return { ...stock, currentPrice: newPrice, changeAmount: totalChange, changePercent: totalPct, dayHigh: Math.max(stock.dayHigh, newPrice), dayLow: Math.min(stock.dayLow, newPrice), volume: stock.volume + Math.floor(Math.random() * 500) };
        }
        return stock;
      });
      this.stocksSubject.next(updated);
      this.liveTickers.set(updated);
    }, 3500);
  }

  getStocks(search?: string): Observable<Stock[]> {
    if (this.demoService.isDemoMode()) {
      const stocks = this.demoService.getStocks(search);
      if (!search || search.trim() === "") { this.stocksSubject.next(stocks); this.liveTickers.set(stocks); }
      return of(stocks);
    }
    let params = new HttpParams();
    if (search && search.trim() !== "") { params = params.set("search", search.trim()); }
    return this.http.get<ApiResponse<Stock[]>>(`${this.apiUrl}/stocks`, { params }).pipe(
      map((res) => res.data || []),
      tap((stocks) => { if (!search || search.trim() === "") { this.stocksSubject.next(stocks); this.liveTickers.set(stocks); } }),
      catchError(() => { const stocks = this.demoService.getStocks(search); if (!search || search.trim() === "") { this.stocksSubject.next(stocks); this.liveTickers.set(stocks); } return of(stocks); })
    );
  }

  refreshLocalStocks(): void { this.getStocks().subscribe(); }

  getStockBySymbol(symbol: string): Observable<Stock | null> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getStock(symbol)); }
    return this.http.get<ApiResponse<Stock>>(`${this.apiUrl}/stocks/${symbol}`).pipe(
      map((res) => res.data || null),
      catchError(() => of(this.demoService.getStock(symbol)))
    );
  }

  getStockHistory(symbol: string): Observable<StockPriceHistory[]> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getStockHistory(symbol)); }
    return this.http.get<ApiResponse<StockPriceHistory[]>>(`${this.apiUrl}/stocks/${symbol}/history`).pipe(
      map((res) => { const list = res.data || []; return list.map((item) => ({ ...item, date: item.date || item.formattedDate || (item.timestamp ? item.timestamp.substring(0, 10) : "") })); }),
      catchError(() => of(this.demoService.getStockHistory(symbol)))
    );
  }

  getSectors(): Observable<string[]> {
    if (this.demoService.isDemoMode()) { return of(this.demoService.getSectors()); }
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/sectors`).pipe(
      map((res) => { const sectors = res.data || []; return ["All", ...sectors]; }),
      catchError(() => of(this.demoService.getSectors()))
    );
  }
}
