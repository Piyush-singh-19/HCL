import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MarketService } from '../../core/services/market.service';
import { AnalysisService } from '../../core/services/analysis.service';
import { Stock, StockPriceHistory } from '../../core/models/stock.model';
import { TechnicalAnalysis } from '../../core/models/analysis.model';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal.component';

Chart.register(...registerables);

@Component({
  selector: 'app-analysis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TradeModalComponent],
  template: `
    <div class="analysis-page animate-fade-in" *ngIf="analysis">
      <!-- Top Header & Stock Switcher -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="fw-extrabold text-white mb-0">Technical Analysis Workstation</h2>
            <span class="badge bg-indigo-subtle font-mono text-xs">ALGORITHMIC SIGNALS</span>
          </div>
          <p class="text-secondary text-sm mb-0">Quantitative momentum oscillators, moving average crossovers, and Bollinger volatility bands.</p>
        </div>

        <div class="d-flex align-items-center gap-3">
          <!-- Stock Selector Dropdown -->
          <div class="d-flex align-items-center gap-2 glass-card px-3 py-1">
            <label class="text-xs text-muted fw-bold mb-0">ASSET:</label>
            <select class="form-select form-control-glass border-0 font-mono py-1 px-2 text-sm fw-bold text-white bg-transparent" [(ngModel)]="selectedSymbol" (change)="onStockSelect()">
              <option *ngFor="let s of allStocks" [value]="s.symbol" class="bg-dark text-white">
                {{ s.symbol }} (₹{{ s.currentPrice | number:'1.2-2' }})
              </option>
            </select>
          </div>

          <button class="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-2" (click)="openTradeModal()">
            <i class="fa-solid fa-bolt"></i>
            <span>Trade {{ selectedSymbol }}</span>
          </button>
        </div>
      </div>

      <!-- Algorithmic Signal Hero Banner -->
      <div class="glass-card p-4 mb-4">
        <div class="row align-items-center gy-3">
          <div class="col-lg-6">
            <div class="d-flex align-items-center gap-3 mb-2">
              <span class="font-mono fs-2 fw-extrabold text-white">{{ analysis.symbol }}</span>
              <span class="fs-5 text-secondary">|</span>
              <span class="fs-6 text-secondary">{{ analysis.name }}</span>
            </div>
            <div class="d-flex align-items-baseline gap-3">
              <div class="font-mono fs-3 fw-bold text-white">₹{{ analysis.currentPrice | number:'1.2-2' }}</div>
              <div class="text-xs text-muted font-mono">Calculated from 30-day price matrix</div>
            </div>
          </div>

          <div class="col-lg-6 d-flex flex-column flex-sm-row align-items-sm-center justify-content-lg-end gap-3">
            <div class="signal-score-badge p-3 rounded-3 text-center" [ngClass]="getSignalBgClass(analysis.overallSignal)">
              <span class="text-xs fw-bold text-muted d-block">OVERALL ALGO SIGNAL</span>
              <span class="fs-4 fw-extrabold" [ngClass]="getSignalTextClass(analysis.overallSignal)">
                {{ analysis.overallSignal }}
              </span>
            </div>

            <div class="bullish-score-box p-3 rounded-3 text-center glass-card">
              <span class="text-xs text-muted fw-bold d-block">BULLISH SCORE</span>
              <div class="font-mono fs-4 fw-extrabold text-cyan">{{ analysis.bullishScore }}/100</div>
            </div>
          </div>
        </div>

        <!-- Strategy Insight -->
        <div class="p-3 mt-3 rounded-3" style="background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25);">
          <div class="d-flex align-items-start gap-2">
            <i class="fa-solid fa-wand-magic-sparkles text-indigo mt-1"></i>
            <div>
              <span class="text-xs text-indigo fw-bold d-block mb-1">AUTOMATED SIGNAL RATIONALE</span>
              <span class="text-sm text-white">{{ analysis.signalReason }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Technical Indicators Matrix -->
      <div class="row g-4 mb-4">
        <!-- RSI (14) Card -->
        <div class="col-lg-3 col-md-6">
          <div class="glass-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="text-xs text-muted fw-bold d-block">RSI (14-PERIOD)</span>
                <span class="text-xs text-secondary">Relative Strength</span>
              </div>
              <div class="stat-icon bg-indigo-subtle">
                <i class="fa-solid fa-gauge-high text-indigo"></i>
              </div>
            </div>
            <div class="font-mono fs-2 fw-extrabold text-white my-2">{{ analysis.rsi14 }}</div>
            <div class="d-flex align-items-center justify-content-between text-xs">
              <span class="badge bg-emerald-subtle">{{ analysis.rsiCondition }}</span>
              <span class="text-muted font-mono">Range: 30 - 70</span>
            </div>
            <!-- RSI Progress Line -->
            <div class="progress mt-3" style="height: 6px; background: rgba(255,255,255,0.1);">
              <div 
                class="progress-bar" 
                [ngClass]="analysis.rsi14 >= 70 ? 'bg-rose' : (analysis.rsi14 <= 30 ? 'bg-amber' : 'bg-emerald')" 
                [style.width.%]="analysis.rsi14"
              ></div>
            </div>
          </div>
        </div>

        <!-- MACD Card -->
        <div class="col-lg-3 col-md-6">
          <div class="glass-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="text-xs text-muted fw-bold d-block">MACD (12, 26, 9)</span>
                <span class="text-xs text-secondary">Momentum Crossover</span>
              </div>
              <div class="stat-icon bg-cyan-subtle">
                <i class="fa-solid fa-chart-line text-cyan"></i>
              </div>
            </div>
            <div class="font-mono fs-2 fw-extrabold text-cyan my-2">+{{ analysis.macdHistogram }}</div>
            <div class="d-flex align-items-center justify-content-between text-xs">
              <span class="badge bg-cyan-subtle">{{ analysis.macdSignal }}</span>
              <span class="text-muted font-mono">MACD: {{ analysis.macdLine }}</span>
            </div>
            <div class="text-xs text-secondary mt-2 font-mono">
              Signal Line: <strong class="text-white">{{ analysis.signalLine }}</strong>
            </div>
          </div>
        </div>

        <!-- Moving Averages Card -->
        <div class="col-lg-3 col-md-6">
          <div class="glass-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="text-xs text-muted fw-bold d-block">MOVING AVERAGES</span>
                <span class="text-xs text-secondary">Trend Direction</span>
              </div>
              <div class="stat-icon bg-emerald-subtle">
                <i class="fa-solid fa-arrow-trend-up text-emerald"></i>
              </div>
            </div>
            <div class="mt-2 font-mono text-xs">
              <div class="d-flex justify-content-between py-1 border-bottom border-glass-subtle">
                <span class="text-muted">SMA 20:</span>
                <span class="text-white fw-bold">₹{{ analysis.sma20 | number:'1.2-2' }}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom border-glass-subtle">
                <span class="text-muted">SMA 50:</span>
                <span class="text-white fw-bold">₹{{ analysis.sma50 | number:'1.2-2' }}</span>
              </div>
              <div class="d-flex justify-content-between py-1">
                <span class="text-muted">EMA 12:</span>
                <span class="text-emerald fw-bold">₹{{ analysis.ema12 | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bollinger Bands Card -->
        <div class="col-lg-3 col-md-6">
          <div class="glass-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="text-xs text-muted fw-bold d-block">BOLLINGER BANDS</span>
                <span class="text-xs text-secondary">Volatility Envelopes</span>
              </div>
              <div class="stat-icon bg-amber-subtle">
                <i class="fa-solid fa-arrows-up-down text-amber"></i>
              </div>
            </div>
            <div class="mt-2 font-mono text-xs">
              <div class="d-flex justify-content-between py-1 border-bottom border-glass-subtle">
                <span class="text-muted">Upper (2σ):</span>
                <span class="text-rose fw-bold">₹{{ analysis.bbUpper | number:'1.2-2' }}</span>
              </div>
              <div class="d-flex justify-content-between py-1 border-bottom border-glass-subtle">
                <span class="text-muted">Middle (20):</span>
                <span class="text-white fw-bold">₹{{ analysis.bbMiddle | number:'1.2-2' }}</span>
              </div>
              <div class="d-flex justify-content-between py-1">
                <span class="text-muted">Lower (2σ):</span>
                <span class="text-emerald fw-bold">₹{{ analysis.bbLower | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive Indicator Chart & Signal Breakdown -->
      <div class="row g-4 mb-4">
        <!-- Chart Canvas -->
        <div class="col-lg-8">
          <div class="glass-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 class="fw-bold text-white mb-0">{{ selectedSymbol }} Historical Technical Trend</h5>
                <span class="text-xs text-muted">Daily Close vs 20-Day Simple Moving Average</span>
              </div>
              <span class="badge bg-indigo-subtle font-mono text-xs">30 DAYS</span>
            </div>
            <div class="analysis-chart-canvas-box">
              <canvas #analysisChartCanvas></canvas>
            </div>
          </div>
        </div>

        <!-- Signal Insights Breakdown -->
        <div class="col-lg-4">
          <div class="glass-card p-4 h-100">
            <h5 class="fw-bold text-white mb-3">Algorithmic Breakdown</h5>
            <div class="insights-list">
              <div *ngFor="let point of analysis.signalBreakdown" class="insight-item p-3 mb-2 rounded-3">
                <div class="d-flex align-items-start gap-2">
                  <i class="fa-solid fa-circle-check text-emerald mt-1"></i>
                  <span class="text-xs text-secondary">{{ point }}</span>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-top border-glass">
              <button class="btn btn-indigo btn-sm w-100 py-2 fw-bold" [routerLink]="['/market', selectedSymbol]">
                View Full Fundamental Data →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Trade Modal -->
    <app-trade-modal 
      [isOpen]="isTradeModalOpen" 
      [stock]="tradeStock"
      (closeEvent)="isTradeModalOpen = false"
    ></app-trade-modal>
  `,
  styles: [`
    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
    }
    .signal-score-badge {
      min-width: 170px;
    }
    .bullish-score-box {
      min-width: 140px;
    }
    .analysis-chart-canvas-box {
      position: relative;
      height: 300px;
      width: 100%;
    }
    .insight-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-glass-subtle);
    }
    .bg-rose { background-color: #f43f5e !important; }
    .bg-amber { background-color: #f59e0b !important; }
    .bg-emerald { background-color: #10b981 !important; }
  `]
})
export class AnalysisComponent implements OnInit, AfterViewInit {
  @ViewChild('analysisChartCanvas') analysisChartCanvas!: ElementRef<HTMLCanvasElement>;

