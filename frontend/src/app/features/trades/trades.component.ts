import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TradingService } from "../../core/services/trading.service";
import { NotificationService } from "../../core/services/notification.service";
import { Trade } from "../../core/models/trade.model";

@Component({
  selector: "app-trades",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="trades-page animate-fade-in">
      <!-- Top Header -->
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
      >
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="fw-extrabold text-white mb-0">
              Trade Ledger & Executions
            </h2>
            <span class="badge bg-indigo-subtle font-mono text-xs"
              >AUDIT LOG</span
            >
          </div>
          <p class="text-secondary text-sm mb-0">
            Complete historical record of executed buy and sell contracts with
            realized P&L attribution.
          </p>
        </div>

        <button
          class="btn btn-glass btn-sm d-flex align-items-center gap-2"
          (click)="exportCSV()"
        >
          <i class="fa-solid fa-file-csv text-emerald"></i>
          <span>Export CSV Ledger</span>
        </button>
      </div>

      <!-- Trade Performance Overview Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-sm-6">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold"
              >TOTAL EXECUTED TRADES</span
            >
            <div class="font-mono fs-4 fw-bold text-white mt-1">
              {{ allTrades.length }}
            </div>
            <span class="text-xs text-secondary">Historical contracts</span>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold">TOTAL TURNOVER VALUE</span>
            <div class="font-mono fs-4 fw-bold text-cyan mt-1">
              ₹{{ totalTurnover | number: "1.2-2" }}
            </div>
            <span class="text-xs text-secondary">Aggregate gross volume</span>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold">TOTAL REALIZED P&L</span>
            <div
              class="font-mono fs-4 fw-bold mt-1"
              [ngClass]="totalRealizedPnl >= 0 ? 'text-emerald' : 'text-rose'"
            >
              {{ totalRealizedPnl >= 0 ? "+" : "" }}₹{{
                totalRealizedPnl | number: "1.2-2"
              }}
            </div>
            <span class="text-xs text-secondary">Closed positions profit</span>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold">WIN RATE %</span>
            <div class="font-mono fs-4 fw-bold text-indigo mt-1">
              {{ winRate | number: "1.0-1" }}%
            </div>
            <span class="text-xs text-secondary">Profitable sell trades</span>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="glass-card p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="search-box">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                class="form-control form-control-glass font-mono"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Search symbol, company name, trade ID..."
              />
            </div>
          </div>

          <div class="col-md-6 d-flex justify-content-md-end gap-2">
            <select
              class="form-select form-control-glass font-mono text-xs"
              style="max-width: 160px;"
              [(ngModel)]="sideFilter"
              (change)="applyFilters()"
            >
              <option value="ALL">All Sides (BUY / SELL)</option>
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Trades Table -->
      <div class="glass-card overflow-hidden">
        <div class="table-responsive">
          <table class="table-glass">
            <thead>
              <tr>
                <th>Trade ID & Timestamp</th>
                <th>Order Ref</th>
                <th>Asset Symbol</th>
                <th>Side</th>
                <th class="text-end">Quantity</th>
                <th class="text-end">Execution Price</th>
                <th class="text-end">Gross Amount</th>
                <th class="text-end">Realized P&L</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let trade of filteredTrades">
                <td>
                  <div class="font-mono text-white fw-bold">
                    #TRD-{{ trade.id }}
                  </div>
                  <div class="text-xs text-muted font-mono">
                    {{ trade.executedAt | date: "medium" }}
                  </div>
                </td>
                <td class="font-mono text-xs text-muted">
                  #ORD-{{ trade.orderId }}
                </td>
                <td>
                  <a
                    [routerLink]="['/market', trade.symbol]"
                    class="text-white fw-bold text-decoration-none hover-indigo"
                  >
                    {{ trade.symbol }}
                  </a>
                  <div class="text-xs text-muted">{{ trade.stockName }}</div>
                </td>
                <td>
                  <span
                    class="badge-pill"
                    [ngClass]="
                      trade.side === 'BUY' ? 'badge-buy' : 'badge-sell'
                    "
                  >
                    {{ trade.side }}
                  </span>
                </td>
                <td class="text-end font-mono fw-semibold text-white">
                  {{ trade.quantity }}
                </td>
                <td class="text-end font-mono text-white">
                  ₹{{ trade.price | number: "1.2-2" }}
                </td>
                <td class="text-end font-mono fw-bold text-white">
                  ₹{{ trade.totalAmount | number: "1.2-2" }}
                </td>
                <td class="text-end font-mono fw-bold">
                  <span
                    *ngIf="trade.side === 'SELL'"
                    [ngClass]="
                      trade.realizedPnl >= 0 ? 'text-emerald' : 'text-rose'
                    "
                  >
                    {{ trade.realizedPnl >= 0 ? "+" : "" }}₹{{
                      trade.realizedPnl | number: "1.2-2"
                    }}
                  </span>
                  <span *ngIf="trade.side === 'BUY'" class="text-muted text-xs">
                    (Open Position)
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredTrades.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fa-solid fa-receipt fs-3 mb-2 d-block"></i>
                  No trade execution records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .search-box {
        position: relative;
      }
      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        font-size: 0.85rem;
      }
      .search-box input {
        padding-left: 36px !important;
      }
      .hover-indigo:hover {
        color: #818cf8 !important;
      }
    `,
  ],
})
export class TradesComponent implements OnInit {
  tradingService = inject(TradingService);
  notifyService = inject(NotificationService);

  allTrades: Trade[] = [];
  filteredTrades: Trade[] = [];

  searchQuery = "";
  sideFilter = "ALL";

  totalTurnover = 0;
  totalRealizedPnl = 0;
  winRate = 0;

  ngOnInit(): void {
    this.tradingService.getUserTrades().subscribe((trades) => {
      this.allTrades = trades;
      this.calculateStats();
      this.applyFilters();
    });
  }

  private calculateStats(): void {
    this.totalTurnover = this.allTrades.reduce(
      (sum, t) => sum + t.totalAmount,
      0,
    );
    this.totalRealizedPnl = this.allTrades.reduce(
      (sum, t) => sum + (t.realizedPnl || 0),
      0,
    );
    const closedTrades = this.allTrades.filter(
      (trade) => trade.side === "SELL",
    );
    this.winRate = closedTrades.length
      ? (closedTrades.filter((trade) => trade.realizedPnl > 0).length /
          closedTrades.length) *
        100
      : 0;
  }

  applyFilters(): void {
    let list = [...this.allTrades];

    if (this.sideFilter !== "ALL") {
      list = list.filter((t) => t.side === this.sideFilter);
    }

    if (this.searchQuery && this.searchQuery.trim() !== "") {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.stockName.toLowerCase().includes(q) ||
          t.id.toString().includes(q),
      );
    }

    this.filteredTrades = list;
  }

  exportCSV(): void {
    const columns: (keyof Trade)[] = [
      "id",
      "orderId",
      "symbol",
      "stockName",
      "side",
      "quantity",
      "price",
      "totalAmount",
      "realizedPnl",
      "executedAt",
    ];
    const rows = this.allTrades.map((trade) =>
      columns.map((column) => JSON.stringify(trade[column] ?? "")).join(","),
    );
    const blob = new Blob([[columns.join(","), ...rows].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "portfolio_pro_trades.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    this.notifyService.success(
      "CSV Export Generated",
      "Your local trade ledger has been downloaded.",
    );
  }
}
