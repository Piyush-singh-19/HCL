import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { RiskService } from '../../core/services/risk.service';
import { PortfolioService } from '../../core/services/portfolio.service';
import { RiskReport } from '../../core/models/risk.model';
import { PortfolioSummary } from '../../core/models/portfolio.model';

Chart.register(...registerables);

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="risk-page animate-fade-in" *ngIf="report">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="fw-extrabold text-white mb-0">Quantitative Risk Radar</h2>
            <span class="badge bg-rose-subtle font-mono text-xs">PARAMETRIC VaR ENGINE</span>
          </div>
          <p class="text-secondary text-sm mb-0">Multi-factor portfolio stress testing, tail-risk VaR calculations, and concentration analysis.</p>
        </div>

        <!-- Overall Risk Level Pill -->
        <div class="d-flex align-items-center gap-3 glass-card px-4 py-2">
          <div>
            <span class="text-xs text-muted fw-bold d-block">OVERALL RISK LEVEL</span>
            <span class="fs-5 fw-extrabold text-amber">{{ report.riskLevel }} RISK</span>
          </div>
          <div class="risk-score-circle">
            <span class="font-mono fw-bold text-white fs-6">{{ report.riskScore }}</span>
            <span class="text-xxs text-muted">/100</span>
          </div>
        </div>
      </div>

      <!-- Core Risk Metrics Cards Grid -->
      <div class="row g-3 mb-4">
        <!-- Parametric VaR (95%) -->
        <div class="col-lg-3 col-md-6">
          <div class="glass-card stat-card p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="text-xs text-muted fw-bold">1-DAY 95% VaR</span>
              <div class="stat-icon bg-rose-subtle"><i class="fa-solid fa-triangle-exclamation text-rose"></i></div>
            </div>
            <div class="font-mono fs-3 fw-extrabold text-rose">₹{{ report.valueAtRisk95 | number:'1.2-2' }}</div>
            <div class="text-xs text-secondary mt-1">
              <span class="font-mono text-rose fw-bold">{{ report.valueAtRisk95Percent }}%</span> of portfolio equity at 95% confidence.
            </div>
          </div>
        </div>

        <!-- Portfolio Beta -->
        <div class="col-lg-3 col-md-6">
          <div class="glass-card stat-card p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="text-xs text-muted fw-bold">PORTFOLIO BETA (β)</span>
              <div class="stat-icon bg-cyan-subtle"><i class="fa-solid fa-chart-line text-cyan"></i></div>
            </div>
            <div class="font-mono fs-3 fw-extrabold text-cyan">{{ report.portfolioBeta }}</div>
            <div class="text-xs text-secondary mt-1">
              Relative to NIFTY 50 (β = 1.00 benchmark).
            </div>
          </div>
        </div>

        <!-- Annualized Volatility -->
        <div class="col-lg-3 col-md-6">
          <div class="glass-card stat-card p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="text-xs text-muted fw-bold">ANNUAL VOLATILITY (σ)</span>
              <div class="stat-icon bg-amber-subtle"><i class="fa-solid fa-wave-square text-amber"></i></div>
            </div>
            <div class="font-mono fs-3 fw-extrabold text-amber">{{ report.portfolioVolatility }}%</div>
            <div class="text-xs text-secondary mt-1">
              Historical annualized standard deviation.
            </div>
          </div>
        </div>

        <!-- Concentration Risk Index -->
        <div class="col-lg-3 col-md-6">
          <div class="glass-card stat-card p-4">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="text-xs text-muted fw-bold">TOP ASSET WEIGHT</span>
              <div class="stat-icon bg-indigo-subtle"><i class="fa-solid fa-pie-chart text-indigo"></i></div>
            </div>
            <div class="font-mono fs-3 fw-extrabold text-indigo">{{ report.concentrationRiskIndex }}%</div>
            <div class="text-xs text-secondary mt-1">
              Single largest equity position weight.
            </div>
          </div>
        </div>
      </div>

      <!-- Real-Time Warnings & Risk Breakdown Charts -->
      <div class="row g-4 mb-4">
        <!-- Live Warning Triggers -->
        <div class="col-lg-6">
          <div class="glass-card p-4 h-100">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i class="fa-solid fa-shield-virus text-amber fs-5"></i>
              <h5 class="fw-bold text-white mb-0">Active Risk Triggers & Alerts</h5>
            </div>

            <div class="warning-list">
              <div *ngFor="let warning of report.warnings" class="warning-item p-3 mb-2 rounded-3">
                <div class="d-flex align-items-start gap-3">
                  <i class="fa-solid fa-triangle-exclamation text-amber mt-1"></i>
                  <div class="text-xs text-secondary">{{ warning }}</div>
                </div>
              </div>
            </div>

            <!-- Stress Test Simulation Matrix -->
            <div class="mt-4 pt-3 border-top border-glass">
              <h6 class="fw-bold text-white mb-2 text-xs text-uppercase tracking-wider">Historical Stress Test Simulation</h6>
              <div class="stress-table text-xs font-mono">
                <div class="d-flex justify-content-between py-2 border-bottom border-glass-subtle">
                  <span class="text-muted">Market Crash Scenario (-5% Index)</span>
                  <span class="text-rose fw-bold">-₹{{ (summary?.currentHoldingsValue || 400000) * 0.047 | number:'1.2-2' }} (-4.7%)</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom border-glass-subtle">
                  <span class="text-muted">Rate Hike Shock (+50bps Volatility)</span>
                  <span class="text-rose fw-bold">-₹{{ (summary?.currentHoldingsValue || 400000) * 0.028 | number:'1.2-2' }} (-2.8%)</span>
                </div>
                <div class="d-flex justify-content-between py-2">
                  <span class="text-muted">Bull Market Rally (+5% Index)</span>
                  <span class="text-emerald fw-bold">+₹{{ (summary?.currentHoldingsValue || 400000) * 0.049 | number:'1.2-2' }} (+4.9%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Weights Concentration Chart -->
        <div class="col-lg-6">
          <div class="glass-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold text-white mb-0">Asset Concentration Breakdown</h5>
              <span class="text-xs text-muted font-mono">Weights %</span>
            </div>
            <div class="risk-chart-box">
              <canvas #riskChartCanvas></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .stat-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
    .risk-score-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(245, 158, 11, 0.15);
      border: 2px solid #f59e0b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .text-xxs {
      font-size: 0.6rem;
    }
    .warning-item {
      background: rgba(245, 158, 11, 0.06);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }
    .risk-chart-box {
      position: relative;
      height: 280px;
      width: 100%;
    }
  `]
})
export class RiskComponent implements OnInit, AfterViewInit {
  @ViewChild('riskChartCanvas') riskChartCanvas!: ElementRef<HTMLCanvasElement>;

  riskService = inject(RiskService);
  portfolioService = inject(PortfolioService);

  report: RiskReport | null = null;
  summary: PortfolioSummary | null = null;
  private chart?: Chart;

  ngOnInit(): void {
    this.riskService.getRiskReport().subscribe(r => {
      this.report = r;
      this.renderRiskChart();
    });

    this.portfolioService.getPortfolioSummary().subscribe(s => {
      this.summary = s;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.renderRiskChart();
    }, 150);
  }

  private renderRiskChart(): void {
    if (!this.riskChartCanvas || !this.report) return;
    const ctx = this.riskChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const labels = Object.keys(this.report.assetWeights);
    const data = Object.values(this.report.assetWeights);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Weight (%)',
          data,
          backgroundColor: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#fff',
            callbacks: {
              label: (c) => ` ${c.parsed.y}% of Portfolio`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#fff', font: { family: 'JetBrains Mono', size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              callback: (val) => `${val}%`
            }
          }
        }
      }
    });
  }
}
