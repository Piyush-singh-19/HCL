import { Injectable } from "@angular/core";
import { Stock, StockPriceHistory } from "../models/stock.model";
import { Holding, PortfolioSummary } from "../models/portfolio.model";
import { OrderResponse } from "../models/order.model";
import { Trade } from "../models/trade.model";
import { RiskReport } from "../models/risk.model";
import { TechnicalAnalysis } from "../models/analysis.model";
import { User, AdminStats } from "../models/user.model";

@Injectable({
  providedIn: "root",
})
export class MockDataService {
  private stocks: Stock[] = [
    {
      id: 1,
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd.",
      sector: "Energy & Conglomerate",
      currentPrice: 2984.5,
      previousClose: 2940.0,
      dayOpen: 2945.0,
      dayHigh: 3010.0,
      dayLow: 2938.1,
      changeAmount: 44.5,
      changePercent: 1.51,
      volume: 4829100,
      marketCap: "₹20.19 Lakh Cr",
      peRatio: 28.4,
      week52High: 3024.9,
      week52Low: 2220.3,
      eps: 105.08,
      beta: 1.05,
      dividendYield: 0.34,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [2920, 2935, 2910, 2950, 2940, 2975, 2984.5],
    },
    {
      id: 2,
      symbol: "TCS",
      name: "Tata Consultancy Services",
      sector: "Information Technology",
      currentPrice: 4268.0,
      previousClose: 4310.0,
      dayOpen: 4300.0,
      dayHigh: 4325.0,
      dayLow: 4250.0,
      changeAmount: -42.0,
      changePercent: -0.97,
      volume: 2150400,
      marketCap: "₹15.44 Lakh Cr",
      peRatio: 31.8,
      week52High: 4585.0,
      week52Low: 3313.0,
      eps: 134.2,
      beta: 0.78,
      dividendYield: 1.25,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [4350, 4320, 4330, 4310, 4290, 4270, 4268],
    },
    {
      id: 3,
      symbol: "HDFCBANK",
      name: "HDFC Bank Limited",
      sector: "Banking & Financials",
      currentPrice: 1664.2,
      previousClose: 1642.5,
      dayOpen: 1645.0,
      dayHigh: 1675.0,
      dayLow: 1641.0,
      changeAmount: 21.7,
      changePercent: 1.32,
      volume: 9812400,
      marketCap: "₹12.65 Lakh Cr",
      peRatio: 18.9,
      week52High: 1794.0,
      week52Low: 1363.55,
      eps: 88.05,
      beta: 0.92,
      dividendYield: 1.17,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [1630, 1638, 1645, 1640, 1655, 1660, 1664.2],
    },
    {
      id: 4,
      symbol: "INFY",
      name: "Infosys Limited",
      sector: "Information Technology",
      currentPrice: 1892.4,
      previousClose: 1870.0,
      dayOpen: 1875.0,
      dayHigh: 1905.0,
      dayLow: 1868.0,
      changeAmount: 22.4,
      changePercent: 1.2,
      volume: 5310000,
      marketCap: "₹7.86 Lakh Cr",
      peRatio: 29.1,
      week52High: 1991.45,
      week52Low: 1358.35,
      eps: 65.02,
      beta: 0.88,
      dividendYield: 1.95,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [1840, 1860, 1855, 1870, 1885, 1880, 1892.4],
    },
    {
      id: 5,
      symbol: "ICICIBANK",
      name: "ICICI Bank Ltd.",
      sector: "Banking & Financials",
      currentPrice: 1248.8,
      previousClose: 1232.0,
      dayOpen: 1235.0,
      dayHigh: 1255.0,
      dayLow: 1230.5,
      changeAmount: 16.8,
      changePercent: 1.36,
      volume: 7420100,
      marketCap: "₹8.77 Lakh Cr",
      peRatio: 19.4,
      week52High: 1310.0,
      week52Low: 915.0,
      eps: 64.37,
      beta: 1.1,
      dividendYield: 0.8,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [1210, 1225, 1220, 1232, 1240, 1245, 1248.8],
    },
    {
      id: 6,
      symbol: "TATAMOTORS",
      name: "Tata Motors Limited",
      sector: "Automobile",
      currentPrice: 978.5,
      previousClose: 995.0,
      dayOpen: 990.0,
      dayHigh: 1002.0,
      dayLow: 972.0,
      changeAmount: -16.5,
      changePercent: -1.66,
      volume: 8900400,
      marketCap: "₹3.60 Lakh Cr",
      peRatio: 11.2,
      week52High: 1179.05,
      week52Low: 608.3,
      eps: 87.36,
      beta: 1.45,
      dividendYield: 0.61,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [1020, 1010, 998, 995, 988, 982, 978.5],
    },
    {
      id: 7,
      symbol: "BHARTIARTL",
      name: "Bharti Airtel Ltd.",
      sector: "Telecommunications",
      currentPrice: 1715.0,
      previousClose: 1680.0,
      dayOpen: 1685.0,
      dayHigh: 1724.0,
      dayLow: 1682.0,
      changeAmount: 35.0,
      changePercent: 2.08,
      volume: 3840000,
      marketCap: "₹9.82 Lakh Cr",
      peRatio: 52.6,
      week52High: 1779.0,
      week52Low: 902.0,
      eps: 32.6,
      beta: 0.72,
      dividendYield: 0.47,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [1650, 1665, 1670, 1680, 1700, 1710, 1715],
    },
    {
      id: 8,
      symbol: "ITC",
      name: "ITC Limited",
      sector: "FMCG & Consumer",
      currentPrice: 512.3,
      previousClose: 508.0,
      dayOpen: 509.0,
      dayHigh: 515.0,
      dayLow: 507.2,
      changeAmount: 4.3,
      changePercent: 0.85,
      volume: 12450000,
      marketCap: "₹6.39 Lakh Cr",
      peRatio: 30.5,
      week52High: 528.55,
      week52Low: 399.3,
      eps: 16.79,
      beta: 0.55,
      dividendYield: 2.68,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [500, 503, 506, 508, 510, 511, 512.3],
    },
    {
      id: 9,
      symbol: "BAJFINANCE",
      name: "Bajaj Finance Limited",
      sector: "Banking & Financials",
      currentPrice: 7390.0,
      previousClose: 7480.0,
      dayOpen: 7460.0,
      dayHigh: 7510.0,
      dayLow: 7350.0,
      changeAmount: -90.0,
      changePercent: -1.2,
      volume: 1120000,
      marketCap: "₹4.57 Lakh Cr",
      peRatio: 31.4,
      week52High: 8192.0,
      week52Low: 6375.0,
      eps: 235.35,
      beta: 1.28,
      dividendYield: 0.49,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [7520, 7490, 7500, 7480, 7420, 7405, 7390],
    },
    {
      id: 10,
      symbol: "SUNPHARMA",
      name: "Sun Pharmaceutical Ind.",
      sector: "Healthcare & Pharma",
      currentPrice: 1910.75,
      previousClose: 1875.0,
      dayOpen: 1880.0,
      dayHigh: 1925.0,
      dayLow: 1872.0,
      changeAmount: 35.75,
      changePercent: 1.91,
      volume: 2450000,
      marketCap: "₹4.58 Lakh Cr",
      peRatio: 41.2,
      week52High: 1960.0,
      week52Low: 1095.0,
      eps: 46.37,
      beta: 0.62,
      dividendYield: 0.71,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [1840, 1855, 1860, 1875, 1890, 1905, 1910.75],
    },
    {
      id: 11,
      symbol: "TITAN",
      name: "Titan Company Limited",
      sector: "FMCG & Consumer",
      currentPrice: 3450.0,
      previousClose: 3420.0,
      dayOpen: 3425.0,
      dayHigh: 3480.0,
      dayLow: 3410.0,
      changeAmount: 30.0,
      changePercent: 0.88,
      volume: 1350000,
      marketCap: "₹3.06 Lakh Cr",
      peRatio: 88.5,
      week52High: 3886.95,
      week52Low: 3055.65,
      eps: 38.98,
      beta: 0.84,
      dividendYield: 0.32,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [3380, 3400, 3415, 3420, 3435, 3440, 3450],
    },
    {
      id: 12,
      symbol: "LT",
      name: "Larsen & Toubro Ltd.",
      sector: "Infrastructure & Capital Goods",
      currentPrice: 3620.0,
      previousClose: 3660.0,
      dayOpen: 3655.0,
      dayHigh: 3680.0,
      dayLow: 3605.0,
      changeAmount: -40.0,
      changePercent: -1.09,
      volume: 1980000,
      marketCap: "₹4.98 Lakh Cr",
      peRatio: 36.8,
      week52High: 3919.9,
      week52Low: 2865.0,
      eps: 98.37,
      beta: 1.15,
      dividendYield: 0.94,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [3700, 3680, 3690, 3660, 3640, 3630, 3620],
    },
  ];

