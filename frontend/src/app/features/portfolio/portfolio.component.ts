import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { PortfolioService } from "../../core/services/portfolio.service";
import { MarketService } from "../../core/services/market.service";
import { PortfolioSummary, Holding } from "../../core/models/portfolio.model";
import { Stock } from "../../core/models/stock.model";
import { TradeModalComponent } from "../../shared/components/trade-modal/trade-modal.component";

@Component({
  selector: "app-portfolio",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TradeModalComponent],
  template: `
    <div class="portfolio-page animate-fade-in" *ngIf="summary">
      <!-- Header -->
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
      >
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="fw-extrabold text-white mb-0">
              Portfolio & Asset Allocation
            </h2>
            <span class="badge bg-indigo-subtle font-mono text-xs"
              >ACTIVE POSITIONS</span
            >
          </div>
          <p class="text-secondary text-sm mb-0">
            Detailed breakdown of open equity holdings, cost bases, sector
            weighting, and unrealized returns.
          </p>
        </div>

        <div class="d-flex gap-2">
          <button
            class="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-2"
            (click)="openTradeModal()"
          >
            <i class="fa-solid fa-plus"></i>
            <span>Add Position</span>
          </button>
        </div>
      </div>

      <!-- Financial Metrics Ribbon -->
      <div class="metrics-grid mb-4">
        <!-- Current Portfolio Value -->
        <div class="glass-card stat-card">
          <span class="stat-title">CURRENT PORTFOLIO VALUE</span>
          <div class="stat-value font-mono text-white">
            ₹{{ summary.currentHoldingsValue | number: "1.2-2" }}
          </div>
          <div class="stat-footer">
            <span class="stat-footnote text-secondary">
              Invested:
              <strong class="text-white font-mono"
                >₹{{ summary.totalInvested | number: "1.2-2" }}</strong
              >
            </span>
          </div>
        </div>

        <!-- Total Unrealized P&L -->
        <div class="glass-card stat-card">
          <span class="stat-title">TOTAL UNREALIZED P&L</span>
          <div
            class="stat-value font-mono"
            [ngClass]="
              summary.totalUnrealizedPnl >= 0 ? 'text-emerald' : 'text-rose'
            "
          >
            {{ summary.totalUnrealizedPnl >= 0 ? "+" : "" }}₹{{
              summary.totalUnrealizedPnl | number: "1.2-2"
            }}
          </div>
          <div class="stat-footer">
            <span
              class="stat-badge"
              [ngClass]="
                summary.totalReturnPercent >= 0
                  ? 'bg-emerald-subtle'
                  : 'bg-rose-subtle'
              "
            >
              {{ summary.totalReturnPercent >= 0 ? "+" : ""
              }}{{ summary.totalReturnPercent | number: "1.2-2" }}%
            </span>
            <span class="stat-footnote text-muted">ROI on invested</span>
          </div>
        </div>

        <!-- Total Realized P&L -->
        <div class="glass-card stat-card">
          <span class="stat-title">LIFETIME REALIZED P&L</span>
          <div
            class="stat-value font-mono"
            [ngClass]="
              summary.totalRealizedPnl >= 0 ? 'text-emerald' : 'text-rose'
            "
          >
            {{ summary.totalRealizedPnl >= 0 ? "+" : "" }}₹{{
              summary.totalRealizedPnl | number: "1.2-2"
            }}
          </div>
          <div class="stat-footer">
            <span class="stat-footnote text-muted">Closed contracts gain</span>
          </div>
        </div>

        <!-- Cash Reserve -->
        <div class="glass-card stat-card">
          <span class="stat-title">AVAILABLE CASH RESERVE</span>
          <div class="stat-value font-mono text-emerald">
            ₹{{ summary.cashBalance | number: "1.2-2" }}
          </div>
          <div class="stat-footer">
            <span class="stat-footnote text-secondary">
              Total Net Worth:
              <strong class="text-white font-mono"
                >₹{{ summary.netWorth | number: "1.2-2" }}</strong
              >
            </span>
          </div>
        </div>
      </div>

      <!-- Sector Diversification Bars -->
      <div class="glass-card p-4 mb-4">
        <h6 class="fw-bold text-white mb-3">
          Sector Diversification Breakdown
        </h6>
        <div class="row g-3">
          <div
            class="col-md-6"
            *ngFor="let label of summary.sectorLabels; let i = index"
          >
            <div class="mb-2">
              <div class="d-flex justify-content-between text-xs mb-1">
                <span class="text-white fw-semibold">{{ label }}</span>
                <span class="font-mono text-cyan fw-bold"
                  >{{ summary.sectorValues[i] }}%</span
                >
              </div>
              <div
                class="progress"
                style="height: 6px; background: rgba(255,255,255,0.08);"
              >
                <div
                  class="progress-bar"
                  [ngClass]="'bg-sector-' + (i % 5)"
                  [style.width.%]="summary.sectorValues[i]"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Holdings Table -->
      <div class="glass-card overflow-hidden">
        <div
          class="p-3 border-bottom border-glass d-flex justify-content-between align-items-center"
        >
          <h6 class="fw-bold text-white mb-0">
            Open Asset Holdings ({{ summary.holdings.length }})
          </h6>
          <span class="text-xs text-muted">Live marked-to-market prices</span>
        </div>

        <div class="table-responsive">
          <table class="table-glass">
            <thead>
              <tr>
                <th>Holding Asset</th>
                <th>Sector</th>
                <th class="text-end">Quantity</th>
                <th class="text-end">Avg Buy Price</th>
                <th class="text-end">LTP (Current)</th>
                <th class="text-end">Total Invested</th>
                <th class="text-end">Current Value</th>
                <th class="text-end">Unrealized P&L</th>
                <th class="text-end">Weight</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of summary.holdings">
                <td>
                  <a
                    [routerLink]="['/market', h.symbol]"
                    class="text-decoration-none"
                  >
                    <div class="text-white fw-bold hover-indigo font-mono fs-6">
                      {{ h.symbol }}
                    </div>
                    <div class="text-xs text-muted">{{ h.name }}</div>
                  </a>
                </td>
                <td>
                  <span class="badge bg-indigo-subtle text-xs">{{
                    h.sector
                  }}</span>
                </td>
                <td class="text-end font-mono text-white fw-bold">
                  {{ h.quantity }}
                </td>
                <td class="text-end font-mono text-muted">
                  ₹{{ h.averageBuyPrice | number: "1.2-2" }}
                </td>
                <td class="text-end font-mono text-white fw-bold">
                  ₹{{ h.currentPrice | number: "1.2-2" }}
                </td>
                <td class="text-end font-mono text-secondary">
                  ₹{{ h.totalInvested | number: "1.2-2" }}
                </td>
                <td class="text-end font-mono text-white fw-bold">
                  ₹{{ h.currentValue | number: "1.2-2" }}
                </td>
                <td
                  class="text-end font-mono fw-bold"
                  [ngClass]="
                    h.unrealizedPnl >= 0 ? 'text-emerald' : 'text-rose'
                  "
                >
                  {{ h.unrealizedPnl >= 0 ? "+" : "" }}₹{{
                    h.unrealizedPnl | number: "1.2-2"
                  }}
                  <span class="d-block text-xs font-mono">
                    ({{ h.unrealizedPnlPercent >= 0 ? "+" : ""
                    }}{{ h.unrealizedPnlPercent | number: "1.2-2" }}%)
                  </span>
                </td>
                <td class="text-end font-mono text-cyan fw-bold text-xs">
                  {{ h.allocationPercent }}%
                </td>
                <td class="text-center">
                  <div class="d-inline-flex gap-2">
                    <button
                      class="btn btn-emerald btn-sm py-1 px-2 text-xs"
                      (click)="tradeHolding(h, 'BUY')"
                    >
                      Buy +
                    </button>
                    <button
                      class="btn btn-rose btn-sm py-1 px-2 text-xs"
                      (click)="tradeHolding(h, 'SELL')"
                    >
                      Sell
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="summary.holdings.length === 0">
                <td colspan="10" class="text-center py-5 text-muted">
                  <i class="fa-solid fa-briefcase fs-3 mb-2 d-block"></i>
                  No open holdings in your portfolio. Go to Market to place your
                  first trade!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Trade Modal -->
    <app-trade-modal
      [isOpen]="isTradeModalOpen"
      [stock]="tradeModalStock"
      [initialSide]="tradeSide"
      (closeEvent)="isTradeModalOpen = false"
      (orderPlaced)="loadPortfolio()"
    ></app-trade-modal>
  `,
  styles: [
    `
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 16px;
      }
      .stat-card {
        padding: 20px;
      }
      .stat-title {
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.05em;
      }
      .stat-value {
        font-size: 1.55rem;
        font-weight: 800;
        margin: 6px 0 10px;
      }
      .stat-footer {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .stat-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 6px;
      }
      .stat-footnote {
        font-size: 0.75rem;
      }
      .hover-indigo:hover {
        color: #818cf8 !important;
      }
      .bg-sector-0 {
        background-color: #3b82f6 !important;
      }
      .bg-sector-1 {
        background-color: #10b981 !important;
      }
      .bg-sector-2 {
        background-color: #6366f1 !important;
      }
      .bg-sector-3 {
        background-color: #f59e0b !important;
      }
      .bg-sector-4 {
        background-color: #ec4899 !important;
      }
    `,
  ],
})
export class PortfolioComponent implements OnInit {
  portfolioService = inject(PortfolioService);
  marketService = inject(MarketService);

  summary: PortfolioSummary | null = null;
  isTradeModalOpen = false;
  tradeModalStock: Stock | null = null;
  tradeSide: "BUY" | "SELL" = "BUY";

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.portfolioService.getPortfolioSummary().subscribe((s) => {
      this.summary = s;
    });
  }

  openTradeModal(): void {
    this.tradeModalStock = null;
    this.isTradeModalOpen = true;
  }

  tradeHolding(holding: Holding, side: "BUY" | "SELL"): void {
    const stock =
      this.marketService
        .liveTickers()
        .find((s) => s.symbol === holding.symbol);
    if (stock) {
      this.tradeModalStock = stock;
      this.tradeSide = side;
      this.isTradeModalOpen = true;
    } else {
      this.marketService.getStockBySymbol(holding.symbol).subscribe((stk) => {
        this.tradeModalStock = stk;
        this.tradeSide = side;
        this.isTradeModalOpen = true;
      });
    }
  }
}