  route = inject(ActivatedRoute);
  marketService = inject(MarketService);
  analysisService = inject(AnalysisService);

  allStocks: Stock[] = [];
  selectedSymbol = 'RELIANCE';
  analysis: TechnicalAnalysis | null = null;
  history: StockPriceHistory[] = [];

  isTradeModalOpen = false;
  tradeStock: Stock | null = null;
  private chart?: any;

  ngOnInit(): void {
    this.marketService.getStocks().subscribe(stocks => {
      this.allStocks = stocks;
      this.route.params.subscribe(params => {
        const symbol = params['symbol'] || (stocks.length > 0 ? stocks[0].symbol : 'RELIANCE');
        this.selectedSymbol = symbol;
        this.loadAnalysis(symbol);
      });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.history.length > 0) {
        this.renderChart();
      }
    }, 200);
  }

  onStockSelect(): void {
    this.loadAnalysis(this.selectedSymbol);
  }

  loadAnalysis(symbol: string): void {
    this.analysisService.getTechnicalAnalysis(symbol).subscribe(a => {
      this.analysis = a;
      this.history = a.history || [];
      this.renderChart();
    });
  }

  private renderChart(): void {
    if (!this.analysisChartCanvas || this.history.length === 0) return;
    const ctx = this.analysisChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.history.map(h => h.date);
    const closePrices = this.history.map(h => h.close);
    // 20-day SMA simulation
    const smaValues = closePrices.map((val, idx, arr) => {
      const slice = arr.slice(Math.max(0, idx - 19), idx + 1);
      const avg = slice.reduce((sum, v) => sum + v, 0) / slice.length;
      return parseFloat(avg.toFixed(2));
    });

    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${this.selectedSymbol} Close (₹)`,
            data: closePrices,
            borderColor: '#818cf8',
            borderWidth: 2.5,
            fill: true,
            backgroundColor: gradient,
            tension: 0.2,
            pointRadius: 0,
            pointHoverRadius: 5
          },
          {
            label: '20-Day SMA',
            data: smaValues,
            borderColor: '#f59e0b',
            borderWidth: 1.8,
            borderDash: [5, 5],
            fill: false,
            tension: 0.2,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#9ca3af', font: { size: 11 }, usePointStyle: true }
          },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#fff',
            callbacks: {
              label: (c) => ` ${c.dataset.label}: ₹${Number(c.parsed.y).toFixed(2)}`
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
              callback: (v) => `₹${Number(v).toFixed(0)}`
            }
          }
        }
      }
    });
  }

  getSignalBgClass(signal: string): string {
    if (signal === 'STRONG_BUY' || signal === 'BUY') return 'bg-emerald-subtle';
    if (signal === 'SELL' || signal === 'STRONG_SELL') return 'bg-rose-subtle';
    return 'bg-amber-subtle';
  }

  getSignalTextClass(signal: string): string {
    if (signal === 'STRONG_BUY' || signal === 'BUY') return 'text-emerald';
    if (signal === 'SELL' || signal === 'STRONG_SELL') return 'text-rose';
    return 'text-amber';
  }

  openTradeModal(): void {
    const stock = this.allStocks.find((s) => s.symbol === this.selectedSymbol);
    if (stock) {
      this.tradeStock = stock;
      this.isTradeModalOpen = true;
    } else {
      this.marketService.getStockBySymbol(this.selectedSymbol).subscribe((stk) => {
        this.tradeStock = stk;
        this.isTradeModalOpen = true;
      });
    }
  }
}
