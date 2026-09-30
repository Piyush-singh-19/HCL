import { Injectable, signal } from '@angular/core';
import { Stock, StockPriceHistory } from '../models/stock.model';
import { Holding, PortfolioSummary } from '../models/portfolio.model';
import { OrderResponse, OrderRequest } from '../models/order.model';
import { Trade } from '../models/trade.model';
import { User } from '../models/user.model';

/** =====================================================================
 *  DemoService — provides offline mock data when the backend is down.
 *  Activated automatically when quickLogin('trader'/'admin') is used.
 * ===================================================================== */
@Injectable({ providedIn: 'root' })
export class DemoService {
  isDemoMode = signal<boolean>(false);
  demoRole = signal<'trader' | 'admin' | null>(null);

  private _stocks: Stock[] = [
    { id: 1,  symbol: 'RELIANCE',   name: 'Reliance Industries',       sector: 'Energy',         currentPrice: 2945.60, previousClose: 2910.15, dayOpen: 2918.00, dayHigh: 2958.30, dayLow: 2905.00, changeAmount: 35.45,  changePercent: 1.22,  volume: 4812300, marketCap: '19.88L Cr', peRatio: 28.4, week52High: 3024.90, week52Low: 2180.50, eps: 103.65, beta: 1.12, dividendYield: 0.35, isActive: true, sparkline: [2820,2850,2870,2895,2910,2920,2930,2945] },
    { id: 2,  symbol: 'TCS',        name: 'Tata Consultancy Services', sector: 'IT',             currentPrice: 3872.25, previousClose: 3848.90, dayOpen: 3855.00, dayHigh: 3890.10, dayLow: 3840.00, changeAmount: 23.35,  changePercent: 0.61,  volume: 1923500, marketCap: '14.12L Cr', peRatio: 31.7, week52High: 4255.00, week52Low: 3311.00, eps: 122.13, beta: 0.72, dividendYield: 1.58, isActive: true, sparkline: [3760,3790,3810,3830,3848,3855,3860,3872] },
    { id: 3,  symbol: 'HDFCBANK',   name: 'HDFC Bank',                 sector: 'Banking',        currentPrice: 1658.40, previousClose: 1641.75, dayOpen: 1645.00, dayHigh: 1668.20, dayLow: 1638.00, changeAmount: 16.65,  changePercent: 1.01,  volume: 6345200, marketCap: '12.60L Cr', peRatio: 19.8, week52High: 1794.00, week52Low: 1363.55, eps: 83.76, beta: 1.05, dividendYield: 1.12, isActive: true, sparkline: [1600,1615,1628,1635,1641,1645,1650,1658] },
    { id: 4,  symbol: 'INFY',       name: 'Infosys',                   sector: 'IT',             currentPrice: 1782.55, previousClose: 1758.30, dayOpen: 1765.00, dayHigh: 1795.00, dayLow: 1755.00, changeAmount: 24.25,  changePercent: 1.38,  volume: 3201800, marketCap: '7.43L Cr',  peRatio: 24.9, week52High: 1903.00, week52Low: 1351.00, eps: 71.59, beta: 0.82, dividendYield: 2.34, isActive: true, sparkline: [1700,1720,1740,1750,1758,1765,1772,1782] },
    { id: 5,  symbol: 'ICICIBANK',  name: 'ICICI Bank',                sector: 'Banking',        currentPrice: 1245.80, previousClose: 1232.50, dayOpen: 1235.00, dayHigh: 1252.40, dayLow: 1228.00, changeAmount: 13.30,  changePercent: 1.08,  volume: 5621400, marketCap: '8.77L Cr',  peRatio: 18.2, week52High: 1360.00, week52Low: 985.00,  eps: 68.45, beta: 1.18, dividendYield: 0.60, isActive: true, sparkline: [1190,1205,1215,1225,1232,1235,1240,1245] },
    { id: 6,  symbol: 'HINDUNILVR', name: 'Hindustan Unilever',        sector: 'FMCG',           currentPrice: 2635.70, previousClose: 2610.45, dayOpen: 2618.00, dayHigh: 2648.50, dayLow: 2608.00, changeAmount: 25.25,  changePercent: 0.97,  volume: 987340,  marketCap: '6.18L Cr',  peRatio: 56.3, week52High: 2870.00, week52Low: 2172.00, eps: 46.81, beta: 0.58, dividendYield: 1.45, isActive: true, sparkline: [2560,2580,2595,2605,2610,2618,2625,2635] },
    { id: 7,  symbol: 'SBIN',       name: 'State Bank of India',       sector: 'Banking',        currentPrice:  834.60, previousClose:  821.40, dayOpen:  824.00, dayHigh:  840.20, dayLow:  818.00, changeAmount: 13.20,  changePercent: 1.61,  volume: 9834500, marketCap: '7.44L Cr',  peRatio: 10.4, week52High:  912.00, week52Low:  600.65, eps: 80.25, beta: 1.32, dividendYield: 1.92, isActive: true, sparkline: [795,800,808,815,821,824,829,834] },
    { id: 8,  symbol: 'BHARTIARTL', name: 'Bharti Airtel',             sector: 'Telecom',        currentPrice: 1725.30, previousClose: 1698.60, dayOpen: 1705.00, dayHigh: 1732.80, dayLow: 1695.00, changeAmount: 26.70,  changePercent: 1.57,  volume: 2145670, marketCap: '10.25L Cr', peRatio: 78.6, week52High: 1895.00, week52Low: 1142.00, eps: 21.94, beta: 0.95, dividendYield: 0.23, isActive: true, sparkline: [1640,1655,1670,1685,1698,1705,1715,1725] },
    { id: 9,  symbol: 'LT',         name: 'Larsen and Toubro',         sector: 'Infrastructure', currentPrice: 3658.95, previousClose: 3628.10, dayOpen: 3635.00, dayHigh: 3672.30, dayLow: 3620.00, changeAmount: 30.85,  changePercent: 0.85,  volume: 1236890, marketCap: '5.14L Cr',  peRatio: 34.2, week52High: 3963.00, week52Low: 2832.00, eps: 107.00, beta: 1.08, dividendYield: 0.82, isActive: true, sparkline: [3560,3580,3600,3615,3628,3635,3645,3658] },
    { id: 10, symbol: 'WIPRO',      name: 'Wipro',                     sector: 'IT',             currentPrice:  562.35, previousClose:  554.80, dayOpen:  557.00, dayHigh:  566.20, dayLow:  552.00, changeAmount:  7.55,  changePercent: 1.36,  volume: 4523100, marketCap: '2.94L Cr',  peRatio: 22.1, week52High:  620.00, week52Low:  412.40, eps: 25.44, beta: 0.88, dividendYield: 0.18, isActive: true, sparkline: [530,538,545,550,554,557,560,562] },
    { id: 11, symbol: 'AXISBANK',   name: 'Axis Bank',                 sector: 'Banking',        currentPrice: 1198.70, previousClose: 1183.40, dayOpen: 1187.00, dayHigh: 1205.50, dayLow: 1180.00, changeAmount: 15.30,  changePercent: 1.29,  volume: 3897650, marketCap: '3.70L Cr',  peRatio: 16.5, week52High: 1340.00, week52Low:  922.35, eps: 72.65, beta: 1.25, dividendYield: 0.08, isActive: true, sparkline: [1140,1155,1168,1178,1183,1187,1193,1198] },
    { id: 12, symbol: 'MARUTI',     name: 'Maruti Suzuki',             sector: 'Auto',           currentPrice: 12450.00,previousClose:12280.50, dayOpen:12310.00, dayHigh:12495.00, dayLow:12260.00, changeAmount: 169.50, changePercent: 1.38,  volume:  412560, marketCap: '3.76L Cr',  peRatio: 26.8, week52High:13680.00, week52Low: 9660.00, eps: 464.55, beta: 0.92, dividendYield: 0.72, isActive: true, sparkline: [12050,12100,12170,12220,12280,12310,12380,12450] },
    { id: 13, symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',       sector: 'Banking',        currentPrice: 1895.40, previousClose: 1872.30, dayOpen: 1878.00, dayHigh: 1902.60, dayLow: 1865.00, changeAmount: 23.10,  changePercent: 1.23,  volume: 2143870, marketCap: '3.77L Cr',  peRatio: 21.4, week52High: 2145.00, week52Low: 1543.55, eps: 88.57, beta: 0.88, dividendYield: 0.11, isActive: true, sparkline: [1820,1835,1850,1862,1872,1878,1885,1895] },
    { id: 14, symbol: 'ITC',        name: 'ITC',                       sector: 'FMCG',           currentPrice:  478.90, previousClose:  472.60, dayOpen:  474.00, dayHigh:  481.30, dayLow:  470.00, changeAmount:  6.30,  changePercent: 1.33,  volume: 6832100, marketCap: '5.98L Cr',  peRatio: 27.3, week52High:  528.50, week52Low:  399.35, eps: 17.55, beta: 0.65, dividendYield: 2.92, isActive: true, sparkline: [455,460,465,469,472,474,476,478] },
    { id: 15, symbol: 'HCLTECH',    name: 'HCL Technologies',          sector: 'IT',             currentPrice: 1642.80, previousClose: 1621.50, dayOpen: 1628.00, dayHigh: 1650.00, dayLow: 1618.00, changeAmount: 21.30,  changePercent: 1.31,  volume: 1893200, marketCap: '4.46L Cr',  peRatio: 27.8, week52High: 1820.00, week52Low: 1235.00, eps: 59.08, beta: 0.90, dividendYield: 3.05, isActive: true, sparkline: [1575,1590,1605,1615,1621,1628,1635,1642] },
    { id: 16, symbol: 'SUNPHARMA',  name: 'Sun Pharmaceutical',        sector: 'Healthcare',     currentPrice: 1895.60, previousClose: 1872.20, dayOpen: 1878.00, dayHigh: 1905.40, dayLow: 1865.00, changeAmount: 23.40,  changePercent: 1.25,  volume: 1254300, marketCap: '4.55L Cr',  peRatio: 38.5, week52High: 2100.00, week52Low: 1410.00, eps: 49.24, beta: 0.78, dividendYield: 0.61, isActive: true, sparkline: [1820,1835,1848,1858,1872,1878,1885,1895] },
    { id: 17, symbol: 'BAJFINANCE', name: 'Bajaj Finance',             sector: 'Finance',        currentPrice: 7285.50, previousClose: 7198.40, dayOpen: 7215.00, dayHigh: 7310.00, dayLow: 7185.00, changeAmount: 87.10,  changePercent: 1.21,  volume:  987450, marketCap: '4.41L Cr',  peRatio: 29.1, week52High: 8190.00, week52Low: 5680.00, eps: 250.35, beta: 1.45, dividendYield: 0.41, isActive: true, sparkline: [7050,7080,7120,7155,7198,7215,7250,7285] },
    { id: 18, symbol: 'ASIANPAINT', name: 'Asian Paints',              sector: 'Consumer',       currentPrice: 2845.30, previousClose: 2812.80, dayOpen: 2820.00, dayHigh: 2858.00, dayLow: 2808.00, changeAmount: 32.50,  changePercent: 1.16,  volume:  632800, marketCap: '2.72L Cr',  peRatio: 52.6, week52High: 3395.00, week52Low: 2200.00, eps: 54.09, beta: 0.62, dividendYield: 0.84, isActive: true, sparkline: [2750,2768,2782,2798,2812,2820,2832,2845] },
    { id: 19, symbol: 'TITAN',      name: 'Titan Company',             sector: 'Consumer',       currentPrice: 3542.15, previousClose: 3498.60, dayOpen: 3508.00, dayHigh: 3558.00, dayLow: 3492.00, changeAmount: 43.55,  changePercent: 1.24,  volume:  754130, marketCap: '3.15L Cr',  peRatio: 92.8, week52High: 3886.00, week52Low: 2690.00, eps: 38.17, beta: 0.75, dividendYield: 0.35, isActive: true, sparkline: [3420,3440,3462,3478,3498,3508,3525,3542] },
    { id: 20, symbol: 'ONGC',       name: 'Oil Natural Gas Corp',      sector: 'Energy',         currentPrice:  285.45, previousClose:  279.80, dayOpen:  281.00, dayHigh:  288.10, dayLow:  278.00, changeAmount:  5.65,  changePercent: 2.02,  volume:11234500, marketCap: '3.58L Cr',  peRatio:  7.8, week52High:  345.00, week52Low:  187.50, eps: 36.59, beta: 1.42, dividendYield: 5.92, isActive: true, sparkline: [268,271,275,278,279,281,283,285] },
  ];

  private _holdings: Holding[] = [
    { id: 1, symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy',  quantity: 10, averageBuyPrice: 2820.00, currentPrice: 2945.60, totalInvested: 28200, currentValue: 29456,    unrealizedPnl: 1256,    unrealizedPnlPercent: 4.45, allocationPercent: 28.5 },
    { id: 2, symbol: 'TCS',      name: 'TCS',                 sector: 'IT',      quantity: 5,  averageBuyPrice: 3720.00, currentPrice: 3872.25, totalInvested: 18600, currentValue: 19361.25, unrealizedPnl: 761.25,  unrealizedPnlPercent: 4.09, allocationPercent: 18.7 },
    { id: 3, symbol: 'HDFCBANK', name: 'HDFC Bank',           sector: 'Banking', quantity: 20, averageBuyPrice: 1580.00, currentPrice: 1658.40, totalInvested: 31600, currentValue: 33168,    unrealizedPnl: 1568,    unrealizedPnlPercent: 4.96, allocationPercent: 32.0 },
    { id: 4, symbol: 'INFY',     name: 'Infosys',             sector: 'IT',      quantity: 12, averageBuyPrice: 1690.00, currentPrice: 1782.55, totalInvested: 20280, currentValue: 21390.6,  unrealizedPnl: 1110.6,  unrealizedPnlPercent: 5.48, allocationPercent: 20.7 },
  ];

  private _orders: OrderResponse[] = [
    { id: 90, symbol: 'RELIANCE', stockName: 'Reliance Industries', side: 'BUY',  type: 'MARKET', quantity: 10, filledQuantity: 10, status: 'EXECUTED', createdAt: '2024-09-15T09:15:00Z', executedAt: '2024-09-15T09:15:01Z' },
    { id: 91, symbol: 'TCS',      stockName: 'TCS',                 side: 'BUY',  type: 'MARKET', quantity: 5,  filledQuantity: 5,  status: 'EXECUTED', createdAt: '2024-09-16T10:30:00Z', executedAt: '2024-09-16T10:30:01Z' },
    { id: 92, symbol: 'HDFCBANK', stockName: 'HDFC Bank',           side: 'BUY',  type: 'LIMIT',  quantity: 20, filledQuantity: 20, targetPrice: 1590, status: 'EXECUTED', createdAt: '2024-09-18T11:00:00Z', executedAt: '2024-09-18T11:05:00Z' },
    { id: 93, symbol: 'INFY',     stockName: 'Infosys',             side: 'BUY',  type: 'MARKET', quantity: 12, filledQuantity: 12, status: 'EXECUTED', createdAt: '2024-09-20T14:00:00Z', executedAt: '2024-09-20T14:00:01Z' },
    { id: 94, symbol: 'WIPRO',    stockName: 'Wipro',               side: 'SELL', type: 'MARKET', quantity: 8,  filledQuantity: 8,  status: 'EXECUTED', createdAt: '2024-09-22T13:30:00Z', executedAt: '2024-09-22T13:30:01Z' },
  ];

  private _trades: Trade[] = [
    { id: 1001, orderId: 90, symbol: 'RELIANCE', stockName: 'Reliance Industries', side: 'BUY',  quantity: 10, price: 2820.00, totalAmount: 28200.00, realizedPnl: 0, executedAt: '2024-09-15T09:15:01Z' },
    { id: 1002, orderId: 91, symbol: 'TCS',      stockName: 'TCS',                 side: 'BUY',  quantity: 5,  price: 3720.00, totalAmount: 18600.00, realizedPnl: 0, executedAt: '2024-09-16T10:30:01Z' },
    { id: 1003, orderId: 92, symbol: 'HDFCBANK', stockName: 'HDFC Bank',           side: 'BUY',  quantity: 20, price: 1580.00, totalAmount: 31600.00, realizedPnl: 0, executedAt: '2024-09-18T11:05:00Z' },
    { id: 1004, orderId: 93, symbol: 'INFY',     stockName: 'Infosys',             side: 'BUY',  quantity: 12, price: 1690.00, totalAmount: 20280.00, realizedPnl: 0, executedAt: '2024-09-20T14:00:01Z' },
    { id: 1005, orderId: 94, symbol: 'WIPRO',    stockName: 'Wipro',               side: 'SELL', quantity: 8,  price: 555.20,  totalAmount: 4441.60,  realizedPnl: 441.60, executedAt: '2024-09-22T13:30:01Z' },
  ];

  private _balance = 896378.40;
  private _nextId = 100;

  activate(role: 'trader' | 'admin'): void {
    this.isDemoMode.set(true);
    this.demoRole.set(role);
  }

  deactivate(): void {
    this.isDemoMode.set(false);
    this.demoRole.set(null);
  }

  getDemoUser(role: 'trader' | 'admin'): User {
    if (role === 'admin') {
      return { id: 1, username: 'admin', email: 'admin@portfoliopro.demo', fullName: 'Admin User', virtualBalance: 5000000, realizedPnl: 12540, role: 'ROLE_ADMIN', isActive: true, createdAt: '2024-01-01T00:00:00Z' };
    }
    return { id: 2, username: 'trader', email: 'trader@portfoliopro.demo', fullName: 'Demo Trader', virtualBalance: this._balance, realizedPnl: 3628.75, role: 'ROLE_USER', isActive: true, createdAt: '2024-03-15T00:00:00Z' };
  }

  getStocks(search?: string): Stock[] {
    let stocks = this._stocks;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      stocks = stocks.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return stocks;
  }

  getStock(symbol: string): Stock | null {
    return this._stocks.find(s => s.symbol === symbol) ?? null;
  }

  getStockHistory(symbol: string): StockPriceHistory[] {
    const stock = this.getStock(symbol);
    const base = stock?.currentPrice ?? 2000;
    const history: StockPriceHistory[] = [];
    let price = base * 0.88;
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const drift = (Math.random() - 0.48) * price * 0.015;
      const open = parseFloat(price.toFixed(2));
      const close = Math.max(10, parseFloat((price + drift).toFixed(2)));
      const high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.01)).toFixed(2));
      const low  = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.01)).toFixed(2));
      history.push({ date: d.toISOString().substring(0, 10), open, high, low, close, volume: Math.floor(500000 + Math.random() * 5000000) });
      price = close;
    }
    return history;
  }

  getSectors(): string[] {
    return ['All', ...[...new Set(this._stocks.map(s => s.sector))].sort()];
  }

  tick(): Stock[] {
    this._stocks = this._stocks.map(stock => {
      if (Math.random() > 0.35) {
        const deltaPct = (Math.random() - 0.49) * 0.45;
        const newPrice = Math.max(1, parseFloat((stock.currentPrice + (stock.currentPrice * deltaPct) / 100).toFixed(2)));
        const totalChange = parseFloat((newPrice - stock.previousClose).toFixed(2));
        const sparkline = [...(stock.sparkline || []).slice(-7), newPrice];
        return { ...stock, currentPrice: newPrice, changeAmount: totalChange, changePercent: parseFloat(((totalChange / stock.previousClose) * 100).toFixed(2)), dayHigh: Math.max(stock.dayHigh, newPrice), dayLow: Math.min(stock.dayLow, newPrice), volume: stock.volume + Math.floor(Math.random() * 1000), sparkline };
      }
      return stock;
    });
    return this._stocks;
  }

  getHoldings(): Holding[] {
    return this._holdings.map(h => {
      const live = this.getStock(h.symbol);
      const cp = live?.currentPrice ?? h.currentPrice;
      const cv = parseFloat((cp * h.quantity).toFixed(2));
      const upnl = parseFloat((cv - h.totalInvested).toFixed(2));
      return { ...h, currentPrice: cp, currentValue: cv, unrealizedPnl: upnl, unrealizedPnlPercent: parseFloat(((upnl / h.totalInvested) * 100).toFixed(2)) };
    });
  }

  getPortfolioSummary(): PortfolioSummary {
    const holdings = this.getHoldings();
    const totalInvested = holdings.reduce((s, h) => s + h.totalInvested, 0);
    const currentHoldingsValue = holdings.reduce((s, h) => s + h.currentValue, 0);
    const totalUnrealizedPnl = holdings.reduce((s, h) => s + h.unrealizedPnl, 0);
    const totalRealizedPnl = 3628.75;
    const totalPnl = parseFloat((totalUnrealizedPnl + totalRealizedPnl).toFixed(2));
    const netWorth = parseFloat((this._balance + currentHoldingsValue).toFixed(2));
    const totalReturnPercent = totalInvested > 0 ? parseFloat(((totalPnl / totalInvested) * 100).toFixed(2)) : 0;
    const totalVal = currentHoldingsValue || 1;
    holdings.forEach(h => { h.allocationPercent = parseFloat(((h.currentValue / totalVal) * 100).toFixed(1)); });
    const sectorMap: Record<string, number> = {};
    holdings.forEach(h => { sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.currentValue; });
    return { cashBalance: this._balance, totalInvested, currentHoldingsValue, netWorth, totalUnrealizedPnl, totalRealizedPnl, totalPnl, totalReturnPercent, holdings, allocationLabels: holdings.map(h => h.symbol), allocationValues: holdings.map(h => h.currentValue), sectorLabels: Object.keys(sectorMap), sectorValues: Object.values(sectorMap) };
  }

  placeOrder(req: OrderRequest): OrderResponse {
    const stock = this.getStock(req.symbol);
    const price = stock?.currentPrice ?? 1000;
    const total = parseFloat((price * req.quantity).toFixed(2));
    if (req.side === 'BUY') {
      if (total > this._balance) throw new Error(`Insufficient funds. Need Rs.${total.toLocaleString('en-IN')}, have Rs.${this._balance.toLocaleString('en-IN')}.`);
      this._balance = parseFloat((this._balance - total).toFixed(2));
      const existing = this._holdings.find(h => h.symbol === req.symbol);
      if (existing) {
        const newQty = existing.quantity + req.quantity;
        const newInvested = existing.totalInvested + total;
        existing.quantity = newQty; existing.totalInvested = parseFloat(newInvested.toFixed(2)); existing.averageBuyPrice = parseFloat((newInvested / newQty).toFixed(2));
      } else {
        this._holdings.push({ id: this._nextId++, symbol: req.symbol, name: stock?.name ?? req.symbol, sector: stock?.sector ?? 'Other', quantity: req.quantity, averageBuyPrice: price, currentPrice: price, totalInvested: total, currentValue: total, unrealizedPnl: 0, unrealizedPnlPercent: 0, allocationPercent: 0 });
      }
    } else {
      const existing = this._holdings.find(h => h.symbol === req.symbol);
      if (!existing || existing.quantity < req.quantity) throw new Error(`Insufficient holdings. Have ${existing?.quantity ?? 0} shares.`);
      this._balance = parseFloat((this._balance + total).toFixed(2));
      existing.quantity -= req.quantity;
      existing.totalInvested = parseFloat((existing.averageBuyPrice * existing.quantity).toFixed(2));
      if (existing.quantity === 0) this._holdings = this._holdings.filter(h => h.symbol !== req.symbol);
    }
    const now = new Date().toISOString();
    const order: OrderResponse = { id: this._nextId++, symbol: req.symbol, stockName: stock?.name ?? req.symbol, side: req.side, type: req.type, quantity: req.quantity, filledQuantity: req.quantity, targetPrice: req.targetPrice, stopPrice: req.stopPrice, status: 'EXECUTED', createdAt: now, executedAt: now };
    this._orders.unshift(order);
    this._trades.unshift({ id: this._nextId++, orderId: order.id, symbol: req.symbol, stockName: stock?.name ?? req.symbol, side: req.side, quantity: req.quantity, price: parseFloat(price.toFixed(2)), totalAmount: total, realizedPnl: req.side === 'SELL' ? parseFloat((total * 0.05).toFixed(2)) : 0, executedAt: now });
    return order;
  }

  getOrders(): OrderResponse[] { return this._orders; }
  getTrades(): Trade[] { return this._trades; }
  cancelOrder(id: number): OrderResponse | null { const o = this._orders.find(o => o.id === id); if (o && o.status === 'PENDING') { o.status = 'CANCELLED'; return o; } return null; }

  getRiskMetrics() {
    return { portfolioVaR: -4258.50, portfolioVaRPercent: -4.12, expectedShortfall: -6128.30, sharpeRatio: 1.28, sortinoRatio: 1.74, maxDrawdown: -8.54, beta: 0.96, alpha: 2.34, volatility: 18.42, diversificationScore: 72, concentrationRisk: 'MEDIUM', riskLevel: 'MODERATE', holdingRisks: this._holdings.map(h => ({ symbol: h.symbol, name: h.name, weight: h.allocationPercent, var95: -(h.currentValue * 0.03), beta: 0.9 + Math.random() * 0.5, volatility: 15 + Math.random() * 15, riskLevel: 'MODERATE' })) };
  }

  getAnalysis() {
    const sorted = [...this._stocks].sort((a, b) => b.changePercent - a.changePercent);
    return { marketSentiment: 'BULLISH', fearGreedIndex: 68, topGainers: sorted.slice(0, 5), topLosers: sorted.slice(-5).reverse(), sectorPerformance: [{sector:'IT',changePercent:1.28,stockCount:4},{sector:'Banking',changePercent:1.15,stockCount:5},{sector:'Energy',changePercent:1.52,stockCount:2},{sector:'FMCG',changePercent:1.05,stockCount:2},{sector:'Auto',changePercent:0.92,stockCount:2}], volumeLeaders: [...this._stocks].sort((a,b)=>b.volume-a.volume).slice(0,5) };
  }

  getAdminStats() {
    return { totalUsers: 48, activeUsers: 31, totalTrades: 1284, totalVolume: 29845632, platformPnl: 184256.50, recentUsers: [
      { id: 3, username: 'rahul_k',  fullName: 'Rahul Kumar',   email: 'rahul@demo.com',  isActive: true,  virtualBalance: 125000, role: 'ROLE_USER', createdAt: '2024-06-01T10:00:00Z', realizedPnl: 0 },
      { id: 4, username: 'priya_s',  fullName: 'Priya Sharma',  email: 'priya@demo.com',  isActive: true,  virtualBalance:  98500, role: 'ROLE_USER', createdAt: '2024-07-12T09:00:00Z', realizedPnl: 0 },
      { id: 5, username: 'amit_v',   fullName: 'Amit Verma',    email: 'amit@demo.com',   isActive: false, virtualBalance: 210000, role: 'ROLE_USER', createdAt: '2024-05-22T14:00:00Z', realizedPnl: 0 },
      { id: 6, username: 'sneha_r',  fullName: 'Sneha Reddy',   email: 'sneha@demo.com',  isActive: true,  virtualBalance: 340000, role: 'ROLE_USER', createdAt: '2024-08-05T11:00:00Z', realizedPnl: 0 },
      { id: 7, username: 'vikram_m', fullName: 'Vikram Mehta',  email: 'vikram@demo.com', isActive: true,  virtualBalance:  75000, role: 'ROLE_USER', createdAt: '2024-09-01T08:00:00Z', realizedPnl: 0 },
    ]};
  }
}

