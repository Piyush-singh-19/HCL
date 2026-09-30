import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketService } from '../../core/services/market.service';

@Component({
  selector: 'app-ticker',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="ticker-wrapper">
      <div class="ticker-content">
        <div class="ticker-item" *ngFor="let stock of marketService.liveTickers()">
          <a [routerLink]="['/market', stock.symbol]" class="ticker-link">
            <span class="ticker-symbol">{{ stock.symbol }}</span>
            <span class="ticker-price font-mono">₹{{ stock.currentPrice | number:'1.2-2' }}</span>
            <span class="ticker-change font-mono" [ngClass]="stock.changePercent >= 0 ? 'text-emerald' : 'text-rose'">
              <i class="fa-solid" [ngClass]="stock.changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down'"></i>
              {{ stock.changePercent >= 0 ? '+' : '' }}{{ stock.changePercent | number:'1.2-2' }}%
            </span>
          </a>
        </div>
        <!-- Duplicate for smooth infinite scroll -->
        <div class="ticker-item" *ngFor="let stock of marketService.liveTickers()">
          <a [routerLink]="['/market', stock.symbol]" class="ticker-link">
            <span class="ticker-symbol">{{ stock.symbol }}</span>
            <span class="ticker-price font-mono">₹{{ stock.currentPrice | number:'1.2-2' }}</span>
            <span class="ticker-change font-mono" [ngClass]="stock.changePercent >= 0 ? 'text-emerald' : 'text-rose'">
              <i class="fa-solid" [ngClass]="stock.changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down'"></i>
              {{ stock.changePercent >= 0 ? '+' : '' }}{{ stock.changePercent | number:'1.2-2' }}%
            </span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ticker-wrapper {
      background: rgba(11, 15, 25, 0.95);
      border-bottom: 1px solid var(--border-glass);
      height: 36px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      z-index: 40;
    }
    .ticker-content {
      display: flex;
      white-space: nowrap;
      animation: tickerScroll 35s linear infinite;
    }
    .ticker-content:hover {
      animation-play-state: paused;
    }
    @keyframes tickerScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .ticker-item {
      display: inline-flex;
      align-items: center;
      padding: 0 18px;
    }
    .ticker-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.78rem;
      transition: color 0.15s ease;
    }
    .ticker-link:hover {
      color: #ffffff;
    }
    .ticker-symbol {
      font-weight: 700;
      color: #e2e8f0;
      letter-spacing: 0.03em;
    }
    .ticker-price {
      color: #f8fafc;
      font-weight: 500;
    }
    .ticker-change {
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
  `]
})
export class TickerComponent {
  marketService = inject(MarketService);
}