  private readonly storageKey = "portfoliopro_market_state";

  constructor() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;
      const state = JSON.parse(saved);
      if (Array.isArray(state.stocks)) this.stocks = state.stocks;
      if (Array.isArray(state.holdings)) this.holdings = state.holdings;
      if (Array.isArray(state.orders)) this.orders = state.orders;
      if (Array.isArray(state.trades)) this.trades = state.trades;
      if (Array.isArray(state.users)) this.users = state.users;
      if (state.currentUser) this.currentUser = state.currentUser;
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }

  private persist(): void {
    try {
      const currentUserIndex = this.users.findIndex(
        (user) => user.id === this.currentUser.id,
      );
      if (currentUserIndex < 0) this.users.push({ ...this.currentUser });
      else this.users[currentUserIndex] = { ...this.currentUser };
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          stocks: this.stocks,
          holdings: this.holdings,
          orders: this.orders,
          trades: this.trades,
          users: this.users,
          currentUser: this.currentUser,
        }),
      );
    } catch {
      // The app remains usable when browser storage is unavailable.
    }
  }

  private currentUser: User = {
    id: 1,
    username: "piyush_trader",
    email: "piyush.trader@portfoliopro.io",
    fullName: "Piyush Singh",
    virtualBalance: 784520.0,
    realizedPnl: 48560.0,
    role: "ROLE_ADMIN",
    isActive: true,
    createdAt: "2025-01-15T10:00:00Z",
  };

  private holdings: Holding[] = [
    {
      id: 101,
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd.",
      sector: "Energy & Conglomerate",
      quantity: 50,
      averageBuyPrice: 2840.0,
      currentPrice: 2984.5,
      totalInvested: 142000.0,
      currentValue: 149225.0,
      unrealizedPnl: 7225.0,
      unrealizedPnlPercent: 5.09,
      allocationPercent: 32.4,
    },
    {
      id: 102,
      symbol: "INFY",
      name: "Infosys Limited",
      sector: "Information Technology",
      quantity: 60,
      averageBuyPrice: 1750.0,
      currentPrice: 1892.4,
      totalInvested: 105000.0,
      currentValue: 113544.0,
      unrealizedPnl: 8544.0,
      unrealizedPnlPercent: 8.14,
      allocationPercent: 24.6,
    },
    {
      id: 103,
      symbol: "HDFCBANK",
      name: "HDFC Bank Limited",
      sector: "Banking & Financials",
      quantity: 70,
      averageBuyPrice: 1590.0,
      currentPrice: 1664.2,
      totalInvested: 111300.0,
      currentValue: 116494.0,
      unrealizedPnl: 5194.0,
      unrealizedPnlPercent: 4.67,
      allocationPercent: 25.3,
    },
    {
      id: 104,
      symbol: "SUNPHARMA",
      name: "Sun Pharmaceutical Ind.",
      sector: "Healthcare & Pharma",
      quantity: 42,
      averageBuyPrice: 1780.0,
      currentPrice: 1910.75,
      totalInvested: 74760.0,
      currentValue: 80251.5,
      unrealizedPnl: 5491.5,
      unrealizedPnlPercent: 7.35,
      allocationPercent: 17.7,
    },
  ];

  private orders: OrderResponse[] = [
    {
      id: 9001,
      symbol: "RELIANCE",
      stockName: "Reliance Industries Ltd.",
      side: "BUY",
      type: "MARKET",
      quantity: 50,
      filledQuantity: 50,
      status: "EXECUTED",
      createdAt: "2026-09-28T10:15:00",
      executedAt: "2026-09-28T10:15:02",
    },
    {
      id: 9002,
      symbol: "INFY",
      stockName: "Infosys Limited",
      side: "BUY",
      type: "MARKET",
      quantity: 60,
      filledQuantity: 60,
      status: "EXECUTED",
      createdAt: "2026-09-28T11:30:00",
      executedAt: "2026-09-28T11:30:01",
    },
    {
      id: 9003,
      symbol: "TATAMOTORS",
      stockName: "Tata Motors Limited",
      side: "BUY",
      type: "LIMIT",
      quantity: 40,
      filledQuantity: 0,
      targetPrice: 960.0,
      status: "PENDING",
      createdAt: "2026-09-30T09:15:00",
    },
    {
      id: 9004,
      symbol: "TCS",
      stockName: "Tata Consultancy Services",
      side: "BUY",
      type: "STOP_LOSS",
      quantity: 15,
      filledQuantity: 0,
      stopPrice: 4200.0,
      status: "PENDING",
      createdAt: "2026-09-30T09:20:00",
    },
    {
      id: 9005,
      symbol: "BAJFINANCE",
      stockName: "Bajaj Finance Limited",
      side: "BUY",
      type: "LIMIT",
      quantity: 10,
      filledQuantity: 0,
      targetPrice: 7200.0,
      status: "CANCELLED",
      createdAt: "2026-09-25T14:10:00",
    },
  ];

  private trades: Trade[] = [
    {
      id: 5001,
      orderId: 9001,
      symbol: "RELIANCE",
      stockName: "Reliance Industries Ltd.",
      side: "BUY",
      quantity: 50,
      price: 2840.0,
      totalAmount: 142000.0,
      realizedPnl: 0,
      executedAt: "2026-09-28T10:15:02",
    },
    {
      id: 5002,
      orderId: 9002,
      symbol: "INFY",
      stockName: "Infosys Limited",
      side: "BUY",
      quantity: 60,
      price: 1750.0,
      totalAmount: 105000.0,
      realizedPnl: 0,
      executedAt: "2026-09-28T11:30:01",
    },
    {
      id: 5003,
      orderId: 8990,
      symbol: "TCS",
      stockName: "Tata Consultancy Services",
      side: "SELL",
      quantity: 20,
      price: 4350.0,
      totalAmount: 87000.0,
      realizedPnl: 14200.0,
      executedAt: "2026-09-27T15:10:00",
    },
    {
      id: 5004,
      orderId: 8985,
      symbol: "ICICIBANK",
      stockName: "ICICI Bank Ltd.",
      side: "SELL",
      quantity: 80,
      price: 1250.0,
      totalAmount: 100000.0,
      realizedPnl: 18400.0,
      executedAt: "2026-09-26T12:45:00",
    },
    {
      id: 5005,
      orderId: 8970,
      symbol: "BHARTIARTL",
      stockName: "Bharti Airtel Ltd.",
      side: "SELL",
      quantity: 50,
      price: 1700.0,
      totalAmount: 85000.0,
      realizedPnl: 15960.0,
      executedAt: "2026-09-24T14:20:00",
    },
  ];

  private users: User[] = [
    {
      id: 1,
      username: "piyush_trader",
      email: "piyush.trader@portfoliopro.io",
      fullName: "Piyush Singh",
      virtualBalance: 784520.0,
      realizedPnl: 48560.0,
      role: "ROLE_ADMIN",
      isActive: true,
      createdAt: "2025-01-15T10:00:00Z",
    },
    {
      id: 2,
      username: "aarav_sharma",
      email: "aarav@quantfund.in",
      fullName: "Aarav Sharma",
      virtualBalance: 950400.0,
      realizedPnl: 32400.0,
      role: "ROLE_USER",
      isActive: true,
      createdAt: "2025-02-10T09:30:00Z",
    },
    {
      id: 3,
      username: "neha_patel",
      email: "neha.patel@investpro.com",
      fullName: "Neha Patel",
      virtualBalance: 1210800.0,
      realizedPnl: 85200.0,
      role: "ROLE_USER",
      isActive: true,
      createdAt: "2025-03-01T14:15:00Z",
    },
    {
      id: 4,
      username: "rohit_verma",
      email: "rohit.v@techtrader.org",
      fullName: "Rohit Verma",
      virtualBalance: 410000.0,
      realizedPnl: -14500.0,
      role: "ROLE_USER",
      isActive: false,
      createdAt: "2025-03-12T11:45:00Z",
    },
  ];

  getStocks(): Stock[] {
    return this.stocks.map((stock) => ({
      ...stock,
      sparkline: [...(stock.sparkline ?? [])],
    }));
  }

  updateStockPrices(stocks: Stock[]): void {
    this.stocks = stocks.map((stock) => ({
      ...stock,
      sparkline: [...(stock.sparkline ?? [])],
    }));
    this.holdings.forEach((holding) => {
      const stock = this.getStockBySymbol(holding.symbol);
      if (!stock) return;
      holding.currentPrice = stock.currentPrice;
      holding.currentValue = holding.quantity * stock.currentPrice;
      holding.unrealizedPnl = holding.currentValue - holding.totalInvested;
      holding.unrealizedPnlPercent =
        holding.totalInvested > 0
          ? (holding.unrealizedPnl / holding.totalInvested) * 100
          : 0;
    });
    this.persist();
  }

  getStockBySymbol(symbol: string): Stock | undefined {
    return this.stocks.find(
      (s) => s.symbol.toUpperCase() === symbol.toUpperCase(),
    );
  }

  getHoldings(): Holding[] {
    return [...this.holdings];
  }

  getPortfolioSummary(): PortfolioSummary {
    const totalInvested = this.holdings.reduce(
      (sum, h) => sum + h.totalInvested,
      0,
    );
    const currentHoldingsValue = this.holdings.reduce(
      (sum, h) => sum + h.currentValue,
      0,
    );
    const totalUnrealizedPnl = currentHoldingsValue - totalInvested;
    const totalRealizedPnl = this.currentUser.realizedPnl;
    const totalPnl = totalUnrealizedPnl + totalRealizedPnl;
    const cashBalance = this.currentUser.virtualBalance;
    const netWorth = cashBalance + currentHoldingsValue;
    const totalReturnPercent =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    this.holdings.forEach((holding) => {
      holding.allocationPercent =
        currentHoldingsValue > 0
          ? Number(
              ((holding.currentValue / currentHoldingsValue) * 100).toFixed(1),
            )
          : 0;
    });

    const allocationLabels = this.holdings.map((h) => h.symbol);
    const allocationValues = this.holdings.map((h) => {
      return currentHoldingsValue > 0
        ? parseFloat(((h.currentValue / currentHoldingsValue) * 100).toFixed(1))
        : 0;
    });

    const sectorMap = new Map<string, number>();
    this.holdings.forEach((h) => {
      sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.currentValue);
    });

    const sectorLabels = Array.from(sectorMap.keys());
    const sectorValues = Array.from(sectorMap.values()).map((v) =>
      currentHoldingsValue > 0
        ? parseFloat(((v / currentHoldingsValue) * 100).toFixed(1))
        : 0,
    );

    return {
      cashBalance,
      totalInvested,
      currentHoldingsValue,
      netWorth,
      totalUnrealizedPnl,
      totalRealizedPnl,
      totalPnl,
      totalReturnPercent,
      holdings: this.holdings,
      allocationLabels,
      allocationValues,
      sectorLabels,
      sectorValues,
    };
  }

  getOrders(): OrderResponse[] {
    return [...this.orders];
  }

  getTrades(): Trade[] {
    return [...this.trades];
  }

  getCurrentUser(): User {
    return { ...this.currentUser };
  }

  setCurrentUser(user: User): void {
    this.currentUser = { ...user };
    const index = this.users.findIndex((item) => item.id === user.id);
    if (index < 0) this.users.push({ ...user });
    else this.users[index] = { ...user };
    this.persist();
  }

  loginUser(username: string): User {
    const normalizedUsername = username.trim() || this.currentUser.username;
    const requestedName = normalizedUsername.toLowerCase();
    const existing =
      requestedName === "admin"
        ? this.users.find((user) => user.role === "ROLE_ADMIN")
        : requestedName === "trader"
          ? this.users.find((user) => user.role === "ROLE_USER")
          : this.users.find(
              (user) => user.username.toLowerCase() === requestedName,
            );
    if (existing) {
      this.currentUser = { ...existing };
    } else {
      this.currentUser = {
        id: Math.max(0, ...this.users.map((user) => user.id)) + 1,
        username: normalizedUsername,
        email: `${normalizedUsername}@portfoliopro.local`,
        fullName: normalizedUsername
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase()),
        virtualBalance: 1000000,
        realizedPnl: 0,
        role: "ROLE_USER",
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      this.users.push({ ...this.currentUser });
    }
    this.persist();
    return { ...this.currentUser };
  }

  registerUser(userData: {
    username: string;
    email: string;
    fullName: string;
  }): User {
    const user: User = {
      id: Math.max(0, ...this.users.map((existing) => existing.id)) + 1,
      username: userData.username.trim(),
      email: userData.email.trim(),
      fullName: userData.fullName.trim(),
      virtualBalance: 1000000,
      realizedPnl: 0,
      role: "ROLE_USER",
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    this.currentUser = { ...user };
    this.persist();
    return { ...user };
  }

  updateProfile(fullName: string, email: string): User {
    this.currentUser.fullName = fullName;
    this.currentUser.email = email;
    this.persist();
    return { ...this.currentUser };
  }

  resetBalance(): User {
    this.currentUser.virtualBalance = 1000000.0;
    this.persist();
    return { ...this.currentUser };
  }

  addFunds(amount: number): User {
    this.currentUser.virtualBalance += amount;
    this.persist();
    return { ...this.currentUser };
  }

  placeOrder(order: {
    symbol: string;
    side: "BUY" | "SELL";
    type: "MARKET" | "LIMIT" | "STOP_LOSS";
    quantity: number;
    targetPrice?: number;
    stopPrice?: number;
  }): OrderResponse {
    const stock = this.getStockBySymbol(order.symbol);
    const executionPrice = stock ? stock.currentPrice : 1000;
    const isMarket = order.type === "MARKET";
    const totalCost = executionPrice * order.quantity;
    const charges = totalCost * 0.0005;
    const holding = this.holdings.find(
      (item) => item.symbol.toUpperCase() === order.symbol.toUpperCase(),
    );
    const rejectionReason =
      !Number.isInteger(order.quantity) || order.quantity < 1
        ? "Quantity must be a positive whole number."
        : order.side === "BUY" &&
            isMarket &&
            this.currentUser.virtualBalance < totalCost + charges
          ? "Insufficient virtual cash."
          : order.side === "SELL" &&
              isMarket &&
              (!holding || holding.quantity < order.quantity)
            ? "Not enough shares in this position."
            : undefined;
    const status = rejectionReason
      ? "REJECTED"
      : isMarket
        ? "EXECUTED"
        : "PENDING";

    const newOrder: OrderResponse = {
      id: Math.floor(1000 + Math.random() * 90000),
      symbol: order.symbol.toUpperCase(),
      stockName: stock ? stock.name : order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity,
      filledQuantity: isMarket && !rejectionReason ? order.quantity : 0,
      targetPrice: order.targetPrice,
      stopPrice: order.stopPrice,
      status: status,
      rejectionReason,
      createdAt: new Date().toISOString(),
      executedAt: isMarket ? new Date().toISOString() : undefined,
    };

    this.orders.unshift(newOrder);

    if (rejectionReason) {
      this.persist();
      return newOrder;
    }

    if (isMarket) {
      if (order.side === "BUY") {
        this.currentUser.virtualBalance -= totalCost + charges;
        const existingHolding = this.holdings.find(
          (h) => h.symbol.toUpperCase() === order.symbol.toUpperCase(),
        );
        if (existingHolding) {
          const newQty = existingHolding.quantity + order.quantity;
          const newInvested = existingHolding.totalInvested + totalCost;
          existingHolding.quantity = newQty;
          existingHolding.totalInvested = newInvested;
          existingHolding.averageBuyPrice = newInvested / newQty;
          existingHolding.currentValue = newQty * existingHolding.currentPrice;
          existingHolding.unrealizedPnl =
            existingHolding.currentValue - newInvested;
          existingHolding.unrealizedPnlPercent =
            (existingHolding.unrealizedPnl / newInvested) * 100;
        } else {
          this.holdings.push({
            id: Math.floor(100 + Math.random() * 900),
            symbol: order.symbol.toUpperCase(),
            name: stock ? stock.name : order.symbol,
            sector: stock ? stock.sector : "General",
            quantity: order.quantity,
            averageBuyPrice: executionPrice,
            currentPrice: executionPrice,
            totalInvested: totalCost,
            currentValue: totalCost,
            unrealizedPnl: 0,
            unrealizedPnlPercent: 0,
            allocationPercent: 10,
          });
        }
      } else {
        // SELL
        this.currentUser.virtualBalance += totalCost - charges;
        const holdingIndex = this.holdings.findIndex(
          (h) => h.symbol.toUpperCase() === order.symbol.toUpperCase(),
        );
        let realizedProfit = 0;
        if (holdingIndex !== -1) {
          const h = this.holdings[holdingIndex];
          const soldQty = order.quantity;
          const costBasis = soldQty * h.averageBuyPrice;
          realizedProfit = soldQty * executionPrice - costBasis;
          this.currentUser.realizedPnl += realizedProfit;

          if (h.quantity <= order.quantity) {
            this.holdings.splice(holdingIndex, 1);
          } else {
            h.quantity -= order.quantity;
            h.totalInvested = h.quantity * h.averageBuyPrice;
            h.currentValue = h.quantity * h.currentPrice;
            h.unrealizedPnl = h.currentValue - h.totalInvested;
            h.unrealizedPnlPercent = (h.unrealizedPnl / h.totalInvested) * 100;
          }
        }

        const newTrade: Trade = {
          id: Math.floor(1000 + Math.random() * 90000),
          orderId: newOrder.id,
          symbol: order.symbol.toUpperCase(),
          stockName: stock ? stock.name : order.symbol,
          side: order.side,
          quantity: order.quantity,
          price: executionPrice,
          totalAmount: totalCost,
          realizedPnl: realizedProfit,
          executedAt: new Date().toISOString(),
        };
        this.trades.unshift(newTrade);
        this.persist();
        return newOrder;
      }

      const newTrade: Trade = {
        id: Math.floor(1000 + Math.random() * 90000),
        orderId: newOrder.id,
        symbol: order.symbol.toUpperCase(),
        stockName: stock ? stock.name : order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: executionPrice,
        totalAmount: totalCost,
        realizedPnl: 0,
        executedAt: new Date().toISOString(),
      };
      this.trades.unshift(newTrade);
    }

    this.persist();
    return newOrder;
  }

  cancelOrder(orderId: number): OrderResponse | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (order && order.status === "PENDING") {
      order.status = "CANCELLED";
      this.persist();
      return { ...order };
    }
    return null;
  }

  getRiskReport(): RiskReport {
    const summary = this.getPortfolioSummary();
    const assetWeights: { [symbol: string]: number } = {};
    let topWeight = 0;
    let weightedBeta = 0;

    this.holdings.forEach((h) => {
      const weight =
        summary.currentHoldingsValue > 0
          ? (h.currentValue / summary.currentHoldingsValue) * 100
          : 0;
      assetWeights[h.symbol] = parseFloat(weight.toFixed(1));
      weightedBeta +=
        (weight / 100) * (this.getStockBySymbol(h.symbol)?.beta ?? 1);
      if (weight > topWeight) topWeight = weight;
    });

    const portfolioVolatility = this.holdings.length
      ? 12 + weightedBeta * 5
      : 0;
    const valueAtRisk95Percent = (portfolioVolatility * 1.645) / Math.sqrt(252);
    const valueAtRisk95 =
      (summary.currentHoldingsValue * valueAtRisk95Percent) / 100;
    const riskScore = Math.min(
      100,
      Math.round(topWeight * 0.55 + portfolioVolatility * 1.3),
    );
    const warnings: string[] = [];
    if (!this.holdings.length)
      warnings.push(
        "No open positions. Risk metrics will populate after a trade.",
      );
    if (topWeight > 25)
      warnings.push(
        `Largest position is ${topWeight.toFixed(1)}% of holdings, above the 25% concentration guide.`,
      );
    if (weightedBeta > 1.2)
      warnings.push(
        `Portfolio beta is ${weightedBeta.toFixed(2)}, indicating above-market sensitivity.`,
      );
    if (valueAtRisk95 > 0)
      warnings.push(
        `Estimated one-day 95% value at risk is ₹${valueAtRisk95.toFixed(0)}.`,
      );
    const riskLevel =
      riskScore >= 75
        ? "EXTREME"
        : riskScore >= 55
          ? "HIGH"
          : riskScore >= 30
            ? "MODERATE"
            : "LOW";

    return {
      portfolioVolatility: Number(portfolioVolatility.toFixed(2)),
      concentrationRiskIndex: parseFloat(topWeight.toFixed(1)),
      maxDrawdown: Number((portfolioVolatility * 0.5).toFixed(2)),
      valueAtRisk95: Number(valueAtRisk95.toFixed(2)),
      valueAtRisk95Percent: Number(valueAtRisk95Percent.toFixed(2)),
      portfolioBeta: Number(weightedBeta.toFixed(2)),
      riskLevel,
      riskScore,
      warnings,
      assetWeights,
    };
  }

  getTechnicalAnalysis(symbol: string): TechnicalAnalysis {
    const stock = this.getStockBySymbol(symbol) || this.stocks[0];
    const price = stock.currentPrice;

    return {
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: price,
      sma20: parseFloat((price * 0.985).toFixed(2)),
      sma50: parseFloat((price * 0.962).toFixed(2)),
      ema12: parseFloat((price * 0.992).toFixed(2)),
      ema26: parseFloat((price * 0.978).toFixed(2)),
      rsi14: 58.4,
      rsiCondition: "Neutral Bullish",
      macdLine: 18.45,
      signalLine: 12.2,
      macdHistogram: 6.25,
      macdSignal: "Bullish Crossover",
      bbUpper: parseFloat((price * 1.045).toFixed(2)),
      bbMiddle: parseFloat((price * 0.995).toFixed(2)),
      bbLower: parseFloat((price * 0.945).toFixed(2)),
      bbCondition: "Expanding Bands (High Volatility)",
      overallSignal: "BUY",
      bullishScore: 78,
      signalReason:
        "Bullish momentum reinforced by MACD golden cross and price trading above 20-day and 50-day moving averages.",
      signalBreakdown: [
        "RSI (14) at 58.4 indicating healthy upward momentum without overbought stress.",
        "Price is above both 20-SMA and 50-SMA indicating strong medium-term uptrend.",
        "MACD Histogram (+6.25) shows expanding positive momentum.",
        "Bollinger Band upper expansion suggests potential breakout upside.",
      ],
      history: this.generateStockHistory(stock.currentPrice),
    };
  }

  generateStockHistory(currentPrice: number): StockPriceHistory[] {
    const history: StockPriceHistory[] = [];
    let base = currentPrice * 0.88;
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const fluctuation = (Math.random() - 0.47) * (base * 0.025);
      base += fluctuation;
      const open = base;
      const high = base + Math.random() * base * 0.015;
      const low = base - Math.random() * base * 0.015;
      const close = (open + high + low) / 3;
      const volume = Math.floor(1000000 + Math.random() * 4000000);

      history.push({
        date: d.toISOString().split("T")[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
      });
    }

    // Ensure the last one matches current price
    if (history.length > 0) {
      history[history.length - 1].close = currentPrice;
    }

    return history;
  }

  getAdminStats(): AdminStats {
    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter((user) => user.isActive).length,
      totalOrders: this.orders.length,
      executedTrades: this.trades.length,
      totalTradingVolume: this.trades.reduce(
        (sum, trade) => sum + trade.totalAmount,
        0,
      ),
      totalStocksListed: this.stocks.length,
    };
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  updateUser(
    id: number,
    balance?: number,
    role?: string,
    isActive?: boolean,
  ): User | null {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      if (balance !== undefined && balance !== null)
        user.virtualBalance = balance;
      if (role) user.role = role as any;
      if (isActive !== undefined && isActive !== null) user.isActive = isActive;
      this.persist();
      return { ...user };
    }
    return null;
  }

  createStock(stock: Partial<Stock>): Stock {
    const newStock: Stock = {
      id: Math.floor(100 + Math.random() * 900),
      symbol: (stock.symbol || "NEWSTOCK").toUpperCase(),
      name: stock.name || "New Listed Stock",
      sector: stock.sector || "General",
      currentPrice: stock.currentPrice || 1000.0,
      previousClose: stock.previousClose || stock.currentPrice || 1000.0,
      dayOpen: stock.dayOpen || stock.currentPrice || 1000.0,
      dayHigh: stock.dayHigh || (stock.currentPrice || 1000.0) * 1.02,
      dayLow: stock.dayLow || (stock.currentPrice || 1000.0) * 0.98,
      changeAmount: 0,
      changePercent: 0,
      volume: stock.volume || 500000,
      marketCap: stock.marketCap || "₹1.00 Lakh Cr",
      peRatio: stock.peRatio || 25.0,
      week52High: stock.week52High || (stock.currentPrice || 1000.0) * 1.25,
      week52Low: stock.week52Low || (stock.currentPrice || 1000.0) * 0.75,
      eps: stock.eps || 40.0,
      beta: stock.beta || 1.0,
      dividendYield: stock.dividendYield || 0.5,
      isActive: true,
      updatedAt: new Date().toISOString(),
      sparkline: [980, 990, 1000, 1005, 995, 1010, 1000],
    };
    this.stocks.push(newStock);
    this.persist();
    return newStock;
  }

  updateStock(id: number, stockData: Partial<Stock>): Stock | null {
    const stock = this.stocks.find((s) => s.id === id);
    if (stock) {
      Object.assign(stock, stockData);
      stock.updatedAt = new Date().toISOString();
      this.persist();
      return { ...stock };
    }
    return null;
  }
}
