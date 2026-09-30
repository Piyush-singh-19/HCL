import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { MarketService } from "../../core/services/market.service";
import { TradingService } from "../../core/services/trading.service";
import { PortfolioService } from "../../core/services/portfolio.service";
import { AuthService } from "../../core/services/auth.service";
import { NotificationService } from "../../core/services/notification.service";
import { Stock } from "../../core/models/stock.model";
import {
  OrderSide,
  OrderType,
  OrderResponse,
} from "../../core/models/order.model";
import { Holding } from "../../core/models/portfolio.model";

@Component({
  selector: "app-trade",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="trade-page animate-fade-in">
      <!-- Top Header -->
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
      >
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="fw-extrabold text-white mb-0">
              Order Execution Terminal
            </h2>
            <span class="badge bg-emerald-subtle font-mono text-xs"
              >DIRECT DMA TERMINAL</span
            >
          </div>
          <p class="text-secondary text-sm mb-0">
            Place market, limit, and stop-loss orders with instantaneous virtual
            execution.
          </p>
        </div>

        <!-- Available Balance Indicator -->
        <div class="glass-card px-4 py-2 d-flex align-items-center gap-3">
          <div>
            <span class="text-xs text-muted fw-bold d-block"
              >AVAILABLE LIQUID CASH</span
            >
            <span class="font-mono text-emerald fw-bold fs-5">
              ₹{{ authService.currentUser()?.virtualBalance | number: "1.2-2" }}
            </span>
          </div>
          <button
            class="btn btn-glass btn-sm px-2 text-xs"
            (click)="resetBalance()"
            title="Reset to ₹10 Lakhs"
          >
            <i class="fa-solid fa-rotate-left"></i>
          </button>
        </div>
      </div>

      <!-- 3-Column Trading Terminal -->
      <div class="row g-4">
        <!-- Col 1: Asset Watchlist Selector (Left) -->
        <div class="col-lg-3 col-md-5">
          <div class="glass-card p-3 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-white mb-0">Asset Watchlist</h6>
              <span class="text-xs text-muted font-mono"
                >{{ allStocks.length }} Stocks</span
              >
            </div>

            <!-- Search Filter -->
            <div class="mb-3">
              <input
                type="text"
                class="form-control form-control-glass font-mono text-xs"
                [(ngModel)]="searchFilter"
                placeholder="Search symbol..."
              />
            </div>

            <!-- Stock List -->
            <div class="watchlist-scroll">
              <div
                *ngFor="let s of filteredStocks"
                class="watchlist-item p-2 mb-2 rounded-2"
                [class.active]="selectedStock?.symbol === s.symbol"
                (click)="selectStock(s)"
              >
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="font-mono fw-bold text-white fs-6 d-block">{{
                      s.symbol
                    }}</span>
                    <span
                      class="text-xxs text-muted text-truncate d-block"
                      style="max-width: 110px;"
                      >{{ s.name }}</span
                    >
                  </div>
                  <div class="text-end">
                    <span class="font-mono text-white fw-semibold d-block"
                      >₹{{ s.currentPrice | number: "1.2-2" }}</span
                    >
                    <span
                      class="text-xxs font-mono"
                      [ngClass]="
                        s.changePercent >= 0 ? 'text-emerald' : 'text-rose'
                      "
                    >
                      {{ s.changePercent >= 0 ? "+" : ""
                      }}{{ s.changePercent | number: "1.2-2" }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Col 2: Order Entry Panel (Middle) -->
        <div class="col-lg-5 col-md-7">
          <div class="glass-card p-4 h-100" *ngIf="selectedStock">
            <!-- Active Stock Identity -->
            <div
              class="d-flex justify-content-between align-items-center pb-3 border-bottom border-glass mb-4"
            >
              <div>
                <div class="d-flex align-items-center gap-2">
                  <span class="font-mono fs-4 fw-extrabold text-white">{{
                    selectedStock.symbol
                  }}</span>
                  <span class="badge bg-indigo-subtle text-xs">{{
                    selectedStock.sector
                  }}</span>
                </div>
                <div class="text-xs text-secondary">
                  {{ selectedStock.name }}
                </div>
              </div>

              <div class="text-end">
                <div class="font-mono fs-4 fw-bold text-white">
                  ₹{{ selectedStock.currentPrice | number: "1.2-2" }}
                </div>
                <span
                  class="badge-pill"
                  [ngClass]="
                    selectedStock.changePercent >= 0
                      ? 'badge-buy'
                      : 'badge-sell'
                  "
                >
                  <i
                    class="fa-solid"
                    [ngClass]="
                      selectedStock.changePercent >= 0
                        ? 'fa-caret-up'
                        : 'fa-caret-down'
                    "
                  ></i>
                  {{ selectedStock.changePercent >= 0 ? "+" : ""
                  }}{{ selectedStock.changePercent | number: "1.2-2" }}%
                </span>
              </div>
            </div>

            <!-- Buy / Sell Side Selector Tabs -->
            <div class="trade-side-tabs mb-4">
              <button
                type="button"
                class="side-tab buy"
                [class.active]="side === 'BUY'"
                (click)="side = 'BUY'"
              >
                <i class="fa-solid fa-arrow-trend-up me-1"></i> BUY / LONG
              </button>
              <button
                type="button"
                class="side-tab sell"
                [class.active]="side === 'SELL'"
                (click)="side = 'SELL'"
              >
                <i class="fa-solid fa-arrow-trend-down me-1"></i> SELL / CLOSE
              </button>
            </div>

            <!-- Order Type -->
            <div class="form-group mb-3">
              <label class="form-label text-xs text-muted fw-bold"
                >ORDER TYPE</label
              >
              <div class="order-type-group">
                <button
                  type="button"
                  class="type-pill"
                  [class.active]="orderType === 'MARKET'"
                  (click)="orderType = 'MARKET'"
                >
                  Market (Instant)
                </button>
                <button
                  type="button"
                  class="type-pill"
                  [class.active]="orderType === 'LIMIT'"
                  (click)="orderType = 'LIMIT'"
                >
                  Limit Order
                </button>
                <button
                  type="button"
                  class="type-pill"
                  [class.active]="orderType === 'STOP_LOSS'"
                  (click)="orderType = 'STOP_LOSS'"
                >
                  Stop-Loss
                </button>
              </div>
            </div>

            <!-- Quantity & Sliders -->
            <div class="form-group mb-3">
              <div class="d-flex justify-content-between text-xs mb-1">
                <label class="form-label text-xs text-muted fw-bold mb-0"
                  >QUANTITY (SHARES)</label
                >
                <span class="text-muted"
                  >Available:
                  <strong class="text-white">{{ maxAffordable }}</strong></span
                >
              </div>
              <input
                type="number"
                class="form-control form-control-glass font-mono fs-4 text-center fw-bold text-white mb-2"
                [(ngModel)]="quantity"
                min="1"
                [max]="maxAffordable"
                step="1"
              />
              <div class="d-flex gap-2">
                <button
                  class="btn btn-glass btn-sm py-1 flex-fill text-xs"
                  (click)="setQuantity(5)"
                >
                  5
                </button>
                <button
                  class="btn btn-glass btn-sm py-1 flex-fill text-xs"
                  (click)="setQuantity(20)"
                >
                  20
                </button>
                <button
                  class="btn btn-glass btn-sm py-1 flex-fill text-xs"
                  (click)="setQuantity(50)"
                >
                  50
                </button>
                <button
                  class="btn btn-glass btn-sm py-1 flex-fill text-xs"
                  (click)="setQuantity(100)"
                >
                  100
                </button>
                <button
                  class="btn btn-glass btn-sm py-1 flex-fill text-xs"
                  (click)="setQuantity(maxAffordable)"
                  [disabled]="maxAffordable < 1"
                >
                  Max
                </button>
              </div>
            </div>

            <!-- Limit Price (Conditional) -->
            <div class="form-group mb-3" *ngIf="orderType === 'LIMIT'">
              <label class="form-label text-xs text-muted fw-bold"
                >LIMIT TARGET PRICE (₹)</label
              >
              <input
                type="number"
                class="form-control form-control-glass font-mono"
                [(ngModel)]="targetPrice"
                step="0.5"
              />
            </div>

            <!-- Stop Price (Conditional) -->
            <div class="form-group mb-3" *ngIf="orderType === 'STOP_LOSS'">
              <label class="form-label text-xs text-muted fw-bold"
                >STOP-LOSS TRIGGER PRICE (₹)</label
              >
              <input
                type="number"
                class="form-control form-control-glass font-mono"
                [(ngModel)]="stopPrice"
                step="0.5"
              />
            </div>

            <!-- Cost Calculations Summary Box -->
            <div class="breakdown-card p-3 mb-4 rounded-3">
              <div class="d-flex justify-content-between text-xs mb-1">
                <span class="text-muted">Execution Price</span>
                <span class="font-mono text-white"
                  >₹{{ price | number: "1.2-2" }}</span
                >
              </div>
              <div class="d-flex justify-content-between text-xs mb-1">
                <span class="text-muted">Gross Trade Value</span>
                <span class="font-mono text-white fw-bold"
                  >₹{{ estimatedTotal | number: "1.2-2" }}</span
                >
              </div>
              <div class="d-flex justify-content-between text-xs mb-1">
                <span class="text-muted">Regulatory & STT Fees (0.05%)</span>
                <span class="font-mono text-muted"
                  >₹{{ estimatedCharges | number: "1.2-2" }}</span
                >
              </div>
              <div
                class="d-flex justify-content-between text-xs pt-2 border-top border-glass mt-2"
              >
                <span class="text-white fw-bold">Total Margin Required</span>
                <span class="font-mono text-emerald fw-bold fs-6"
                  >₹{{
                    estimatedTotal + estimatedCharges | number: "1.2-2"
                  }}</span
                >
              </div>
            </div>

            <!-- Execute Button -->
            <button
              class="btn w-100 py-3 fw-bold fs-6"
              [ngClass]="side === 'BUY' ? 'btn-emerald' : 'btn-rose'"
              (click)="executeOrder()"
              [disabled]="
                isExecuting || quantity < 1 || quantity > maxAffordable
              "
            >
              <i
                class="fa-solid"
                [ngClass]="
                  isExecuting
                    ? 'fa-spinner fa-spin'
                    : side === 'BUY'
                      ? 'fa-check'
                      : 'fa-paper-plane'
                "
              ></i>
              <span class="ms-2">{{
                side === "BUY" ? "Execute Buy Order" : "Execute Sell Order"
              }}</span>
            </button>
          </div>
        </div>

        <!-- Col 3: Current Position & Stock Detail Snapshot (Right) -->
        <div class="col-lg-4 col-md-12">
          <!-- Position in this Stock -->
          <div class="glass-card p-4 mb-4">
            <h6 class="fw-bold text-white mb-3">Your Current Position</h6>

            <div *ngIf="currentHolding" class="holding-snapshot">
              <div
                class="p-3 rounded-3 mb-3"
                style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2);"
              >
                <div class="d-flex justify-content-between mb-1">
                  <span class="text-xs text-muted fw-bold"
                    >HOLDING QUANTITY</span
                  >
                  <span class="font-mono text-white fw-bold"
                    >{{ currentHolding.quantity }} Shares</span
                  >
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-xs text-muted fw-bold"
                    >UNREALIZED RETURN</span
                  >
                  <span
                    class="font-mono fw-bold"
                    [ngClass]="
                      currentHolding.unrealizedPnl >= 0
                        ? 'text-emerald'
                        : 'text-rose'
                    "
                  >
                    {{ currentHolding.unrealizedPnl >= 0 ? "+" : "" }}₹{{
                      currentHolding.unrealizedPnl | number: "1.2-2"
                    }}
                    ({{
                      currentHolding.unrealizedPnlPercent | number: "1.2-2"
                    }}%)
                  </span>
                </div>
              </div>

              <div class="text-xs font-mono">
                <div
                  class="d-flex justify-content-between py-1 border-bottom border-glass-subtle"
                >
                  <span class="text-muted">Average Buy Price:</span>
                  <span class="text-white fw-bold"
                    >₹{{
                      currentHolding.averageBuyPrice | number: "1.2-2"
                    }}</span
                  >
                </div>
                <div
                  class="d-flex justify-content-between py-1 border-bottom border-glass-subtle"
                >
                  <span class="text-muted">Total Invested:</span>
                  <span class="text-white"
                    >₹{{ currentHolding.totalInvested | number: "1.2-2" }}</span
                  >
                </div>
                <div class="d-flex justify-content-between py-1">
                  <span class="text-muted">Current Value:</span>
                  <span class="text-emerald fw-bold"
                    >₹{{ currentHolding.currentValue | number: "1.2-2" }}</span
                  >
                </div>
              </div>
            </div>

            <div *ngIf="!currentHolding" class="text-center py-4 text-muted">
              <i class="fa-solid fa-folder-open fs-3 mb-2 d-block"></i>
              <span class="text-xs"
                >No open position in {{ selectedStock?.symbol }}.</span
              >
            </div>
          </div>

          <!-- Quick Navigation Links -->
          <div class="glass-card p-4">
            <h6 class="fw-bold text-white mb-3">Asset Quick Actions</h6>
            <div class="d-grid gap-2">
              <a
                [routerLink]="['/market', selectedStock?.symbol]"
                class="btn btn-glass btn-sm text-start py-2"
              >
                <i class="fa-solid fa-chart-candlestick me-2 text-indigo"></i>
                View Candlestick Chart & Details
              </a>
              <a
                [routerLink]="['/analysis', selectedStock?.symbol]"
                class="btn btn-glass btn-sm text-start py-2"
              >
                <i class="fa-solid fa-wand-magic-sparkles me-2 text-cyan"></i>
                View Algorithmic Technical Analysis
              </a>
              <a
                [routerLink]="['/portfolio']"
                class="btn btn-glass btn-sm text-start py-2"
              >
                <i class="fa-solid fa-briefcase me-2 text-emerald"></i> View All
                Portfolio Holdings
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .watchlist-scroll {
        max-height: 480px;
        overflow-y: auto;
      }
      .watchlist-item {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-glass-subtle);
        cursor: pointer;
        transition: all 0.15s;
      }
      .watchlist-item:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(99, 102, 241, 0.3);
      }
      .watchlist-item.active {
        background: rgba(99, 102, 241, 0.15);
        border-color: #6366f1;
      }
      .text-xxs {
        font-size: 0.65rem;
      }
      .trade-side-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: rgba(0, 0, 0, 0.4);
        padding: 4px;
        border-radius: 12px;
        border: 1px solid var(--border-glass);
      }
      .side-tab {
        padding: 10px;
        border: none;
        background: transparent;
        color: var(--text-secondary);
        font-weight: 700;
        font-size: 0.85rem;
        border-radius: 8px;
        cursor: pointer;
      }
      .side-tab.buy.active {
        background: #10b981;
        color: #fff;
      }
      .side-tab.sell.active {
        background: #f43f5e;
        color: #fff;
      }
      .order-type-group {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px;
      }
      .type-pill {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        padding: 8px 4px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
      }
      .type-pill.active {
        background: rgba(99, 102, 241, 0.2);
        border-color: rgba(99, 102, 241, 0.5);
        color: #a5b4fc;
      }
      .breakdown-card {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border-glass-subtle);
      }
    `,
  ],
})
export class TradeComponent implements OnInit {
  route = inject(ActivatedRoute);
  marketService = inject(MarketService);
  tradingService = inject(TradingService);
  portfolioService = inject(PortfolioService);
  authService = inject(AuthService);
  notifyService = inject(NotificationService);

  allStocks: Stock[] = [];
  selectedStock: Stock | null = null;
  searchFilter = "";

  side: OrderSide = "BUY";
  orderType: OrderType = "MARKET";
  quantity = 10;
  targetPrice?: number;
  stopPrice?: number;
  isExecuting = false;

  currentHolding: Holding | null = null;

  ngOnInit(): void {
    this.marketService.getStocks().subscribe((stocks) => {
      this.allStocks = stocks;
      this.route.params.subscribe((params) => {
        const symbol =
          params["symbol"] ||
          (stocks.length > 0 ? stocks[0].symbol : "RELIANCE");
        const found =
          stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase()) ||
          stocks[0];
        this.selectStock(found);
      });
    });
  }

  get filteredStocks(): Stock[] {
    if (!this.searchFilter.trim()) return this.allStocks;
    const q = this.searchFilter.toLowerCase().trim();
    return this.allStocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }

  selectStock(stock: Stock): void {
    this.selectedStock = stock;
    this.targetPrice = stock.currentPrice;
    this.stopPrice = parseFloat((stock.currentPrice * 0.95).toFixed(2));
    this.loadHolding(stock.symbol);
  }

  private loadHolding(symbol: string): void {
    this.portfolioService.getHoldings().subscribe((holdings) => {
      this.currentHolding =
        holdings.find((h) => h.symbol.toUpperCase() === symbol.toUpperCase()) ||
        null;
    });
  }

  setQuantity(qty: number): void {
    this.quantity = Math.max(1, qty);
  }

  get price(): number {
    if (this.orderType === "LIMIT" && this.targetPrice) return this.targetPrice;
    return this.selectedStock ? this.selectedStock.currentPrice : 1000;
  }

  get estimatedTotal(): number {
    return this.price * (this.quantity || 0);
  }

  get estimatedCharges(): number {
    return this.estimatedTotal * 0.0005;
  }

  get maxAffordable(): number {
    if (this.side === "SELL") return this.currentHolding?.quantity ?? 0;
    const user = this.authService.currentUser();
    if (!user || this.price <= 0) return 0;
    return Math.floor(user.virtualBalance / (this.price * 1.0005));
  }

  resetBalance(): void {
    this.authService.resetBalance().subscribe(() => {
      this.notifyService.success(
        "Balance Reset",
        "Reset virtual cash to ₹10,00,000.00",
      );
    });
  }

  executeOrder(): void {
    if (
      !this.selectedStock ||
      !Number.isInteger(this.quantity) ||
      this.quantity < 1 ||
      this.quantity > this.maxAffordable
    ) {
      this.notifyService.error(
        "Invalid order",
        "Check the quantity, available cash, and shares held.",
      );
      return;
    }
    if (
      (this.orderType === "LIMIT" &&
        (!this.targetPrice || this.targetPrice <= 0)) ||
      (this.orderType === "STOP_LOSS" &&
        (!this.stopPrice || this.stopPrice <= 0))
    ) {
      this.notifyService.error(
        "Price required",
        "Enter a valid order trigger price.",
      );
      return;
    }

    this.isExecuting = true;
    this.tradingService
      .placeOrder({
        symbol: this.selectedStock.symbol,
        side: this.side,
        type: this.orderType,
        quantity: this.quantity,
        targetPrice: this.orderType === "LIMIT" ? this.targetPrice : undefined,
        stopPrice: this.orderType === "STOP_LOSS" ? this.stopPrice : undefined,
      })
      .subscribe({
        next: (order) => {
          this.isExecuting = false;
          if (order.status === "REJECTED") {
            this.notifyService.error(
              "Order rejected",
              order.rejectionReason || "The order could not be placed.",
            );
            return;
          }
          this.notifyService.success(
            order.status === "EXECUTED" ? "Order executed" : "Order submitted",
            `${this.side} ${this.quantity} ${this.selectedStock?.symbol} @ ₹${this.price}`,
          );
          if (this.selectedStock) {
            this.loadHolding(this.selectedStock.symbol);
          }
        },
        error: () => {
          this.isExecuting = false;
          this.notifyService.error("Order Failed", "Could not execute order.");
        },
      });
  }
}
