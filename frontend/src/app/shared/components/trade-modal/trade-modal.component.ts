import {
  Component,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Stock } from "../../../core/models/stock.model";
import { OrderSide, OrderType } from "../../../core/models/order.model";
import { TradingService } from "../../../core/services/trading.service";
import { AuthService } from "../../../core/services/auth.service";
import { NotificationService } from "../../../core/services/notification.service";
import { MarketService } from "../../../core/services/market.service";
import { PortfolioService } from "../../../core/services/portfolio.service";
import { Holding } from "../../../core/models/portfolio.model";

@Component({
  selector: "app-trade-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="stock-identity">
            <div class="symbol-badge font-mono">
              {{ selectedStock?.symbol || "TRADE" }}
            </div>
            <div>
              <div class="stock-name">
                {{ selectedStock?.name || "Quick Trade" }}
              </div>
              <div class="stock-price font-mono">
                ₹{{ selectedStock?.currentPrice | number: "1.2-2" }}
                <span
                  [ngClass]="
                    (selectedStock?.changePercent || 0) >= 0
                      ? 'text-emerald'
                      : 'text-rose'
                  "
                  class="ms-1 text-xs"
                >
                  {{ (selectedStock?.changePercent || 0) >= 0 ? "+" : ""
                  }}{{ selectedStock?.changePercent | number: "1.2-2" }}%
                </span>
              </div>
            </div>
          </div>
          <button class="close-btn" (click)="close()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Buy / Sell Toggle Tabs -->
          <div class="trade-side-tabs">
            <button
              type="button"
              class="side-tab buy"
              [class.active]="side === 'BUY'"
              (click)="side = 'BUY'"
            >
              <i class="fa-solid fa-arrow-trend-up me-1"></i> BUY
            </button>
            <button
              type="button"
              class="side-tab sell"
              [class.active]="side === 'SELL'"
              (click)="side = 'SELL'"
            >
              <i class="fa-solid fa-arrow-trend-down me-1"></i> SELL
            </button>
          </div>

          <!-- Stock Selector (if opening modal without pre-selected stock) -->
          <div class="form-group mb-3" *ngIf="!stock">
            <label class="form-label text-xs text-muted fw-bold"
              >SELECT ASSET</label
            >
            <select
              class="form-control form-control-glass font-mono"
              [(ngModel)]="selectedSymbol"
              (change)="onSymbolChange()"
            >
              <option *ngFor="let s of allStocks" [value]="s.symbol">
                {{ s.symbol }} - {{ s.name }} (₹{{
                  s.currentPrice | number: "1.2-2"
                }})
              </option>
            </select>
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
                Limit
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

          <!-- Quantity Input & Quick Quantity Pills -->
          <div class="form-group mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label text-xs text-muted fw-bold mb-0"
                >QUANTITY (SHARES)</label
              >
              <span class="text-xs text-muted"
                >Max: {{ maxAffordableQuantity }} shares</span
              >
            </div>
            <div class="input-group">
              <input
                type="number"
                class="form-control form-control-glass font-mono fs-5 text-center fw-bold"
                [(ngModel)]="quantity"
                min="1"
                step="1"
              />
            </div>
            <!-- Quick Quantity Badges -->
            <div class="d-flex gap-2 mt-2">
              <button
                type="button"
                class="btn btn-glass btn-sm py-1 px-2 text-xs"
                (click)="setQuantity(5)"
              >
                5
              </button>
              <button
                type="button"
                class="btn btn-glass btn-sm py-1 px-2 text-xs"
                (click)="setQuantity(10)"
              >
                10
              </button>
              <button
                type="button"
                class="btn btn-glass btn-sm py-1 px-2 text-xs"
                (click)="setQuantity(25)"
              >
                25
              </button>
              <button
                type="button"
                class="btn btn-glass btn-sm py-1 px-2 text-xs"
                (click)="setQuantity(50)"
              >
                50
              </button>
              <button
                type="button"
                class="btn btn-glass btn-sm py-1 px-2 text-xs"
                (click)="setQuantity(100)"
              >
                100
              </button>
            </div>
          </div>

          <!-- Target Price for Limit Order -->
          <div class="form-group mb-3" *ngIf="orderType === 'LIMIT'">
            <label class="form-label text-xs text-muted fw-bold"
              >LIMIT TARGET PRICE (₹)</label
            >
            <input
              type="number"
              class="form-control form-control-glass font-mono"
              [(ngModel)]="targetPrice"
              step="0.5"
              placeholder="Enter limit price trigger"
            />
          </div>

          <!-- Stop Price for Stop Loss -->
          <div class="form-group mb-3" *ngIf="orderType === 'STOP_LOSS'">
            <label class="form-label text-xs text-muted fw-bold"
              >STOP-LOSS TRIGGER PRICE (₹)</label
            >
            <input
              type="number"
              class="form-control form-control-glass font-mono"
              [(ngModel)]="stopPrice"
              step="0.5"
              placeholder="Enter stop price"
            />
          </div>

          <!-- Financial Breakdown Summary -->
          <div class="breakdown-card">
            <div class="breakdown-row">
              <span class="text-muted text-xs">Estimated Value</span>
              <span class="font-mono text-white fw-semibold"
                >₹{{ estimatedTotal | number: "1.2-2" }}</span
              >
            </div>
            <div class="breakdown-row">
              <span class="text-muted text-xs">Brokerage & STT (0.05%)</span>
              <span class="font-mono text-muted text-xs"
                >₹{{ estimatedCharges | number: "1.2-2" }}</span
              >
            </div>
            <div class="breakdown-divider"></div>
            <div class="breakdown-row">
              <span class="text-xs fw-bold text-white"
                >Net Estimated Required</span
              >
              <span class="font-mono text-emerald fw-bold"
                >₹{{
                  estimatedTotal + estimatedCharges | number: "1.2-2"
                }}</span
              >
            </div>
            <div class="breakdown-row mt-1">
              <span class="text-xs text-muted">Available Cash Balance</span>
              <span class="font-mono text-xs text-muted"
                >₹{{
                  authService.currentUser()?.virtualBalance | number: "1.2-2"
                }}</span
              >
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn-glass btn-sm px-3" (click)="close()">
            Cancel
          </button>
          <button
            class="btn flex-fill py-2"
            [ngClass]="side === 'BUY' ? 'btn-emerald' : 'btn-rose'"
            (click)="submitOrder()"
            [disabled]="isSubmitting || quantity <= 0"
          >
            <i
              class="fa-solid"
              [ngClass]="
                isSubmitting
                  ? 'fa-spinner fa-spin'
                  : side === 'BUY'
                    ? 'fa-check'
                    : 'fa-paper-plane'
              "
            ></i>
            {{ side === "BUY" ? "Execute Buy Order" : "Execute Sell Order" }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
        animation: fadeIn 0.2s ease-out;
      }
      .modal-card {
        width: 100%;
        max-width: 480px;
        background: #111827;
        border: 1px solid var(--border-glass-hover);
        border-radius: 20px;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6);
        overflow: hidden;
      }
      .modal-header {
        padding: 18px 24px;
        border-bottom: 1px solid var(--border-glass);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .stock-identity {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .symbol-badge {
        padding: 6px 12px;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
        color: #818cf8;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .stock-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: #fff;
      }
      .stock-price {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
      .close-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-glass);
        color: var(--text-muted);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .close-btn:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }
      .modal-body {
        padding: 20px 24px;
      }
      .trade-side-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        background: rgba(9, 13, 22, 0.6);
        padding: 4px;
        border-radius: 12px;
        border: 1px solid var(--border-glass);
        margin-bottom: 20px;
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
        transition: all 0.2s;
      }
      .side-tab.buy.active {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #fff;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }
      .side-tab.sell.active {
        background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
        color: #fff;
        box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
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
        transition: all 0.15s;
      }
      .type-pill.active {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.5);
        color: #a5b4fc;
      }
      .breakdown-card {
        background: rgba(9, 13, 22, 0.7);
        border: 1px solid var(--border-glass);
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 16px;
      }
      .breakdown-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .breakdown-divider {
        height: 1px;
        background: var(--border-glass);
        margin: 4px 0;
      }
      .modal-footer {
        padding: 16px 24px;
        border-top: 1px solid var(--border-glass);
        display: flex;
        gap: 12px;
      }
    `,
  ],
})
export class TradeModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() stock: Stock | null = null;
  @Input() initialSide: OrderSide = "BUY";
  @Output() closeEvent = new EventEmitter<void>();
  @Output() orderPlaced = new EventEmitter<void>();

  tradingService = inject(TradingService);
  marketService = inject(MarketService);
  authService = inject(AuthService);
  notifyService = inject(NotificationService);
  portfolioService = inject(PortfolioService);

  allStocks: Stock[] = [];
  holdings: Holding[] = [];
  selectedStock: Stock | null = null;
  selectedSymbol = "RELIANCE";

  side: OrderSide = "BUY";
  orderType: OrderType = "MARKET";
  quantity = 10;
  targetPrice?: number;
  stopPrice?: number;
  isSubmitting = false;

  ngOnInit(): void {
    this.portfolioService
      .getHoldings()
      .subscribe((holdings) => (this.holdings = holdings));
    this.marketService.getStocks().subscribe((stocks) => {
      this.allStocks = stocks;
      if (!this.selectedStock && stocks.length > 0) {
        this.selectedStock = this.stock || stocks[0];
        this.selectedSymbol = this.selectedStock.symbol;
        this.targetPrice = this.selectedStock.currentPrice;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["initialSide"]) {
      this.side = this.initialSide;
    }
    if (changes["stock"] && this.stock) {
      this.selectedStock = this.stock;
      this.selectedSymbol = this.stock.symbol;
      this.targetPrice = this.stock.currentPrice;
    }
    if (changes["isOpen"] && this.isOpen) {
      this.portfolioService
        .getHoldings()
        .subscribe((holdings) => (this.holdings = holdings));
      this.authService.fetchCurrentUser().subscribe();
    }
  }

  onSymbolChange(): void {
    const found = this.allStocks.find((s) => s.symbol === this.selectedSymbol);
    if (found) {
      this.selectedStock = found;
      this.targetPrice = found.currentPrice;
    }
  }

  setQuantity(qty: number): void {
    this.quantity = qty;
  }

  get price(): number {
    if (this.orderType === "LIMIT" && this.targetPrice) {
      return this.targetPrice;
    }
    return this.selectedStock ? this.selectedStock.currentPrice : 1000;
  }

  get estimatedTotal(): number {
    return this.price * (this.quantity || 0);
  }

  get estimatedCharges(): number {
    return this.estimatedTotal * 0.0005; // 0.05%
  }

  get maxAffordableQuantity(): number {
    if (this.side === "SELL") {
      return (
        this.holdings.find(
          (holding) => holding.symbol === this.selectedStock?.symbol,
        )?.quantity ?? 0
      );
    }
    const user = this.authService.currentUser();
    if (!user || this.price <= 0) return 0;
    return Math.floor(user.virtualBalance / (this.price * 1.0005));
  }

  close(): void {
    this.closeEvent.emit();
  }

  submitOrder(): void {
    if (!this.selectedStock) return;
    if (
      !Number.isInteger(this.quantity) ||
      this.quantity < 1 ||
      this.quantity > this.maxAffordableQuantity
    ) {
      this.notifyService.error(
        "Invalid Quantity",
        "Check your available cash or shares held.",
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

    const totalCost = this.estimatedTotal + this.estimatedCharges;
    const user = this.authService.currentUser();

    if (this.side === "BUY" && user && user.virtualBalance < totalCost) {
      this.notifyService.error(
        "Insufficient Funds",
        `You need ₹${totalCost.toFixed(2)} but only have ₹${user.virtualBalance.toFixed(2)}.`,
      );
      return;
    }

    this.isSubmitting = true;

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
          this.isSubmitting = false;
          if (order.status === "REJECTED") {
            this.notifyService.error(
              "Order rejected",
              order.rejectionReason || "The order could not be placed.",
            );
            return;
          }
          const msg =
            order.status === "EXECUTED"
              ? `Order executed immediately: ${this.side} ${this.quantity} ${this.selectedStock?.symbol} @ ₹${this.price}`
              : `Order placed: ${this.orderType} ${this.side} ${this.quantity} ${this.selectedStock?.symbol}`;

          this.notifyService.success("Order Successful", msg);
          this.orderPlaced.emit();
          this.close();
        },
        error: () => {
          this.isSubmitting = false;
          this.notifyService.error(
            "Order Failed",
            "Could not process order request.",
          );
        },
      });
  }
}
