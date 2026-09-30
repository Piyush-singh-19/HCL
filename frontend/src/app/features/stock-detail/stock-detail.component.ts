import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MarketService } from '../../core/services/market.service';
import { AnalysisService } from '../../core/services/analysis.service';
import { TradingService } from '../../core/services/trading.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Stock, StockPriceHistory } from '../../core/models/stock.model';
import { TechnicalAnalysis } from '../../core/models/analysis.model';
import { OrderSide, OrderType } from '../../core/models/order.model';

Chart.register(...registerables);

@Component({
  selector: 'app-stock-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="stock-detail-page animate-fade-in" *ngIf="stock">
      <!-- Breadcrumb & Top Bar -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-2">
          <a [routerLink]="['/market']" class="btn btn-glass btn-sm">
            <i class="fa-solid fa-arrow-left me-1"></i> Market
          </a>
          <span class="text-muted">/</span>
          <span class="text-white fw-bold font-mono">{{ stock.symbol }}</span>
        </div>

        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-indigo-subtle">{{ stock.sector }}</span>
          <span class="badge bg-emerald-subtle">LIVE FEED</span>
        </div>
      </div>

      <!-- Main Header Banner -->
      <div class="glass-card p-4 mb-4">
        <div class="row align-items-center gy-3">
          <div class="col-lg-7">
            <div class="d-flex align-items-center gap-3 mb-2">
              <h1 class="fw-extrabold text-white mb-0 font-mono">{{ stock.symbol }}</h1>
              <span class="fs-5 text-secondary">|</span>
              <span class="fs-5 text-secondary fw-semibold">{{ stock.name }}</span>
            </div>
            <div class="d-flex align-items-baseline gap-3">
              <div class="font-mono fs-2 fw-extrabold text-white">₹{{ stock.currentPrice | number:'1.2-2' }}</div>
              <span class="badge-pill fs-6" [ngClass]="stock.changePercent >= 0 ? 'badge-buy' : 'badge-sell'">
                <i class="fa-solid" [ngClass]="stock.changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down'"></i>
                {{ stock.changePercent >= 0 ? '+' : '' }}{{ stock.changePercent | number:'1.2-2' }}%
                ({{ stock.changeAmount >= 0 ? '+' : '' }}₹{{ stock.changeAmount | number:'1.2-2' }})
              </span>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="row g-2 text-xs font-mono">
              <div class="col-6 col-sm-3 p-2 rounded bg-black-subtle">
                <span class="text-muted d-block">DAY OPEN</span>
                <span class="text-white fw-bold">₹{{ stock.dayOpen | number:'1.2-2' }}</span>
              </div>
              <div class="col-6 col-sm-3 p-2 rounded bg-black-subtle">
                <span class="text-muted d-block">PREV CLOSE</span>
                <span class="text-white fw-bold">₹{{ stock.previousClose | number:'1.2-2' }}</span>
              </div>
              <div class="col-6 col-sm-3 p-2 rounded bg-black-subtle">
                <span class="text-muted d-block">DAY HIGH</span>
                <span class="text-emerald fw-bold">₹{{ stock.dayHigh | number:'1.2-2' }}</span>
              </div>
              <div class="col-6 col-sm-3 p-2 rounded bg-black-subtle">
                <span class="text-muted d-block">DAY LOW</span>
                <span class="text-rose fw-bold">₹{{ stock.dayLow | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="row g-4 mb-4">
        <!-- Left Column: Interactive Price Chart & Technical Analysis -->
        <div class="col-lg-8">
          <!-- Price Chart Card -->
          <div class="glass-card p-4 mb-4">
            <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <div>
                <h5 class="fw-bold text-white mb-0">Interactive Price Chart</h5>
                <span class="text-xs text-muted">Daily candlestick trend & moving average simulation</span>
              </div>

              <div class="btn-group btn-group-sm">
                <button 
                  *ngFor="let tf of ['1D', '1W', '1M', '1Y']" 
                  class="btn btn-glass text-xs" 
                  [class.active]="selectedTimeframe === tf"
                  (click)="setTimeframe(tf)"
                >
                  {{ tf }}
                </button>
              </div>
            </div>

            <div class="stock-chart-canvas-box">
              <canvas #stockChartCanvas></canvas>
            </div>
          </div>

          <!-- Quantitative Technical Analysis Card -->
          <div class="glass-card p-4" *ngIf="analysis">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold text-white mb-0">Technical Indicator Matrix</h5>
                <span class="text-xs text-muted">Real-time quantitative momentum & trend calculations</span>
              </div>

              <!-- Overall Signal Badge -->
              <div class="signal-pill-wrap">
                <span 
                  class="badge fs-6 py-2 px-3 fw-bold" 
                  [ngClass]="analysis.overallSignal === 'BUY' || analysis.overallSignal === 'STRONG_BUY' ? 'bg-emerald-subtle' : 'bg-rose-subtle'"
                >
                  <i class="fa-solid fa-signal me-1"></i> {{ analysis.overallSignal }} ({{ analysis.bullishScore }}/100)
                </span>
              </div>
            </div>

            <!-- Signal Reason Banner -->
            <div class="p-3 mb-3 rounded-3" style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25);">
              <div class="text-xs text-indigo fw-bold mb-1">ALGORITHMIC SUMMARY</div>
              <div class="text-sm text-white">{{ analysis.signalReason }}</div>
            </div>

            <!-- Indicator Grid -->
            <div class="row g-3 mb-3">
              <!-- RSI 14 -->
              <div class="col-md-3 col-sm-6">
                <div class="indicator-card p-3 rounded-3">
                  <span class="text-xs text-muted fw-bold">RSI (14)</span>
                  <div class="font-mono fs-5 fw-bold text-white">{{ analysis.rsi14 }}</div>
                  <span class="text-xs text-emerald fw-semibold">{{ analysis.rsiCondition }}</span>
                </div>
              </div>

              <!-- MACD -->
              <div class="col-md-3 col-sm-6">
                <div class="indicator-card p-3 rounded-3">
                  <span class="text-xs text-muted fw-bold">MACD HISTOGRAM</span>
                  <div class="font-mono fs-5 fw-bold text-emerald">+{{ analysis.macdHistogram }}</div>
                  <span class="text-xs text-emerald fw-semibold">{{ analysis.macdSignal }}</span>
                </div>
              </div>

              <!-- 20 SMA -->
              <div class="col-md-3 col-sm-6">
                <div class="indicator-card p-3 rounded-3">
                  <span class="text-xs text-muted fw-bold">SMA (20-DAY)</span>
                  <div class="font-mono fs-5 fw-bold text-white">₹{{ analysis.sma20 | number:'1.2-2' }}</div>
                  <span class="text-xs text-muted">Short-term baseline</span>
                </div>
              </div>

              <!-- Bollinger Upper/Lower -->
              <div class="col-md-3 col-sm-6">
                <div class="indicator-card p-3 rounded-3">
                  <span class="text-xs text-muted fw-bold">BOLLINGER (UPPER)</span>
                  <div class="font-mono fs-5 fw-bold text-cyan">₹{{ analysis.bbUpper | number:'1.2-2' }}</div>
                  <span class="text-xs text-muted">Lower: ₹{{ analysis.bbLower | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- Signal Breakdown List -->
            <div class="breakdown-list">
              <div class="text-xs text-muted fw-bold mb-2">SIGNAL BREAKDOWN & INSIGHTS:</div>
              <ul class="list-unstyled mb-0">
                <li *ngFor="let point of analysis.signalBreakdown" class="d-flex align-items-start gap-2 text-xs text-secondary mb-1">
                  <i class="fa-solid fa-circle-check text-emerald mt-1"></i>
                  <span>{{ point }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Right Column: Fast Order Execution & Fundamental Stats -->
        <div class="col-lg-4">
          <!-- Fast Order Placement Card -->
          <div class="glass-card p-4 mb-4">
            <h5 class="fw-bold text-white mb-3">Instant Order Execution</h5>

            <!-- Buy / Sell Side Selector -->
            <div class="trade-side-tabs mb-3">
              <button 
                type="button" 
                class="side-tab buy" 
                [class.active]="side === 'BUY'" 
                (click)="side = 'BUY'"
              >
                BUY
              </button>
              <button 
                type="button" 
                class="side-tab sell" 
                [class.active]="side === 'SELL'" 
                (click)="side = 'SELL'"
              >
                SELL
              </button>
            </div>

            <!-- Order Type -->
            <div class="form-group mb-3">
              <label class="form-label text-xs text-muted fw-bold">TYPE</label>
              <div class="order-type-group">
                <button 
                  type="button" 
                  class="type-pill" 
                  [class.active]="orderType === 'MARKET'" 
                  (click)="orderType = 'MARKET'"
                >
                  Market
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

            <!-- Quantity -->
            <div class="form-group mb-3">
              <div class="d-flex justify-content-between text-xs mb-1">
                <span class="text-muted fw-bold">QUANTITY</span>
                <span class="text-muted">Max: {{ maxQuantity }} shares</span>
              </div>
              <input 
                type="number" 
                class="form-control form-control-glass font-mono fs-5 text-center fw-bold" 
                [(ngModel)]="quantity" 
                min="1" 
              />
              <div class="d-flex gap-1 mt-2">
                <button class="btn btn-glass btn-sm py-1 flex-fill text-xs" (click)="quantity = 5">5</button>
                <button class="btn btn-glass btn-sm py-1 flex-fill text-xs" (click)="quantity = 15">15</button>
                <button class="btn btn-glass btn-sm py-1 flex-fill text-xs" (click)="quantity = 50">50</button>
                <button class="btn btn-glass btn-sm py-1 flex-fill text-xs" (click)="quantity = 100">100</button>
              </div>
            </div>

            <!-- Limit Price -->
            <div class="form-group mb-3" *ngIf="orderType === 'LIMIT'">
              <label class="form-label text-xs text-muted fw-bold">TARGET LIMIT PRICE (₹)</label>
              <input 
                type="number" 
                class="form-control form-control-glass font-mono" 
                [(ngModel)]="targetPrice" 
              />
            </div>

            <!-- Stop Price -->
            <div class="form-group mb-3" *ngIf="orderType === 'STOP_LOSS'">
              <label class="form-label text-xs text-muted fw-bold">TRIGGER STOP PRICE (₹)</label>
              <input 
                type="number" 
                class="form-control form-control-glass font-mono" 
                [(ngModel)]="stopPrice" 
              />
            </div>

            <!-- Cost Calculations -->
            <div class="breakdown-card mb-3">
              <div class="d-flex justify-content-between text-xs mb-1">
                <span class="text-muted">Est. Order Value</span>
                <span class="font-mono text-white fw-bold">₹{{ estimatedTotal | number:'1.2-2' }}</span>
              </div>
              <div class="d-flex justify-content-between text-xs mb-1">
                <span class="text-muted">Est. Charges (0.05%)</span>
                <span class="font-mono text-muted">₹{{ (estimatedTotal * 0.0005) | number:'1.2-2' }}</span>
              </div>
              <div class="d-flex justify-content-between text-xs pt-2 border-top border-glass">
                <span class="text-white fw-bold">Net Total</span>
                <span class="font-mono text-emerald fw-bold">₹{{ (estimatedTotal * 1.0005) | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              class="btn w-100 py-2 fw-bold" 
              [ngClass]="side === 'BUY' ? 'btn-emerald' : 'btn-rose'"
              (click)="executeOrder()"
              [disabled]="isExecuting || quantity <= 0"
            >
              <i class="fa-solid" [ngClass]="isExecuting ? 'fa-spinner fa-spin' : (side === 'BUY' ? 'fa-cart-shopping' : 'fa-hand-holding-dollar')"></i>
              {{ side === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order' }}
            </button>
          </div>

          <!-- Fundamentals Card -->
          <div class="glass-card p-4">
            <h6 class="fw-bold text-white mb-3">Fundamental & Market Data</h6>
            <div class="fundamental-grid font-mono">
              <div class="fund-item">
                <span class="fund-label">Market Cap</span>
                <span class="fund-val">{{ stock.marketCap }}</span>
              </div>
              <div class="fund-item">
                <span class="fund-label">P/E Ratio</span>
                <span class="fund-val">{{ stock.peRatio }}</span>
              </div>
              <div class="fund-item">
                <span class="fund-label">EPS (TTM)</span>
                <span class="fund-val">₹{{ stock.eps }}</span>
              </div>
              <div class="fund-item">
                <span class="fund-label">Beta (1Y)</span>
                <span class="fund-val">{{ stock.beta }}</span>
              </div>
              <div class="fund-item">
                <span class="fund-label">Dividend Yield</span>
                <span class="fund-val">{{ stock.dividendYield }}%</span>
              </div>
              <div class="fund-item">
                <span class="fund-label">52W High</span>
                <span class="fund-val text-emerald">₹{{ stock.week52High | number:'1.2-2' }}</span>
              </div>
              <div class="fund-item">
                <span class="fund-label">52W Low</span>
                <span class="fund-val text-rose">₹{{ stock.week52Low | number:'1.2-2' }}</span>
              </div>
              <div class="fund-item">
                <span class="fund-label">Avg Daily Vol</span>
                <span class="fund-val">{{ stock.volume | number }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-black-subtle {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border-glass-subtle);
    }
    .stock-chart-canvas-box {
      position: relative;
      height: 320px;
      width: 100%;
    }
    .indicator-card {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-glass-subtle);
    }
    .trade-side-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      background: rgba(0, 0, 0, 0.4);
      padding: 4px;
      border-radius: 10px;
      border: 1px solid var(--border-glass);
    }
    .side-tab {
      padding: 8px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-weight: 700;
      font-size: 0.8rem;
      border-radius: 6px;
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
      gap: 4px;
    }
    .type-pill {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-glass);
      color: var(--text-secondary);
      padding: 6px 4px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
    }
    .type-pill.active {
      background: rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.5);
      color: #a5b4fc;
    }
    .breakdown-card {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-glass-subtle);
      border-radius: 10px;
      padding: 12px;
    }
    .fundamental-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .fund-item {
      display: flex;
      flex-direction: column;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border-glass-subtle);
    }
    .fund-label {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .fund-val {
      font-size: 0.85rem;
      font-weight: 700;
      color: #fff;
    }
  `]
})
export class StockDetailComponent implements OnInit, AfterViewInit {
  @ViewChild('stockChartCanvas') stockChartCanvas!: ElementRef<HTMLCanvasElement>;

  route = inject(ActivatedRoute);
  marketService = inject(MarketService);
  analysisService = inject(AnalysisService);
  tradingService = inject(TradingService);
  authService = inject(AuthService);
  notifyService = inject(NotificationService);

  stock: Stock | null = null;
  analysis: TechnicalAnalysis | null = null;
  history: StockPriceHistory[] = [];

  selectedTimeframe = '1M';
  side: OrderSide = 'BUY';
  orderType: OrderType = 'MARKET';
  quantity = 10;
  targetPrice?: number;
  stopPrice?: number;
  isExecuting = false;

  private chart?: Chart;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const symbol = params['symbol'] || 'RELIANCE';
      this.loadStockData(symbol);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.history.length > 0) {
        this.renderChart();
      }
    }, 200);
  }

  loadStockData(symbol: string): void {
    this.marketService.getStockBySymbol(symbol).subscribe(s => {
      if (s) {
        this.stock = s;
        this.targetPrice = s.currentPrice;
      }
    });

    this.analysisService.getTechnicalAnalysis(symbol).subscribe(a => {
      this.analysis = a;
      this.history = a.history || [];
      this.renderChart();
    });
  }

  setTimeframe(tf: string): void {
    this.selectedTimeframe = tf;
    this.renderChart();
  }

  private renderChart(): void {
    if (!this.stockChartCanvas || this.history.length === 0) return;
    const ctx = this.stockChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.history.map(h => h.date);
    const closePrices = this.history.map(h => h.close);

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    const isUp = (this.stock?.changePercent || 0) >= 0;
    if (isUp) {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${this.stock?.symbol} Price (₹)`,
          data: closePrices,
          borderColor: isUp ? '#10b981' : '#f43f5e',
          borderWidth: 2.5,
          fill: true,
          backgroundColor: gradient,
          tension: 0.2,
          pointRadius: 0,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#9ca3af',
            bodyColor: '#fff',
            callbacks: {
              label: (c) => ` Close: ₹${Number(c.parsed.y).toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#6b7280', font: { size: 10 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              callback: (val) => `₹${Number(val).toFixed(0)}`
            }
          }
        }
      }
    });
  }

  get price(): number {
    if (this.orderType === 'LIMIT' && this.targetPrice) return this.targetPrice;
    return this.stock ? this.stock.currentPrice : 1000;
  }

  get estimatedTotal(): number {
    return this.price * (this.quantity || 0);
  }

  get maxQuantity(): number {
    const user = this.authService.currentUser();
    if (!user || this.price <= 0) return 0;
    return Math.floor(user.virtualBalance / this.price);
  }

  executeOrder(): void {
    if (!this.stock || this.quantity <= 0) return;

    this.isExecuting = true;
    this.tradingService.placeOrder({
      symbol: this.stock.symbol,
      side: this.side,
      type: this.orderType,
      quantity: this.quantity,
      targetPrice: this.orderType === 'LIMIT' ? this.targetPrice : undefined,
      stopPrice: this.orderType === 'STOP_LOSS' ? this.stopPrice : undefined
    }).subscribe({
      next: (res) => {
        this.isExecuting = false;
        this.notifyService.success(
          'Order Executed', 
          `Successfully submitted ${this.side} order for ${this.quantity} shares of ${this.stock?.symbol}`
        );
      },
      error: () => {
        this.isExecuting = false;
        this.notifyService.error('Execution Failed', 'Failed to place order.');
      }
    });
  }
}
