import {
  Component,
  inject,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Chart, registerables } from "chart.js";
import { PortfolioService } from "../../core/services/portfolio.service";
import { MarketService } from "../../core/services/market.service";
import { TradingService } from "../../core/services/trading.service";
import { AuthService } from "../../core/services/auth.service";
import { RiskService } from "../../core/services/risk.service";
import { PortfolioSummary, Holding } from "../../core/models/portfolio.model";
import { Stock } from "../../core/models/stock.model";
import { OrderResponse } from "../../core/models/order.model";
import { RiskReport } from "../../core/models/risk.model";
import { TradeModalComponent } from "../../shared/components/trade-modal/trade-modal.component";

Chart.register(...registerables);

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, TradeModalComponent],
  template: `
    <div class="dashboard-page animate-fade-in">
      <!-- Welcome & Header Banner -->
      <div class="welcome-header mb-4">
        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
        >
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <h2 class="fw-extrabold text-heading mb-0 tracking-tight">
                Trading Dashboard
              </h2>
              <span class="badge bg-emerald-subtle font-mono text-xs"
                >SIMULATION LIVE</span
              >
            </div>
            <p class="text-secondary text-sm mb-0">
              Welcome back,
              <strong class="text-heading">{{
                authService.currentUser()?.fullName
              }}</strong
              >. Here is your portfolio performance and market pulse.
            </p>
          </div>

          <div class="d-flex gap-2">
            <button
              class="btn btn-glass btn-sm d-flex align-items-center gap-2"
              (click)="refreshData()"
            >
              <i
                class="fa-solid fa-arrows-rotate"
                [class.fa-spin]="isLoading"
              ></i>
              <span>Refresh</span>
            </button>
            <a
              [routerLink]="['/trade']"
              class="btn btn-emerald btn-sm d-flex align-items-center gap-2"
            >
              <i class="fa-solid fa-bolt"></i>
              <span>Open Terminal</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Loading Skeleton State -->
      <div class="row g-3 mb-4" *ngIf="isLoading && !summary">
        <div class="col-md-3" *ngFor="let i of [1, 2, 3, 4]">
          <div class="glass-card p-4">
            <div
              class="skeleton-box mb-2"
              style="height: 14px; width: 60%;"
            ></div>
            <div
              class="skeleton-box mb-2"
              style="height: 32px; width: 85%;"
            ></div>
            <div class="skeleton-box" style="height: 12px; width: 40%;"></div>
          </div>
        </div>
      </div>

      <!-- Key Financial Metrics Cards -->
      <div class="metrics-grid mb-4" *ngIf="summary">
        <!-- Net Worth Card -->
        <div class="glass-card stat-card">
          <div class="stat-header">
            <span class="stat-title">TOTAL NET WORTH</span>
            <div class="stat-icon-wrap bg-cyan-subtle">
              <i class="fa-solid fa-vault"></i>
            </div>
          </div>
          <div class="stat-value font-mono">
            ₹{{ summary.netWorth | number: "1.2-2" }}
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
              <i
                class="fa-solid"
                [ngClass]="
                  summary.totalReturnPercent >= 0
                    ? 'fa-arrow-trend-up'
                    : 'fa-arrow-trend-down'
                "
              ></i>
              {{ summary.totalReturnPercent >= 0 ? "+" : ""
              }}{{ summary.totalReturnPercent | number: "1.2-2" }}%
            </span>
            <span class="stat-footnote text-muted">All-time return</span>
          </div>
        </div>

        <!-- Current Holdings Value -->
        <div class="glass-card stat-card">
          <div class="stat-header">
            <span class="stat-title">EQUITY HOLDINGS</span>
            <div class="stat-icon-wrap bg-indigo-subtle">
              <i class="fa-solid fa-chart-pie"></i>
            </div>
          </div>
          <div class="stat-value font-mono">
            ₹{{ summary.currentHoldingsValue | number: "1.2-2" }}
          </div>
          <div class="stat-footer">
            <span class="stat-footnote text-secondary">
              Invested:
              <strong class="text-heading font-mono"
                >₹{{ summary.totalInvested | number: "1.2-2" }}</strong
              >
            </span>
            <span class="badge bg-indigo-subtle ms-auto"
              >{{ summary.holdings.length }} Assets</span
            >
          </div>
        </div>

        <!-- Unrealized P&L -->
        <div class="glass-card stat-card">
          <div class="stat-header">
            <span class="stat-title">UNREALIZED P&L</span>
            <div
              class="stat-icon-wrap"
              [ngClass]="
                summary.totalUnrealizedPnl >= 0
                  ? 'bg-emerald-subtle'
                  : 'bg-rose-subtle'
              "
            >
              <i class="fa-solid fa-scale-balanced"></i>
            </div>
          </div>
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
            <span class="stat-footnote text-muted"
              >Open positions gain/loss</span
            >
          </div>
        </div>

        <!-- Cash Balance -->
        <div class="glass-card stat-card">
          <div class="stat-header">
            <span class="stat-title">VIRTUAL CASH</span>
            <div class="stat-icon-wrap bg-amber-subtle">
              <i class="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div class="stat-value font-mono text-emerald">
            ₹{{ summary.cashBalance | number: "1.2-2" }}
          </div>
          <div class="stat-footer">
            <span class="stat-footnote text-secondary">Realized: </span>
            <span
              class="font-mono text-xs fw-bold"
              [ngClass]="
                summary.totalRealizedPnl >= 0 ? 'text-emerald' : 'text-rose'
              "
            >
              {{ summary.totalRealizedPnl >= 0 ? "+" : "" }}₹{{
                summary.totalRealizedPnl | number: "1.2-2"
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row g-4 mb-4">
        <!-- Portfolio Performance Area Chart -->
        <div class="col-lg-8">
          <div class="glass-card chart-container-card h-100 p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold text-heading mb-0">
                  Portfolio Performance Trend
                </h5>
                <span class="text-xs text-muted"
                  >Simulated cumulative growth over time</span
                >
              </div>
              <div class="btn-group btn-group-sm">
                <button
                  *ngFor="let range of chartRanges"
                  class="btn btn-glass text-xs px-3"
                  [class.active]="selectedRange === range"
                  (click)="setRange(range)"
                >
                  {{ range }}
                </button>
              </div>
            </div>
            <div class="canvas-box">
              <canvas #trendChartCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- Sector Allocation Doughnut Chart -->
        <div class="col-lg-4">
          <div class="glass-card chart-container-card h-100 p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold text-heading mb-0">Asset Allocation</h5>
                <span class="text-xs text-muted">Sector breakdown %</span>
              </div>
              <i class="fa-solid fa-chart-pie text-muted"></i>
            </div>
            <div class="canvas-doughnut-box">
              <canvas #allocationChartCanvas></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Risk Alert & Market Movers -->
      <div class="row g-4 mb-4">
        <!-- Risk Radar Quick Widget -->
        <div class="col-lg-4">
          <div class="glass-card p-4 h-100" *ngIf="riskReport">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center gap-2">
                <div class="stat-icon-wrap bg-rose-subtle">
                  <i class="fa-solid fa-shield-halved text-rose"></i>
                </div>
                <h6 class="fw-bold text-heading mb-0">Risk Radar Snapshot</h6>
              </div>
              <a
                [routerLink]="['/risk']"
                class="text-xs text-indigo text-decoration-none fw-bold"
                >Full Report →</a
              >
            </div>

            <div
              class="d-flex align-items-center justify-content-between p-3 mb-3 rounded-3"
              style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2);"
            >
              <div>
                <div class="text-xs text-muted fw-bold">
                  PARAMETRIC VaR (95%)
                </div>
                <div class="font-mono fs-5 text-rose fw-bold">
                  ₹{{ riskReport.valueAtRisk95 | number: "1.2-2" }}
                </div>
              </div>
              <div class="text-end">
                <span class="badge bg-amber-subtle text-xs mb-1"
                  >{{ riskReport.riskLevel }} RISK</span
                >
                <div class="text-xs text-muted font-mono">
                  Score: {{ riskReport.riskScore }}/100
                </div>
              </div>
            </div>

            <div class="risk-metrics-list">
              <div class="metric-line">
                <span class="text-xs text-muted">Portfolio Beta:</span>
                <span class="font-mono text-xs text-heading fw-bold">{{
                  riskReport.portfolioBeta
                }}</span>
              </div>
              <div class="metric-line">
                <span class="text-xs text-muted">Annualized Volatility:</span>
                <span class="font-mono text-xs text-heading fw-bold"
                  >{{ riskReport.portfolioVolatility }}%</span
                >
              </div>
              <div class="metric-line">
                <span class="text-xs text-muted">Concentration Index:</span>
                <span class="font-mono text-xs text-heading fw-bold"
                  >{{ riskReport.concentrationRiskIndex }}%</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Top Market Gainers / Losers -->
        <div class="col-lg-8">
          <div class="glass-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-heading mb-0">Top Market Movers</h6>
              <a
                [routerLink]="['/market']"
                class="text-xs text-indigo text-decoration-none fw-bold"
                >View All Stocks →</a
              >
            </div>

            <div class="row g-3">
              <div class="col-md-6" *ngFor="let stock of topStocks">
                <div
                  class="mover-card glass-card p-3"
                  [routerLink]="['/market', stock.symbol]"
                >
                  <div
                    class="d-flex justify-content-between align-items-start mb-2"
                  >
                    <div>
                      <div class="fw-bold text-heading">{{ stock.symbol }}</div>
                      <div
                        class="text-xs text-muted text-truncate"
                        style="max-width: 150px;"
                      >
                        {{ stock.name }}
                      </div>
                    </div>
                    <span
                      class="badge-pill"
                      [ngClass]="
                        stock.changePercent >= 0 ? 'badge-buy' : 'badge-sell'
                      "
                    >
                      {{ stock.changePercent >= 0 ? "+" : ""
                      }}{{ stock.changePercent | number: "1.2-2" }}%
                    </span>
                  </div>
                  <div class="d-flex justify-content-between align-items-end">
                    <div class="font-mono fs-6 fw-bold text-heading">
                      ₹{{ stock.currentPrice | number: "1.2-2" }}
                    </div>
                    <button
                      class="btn btn-emerald btn-sm py-0 px-2 text-xs"
                      (click)="openTradeModalForStock(stock, $event)"
                    >
                      Trade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Holdings & Recent Activity Tables Grid -->
      <div class="row g-4">
        <!-- Holdings Table -->
        <div class="col-lg-7">
          <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-heading mb-0">Current Holdings</h6>
              <a
                [routerLink]="['/portfolio']"
                class="text-xs text-indigo text-decoration-none fw-bold"
                >Manage Portfolio →</a
              >
            </div>

            <!-- Empty State -->
            <div
              class="empty-state-card py-4"
              *ngIf="summary && summary.holdings.length === 0"
            >
              <div class="empty-state-icon">
                <i class="fa-solid fa-briefcase"></i>
              </div>
              <div class="empty-state-title">No Open Equity Positions</div>
              <div class="empty-state-desc">
                You currently do not hold any stocks. Explore the live market to
                place your first trade.
              </div>
              <a [routerLink]="['/market']" class="btn btn-emerald btn-sm px-4"
                >Browse Market</a
              >
            </div>

            <div
              class="table-responsive"
              *ngIf="summary && summary.holdings.length > 0"
            >
              <table class="table-glass">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Qty</th>
                    <th>Avg Price</th>
                    <th>LTP</th>
                    <th>Unrealized P&L</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let h of summary.holdings">
                    <td>
                      <a
                        [routerLink]="['/market', h.symbol]"
                        class="text-heading fw-bold text-decoration-none hover-indigo"
                      >
                        {{ h.symbol }}
                      </a>
                    </td>
                    <td class="font-mono">{{ h.quantity }}</td>
                    <td class="font-mono text-muted">
                      ₹{{ h.averageBuyPrice | number: "1.2-2" }}
                    </td>
                    <td class="font-mono fw-semibold text-heading">
                      ₹{{ h.currentPrice | number: "1.2-2" }}
                    </td>
                    <td
                      class="font-mono fw-bold"
                      [ngClass]="
                        h.unrealizedPnl >= 0 ? 'text-emerald' : 'text-rose'
                      "
                    >
                      {{ h.unrealizedPnl >= 0 ? "+" : "" }}₹{{
                        h.unrealizedPnl | number: "1.2-2"
                      }}
                      <span class="text-xs d-block font-mono"
                        >({{ h.unrealizedPnlPercent >= 0 ? "+" : ""
                        }}{{ h.unrealizedPnlPercent | number: "1.2-2" }}%)</span
                      >
                    </td>
                    <td>
                      <button
                        class="btn btn-glass btn-sm py-1 px-2 text-xs"
                        (click)="openTradeModalForSymbol(h.symbol)"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="col-lg-5">
          <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-heading mb-0">Recent Orders</h6>
              <a
                [routerLink]="['/orders']"
                class="text-xs text-indigo text-decoration-none fw-bold"
                >All Orders →</a
              >
            </div>

            <!-- Empty State -->
            <div
              class="empty-state-card py-4"
              *ngIf="recentOrders.length === 0"
            >
              <div class="empty-state-icon">
                <i class="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div class="empty-state-title">No Orders Placed</div>
              <div class="empty-state-desc">
                Your order history will appear here after placing your first
                order.
              </div>
              <a [routerLink]="['/trade']" class="btn btn-glass btn-sm px-3"
                >Create Order</a
              >
            </div>

            <div class="table-responsive" *ngIf="recentOrders.length > 0">
              <table class="table-glass">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of recentOrders">
                    <td>
                      <div class="fw-bold text-heading font-mono">
                        {{ order.symbol }}
                      </div>
                      <div class="text-xs text-muted">
                        {{ order.side }} {{ order.quantity }} shares
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-indigo-subtle text-xs">{{
                        order.type
                      }}</span>
                    </td>
                    <td>
                      <span
                        class="badge-pill"
                        [ngClass]="
                          order.status === 'EXECUTED'
                            ? 'badge-executed'
                            : order.status === 'PENDING'
                              ? 'badge-pending'
                              : 'badge-cancelled'
                        "
                      >
                        {{ order.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trade Modal -->
    <app-trade-modal
      [isOpen]="isTradeModalOpen"
      [stock]="tradeModalStock"
      (closeEvent)="isTradeModalOpen = false"
      (orderPlaced)="refreshData()"
    ></app-trade-modal>
  `,
  styles: [
    `
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 16px;
      }
      .stat-card {
        padding: 20px;
      }
      .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .stat-title {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.05em;
      }
      .stat-icon-wrap {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
      }
      .stat-value {
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-heading);
        margin-bottom: 8px;
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
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .stat-footnote {
        font-size: 0.75rem;
      }
      .canvas-box {
        position: relative;
        height: 280px;
        width: 100%;
      }
      .canvas-doughnut-box {
        position: relative;
        height: 280px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .risk-metrics-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .metric-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--border-glass-subtle);
      }
      .mover-card {
        cursor: pointer;
        transition: all 0.2s;
      }
      .mover-card:hover {
        border-color: rgba(99, 102, 241, 0.4);
        transform: translateY(-2px);
      }
      .hover-indigo:hover {
        color: #818cf8 !important;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild("trendChartCanvas")
  trendChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild("allocationChartCanvas")
  allocationChartCanvas!: ElementRef<HTMLCanvasElement>;

  portfolioService = inject(PortfolioService);
  marketService = inject(MarketService);
  tradingService = inject(TradingService);
  authService = inject(AuthService);
  riskService = inject(RiskService);

  summary: PortfolioSummary | null = null;
  riskReport: RiskReport | null = null;
  topStocks: Stock[] = [];
  recentOrders: OrderResponse[] = [];
  isLoading = false;
  selectedRange: "1M" | "3M" | "1Y" = "1M";
  chartRanges: Array<"1M" | "3M" | "1Y"> = ["1M", "3M", "1Y"];

  isTradeModalOpen = false;
  tradeModalStock: Stock | null = null;

  private trendChart?: any;
  private allocationChart?: any;

  ngOnInit(): void {
    this.refreshData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 150);
  }

  refreshData(): void {
    this.isLoading = true;
    this.portfolioService.getPortfolioSummary().subscribe((s) => {
      this.summary = s;
      this.updateAllocationChart();
    });

    this.riskService.getRiskReport().subscribe((r) => {
      this.riskReport = r;
    });

    this.marketService.getStocks().subscribe((stocks) => {
      this.topStocks = stocks.slice(0, 4);
      this.isLoading = false;
    });

    this.tradingService.getUserOrders().subscribe((orders) => {
      this.recentOrders = orders.slice(0, 5);
    });
  }

  private initCharts(): void {
    this.initTrendChart();
    this.initAllocationChart();
  }

  private initTrendChart(): void {
    if (!this.trendChartCanvas) return;
    const ctx = this.trendChartCanvas.nativeElement.getContext("2d");
    if (!ctx) return;

    const count =
      this.selectedRange === "1M" ? 7 : this.selectedRange === "3M" ? 10 : 12;
    const currentWorth = this.summary?.netWorth ?? 0;
    const startWorth = currentWorth - (this.summary?.totalPnl ?? 0);
    const labels = Array.from({ length: count }, (_, index) => `${index + 1}`);
    const data = Array.from(
      { length: count },
      (_, index) =>
        startWorth +
        ((currentWorth - startWorth) * index) / Math.max(1, count - 1),
    );

    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.25)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    this.trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Portfolio Net Worth (₹)",
            data,
            borderColor: "#10b981",
            borderWidth: 2.5,
            pointBackgroundColor: "#10b981",
            pointBorderColor: "#fff",
            pointRadius: 3,
            pointHoverRadius: 6,
            fill: true,
            backgroundColor: gradient,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#111827",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            titleColor: "#fff",
            bodyColor: "#10b981",
            callbacks: {
              label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString("en-IN")}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(150,150,150,0.08)" },
            ticks: { color: "#6b7280", font: { size: 11 } },
          },
          y: {
            grid: { color: "rgba(150,150,150,0.08)" },
            ticks: {
              color: "#6b7280",
              font: { size: 11 },
              callback: (val) => `₹${(Number(val) / 100000).toFixed(1)}L`,
            },
          },
        },
      },
    });
  }

  private initAllocationChart(): void {
    if (!this.allocationChartCanvas) return;
    const ctx = this.allocationChartCanvas.nativeElement.getContext("2d");
    if (!ctx) return;

    const labels = this.summary?.allocationLabels || [
      "RELIANCE",
      "INFY",
      "HDFCBANK",
      "SUNPHARMA",
    ];
    const data = this.summary?.allocationValues || [32.4, 24.6, 25.3, 17.7];

    this.allocationChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: [
              "#3b82f6",
              "#10b981",
              "#6366f1",
              "#f59e0b",
              "#ec4899",
            ],
            borderColor: "transparent",
            borderWidth: 2,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#9ca3af",
              font: { size: 11 },
              padding: 12,
              usePointStyle: true,
            },
          },
        },
        cutout: "72%",
      },
    });
  }

  private updateAllocationChart(): void {
    if (this.allocationChart && this.summary) {
      this.allocationChart.data.labels = this.summary.allocationLabels;
      this.allocationChart.data.datasets[0].data =
        this.summary.allocationValues;
      this.allocationChart.update();
    }
  }

  setRange(range: "1M" | "3M" | "1Y"): void {
    this.selectedRange = range;
    if (!this.trendChart) return;
    const count = range === "1M" ? 7 : range === "3M" ? 10 : 12;
    const currentWorth = this.summary?.netWorth ?? 0;
    const startWorth = currentWorth - (this.summary?.totalPnl ?? 0);
    this.trendChart.data.labels = Array.from(
      { length: count },
      (_, index) => `${index + 1}`,
    );
    this.trendChart.data.datasets[0].data = Array.from(
      { length: count },
      (_, index) =>
        startWorth +
        ((currentWorth - startWorth) * index) / Math.max(1, count - 1),
    );
    this.trendChart.update();
  }

  openTradeModal(): void {
    this.tradeModalStock = null;
    this.isTradeModalOpen = true;
  }

  openTradeModalForStock(stock: Stock, event: Event): void {
    event.stopPropagation();
    this.tradeModalStock = stock;
    this.isTradeModalOpen = true;
  }

  openTradeModalForSymbol(symbol: string): void {
    const stock =
      this.marketService.liveTickers().find((s) => s.symbol === symbol);
    if (stock) {
      this.tradeModalStock = stock;
      this.isTradeModalOpen = true;
    } else {
      this.marketService.getStockBySymbol(symbol).subscribe((stk) => {
        this.tradeModalStock = stk;
        this.isTradeModalOpen = true;
      });
    }
  }
}
