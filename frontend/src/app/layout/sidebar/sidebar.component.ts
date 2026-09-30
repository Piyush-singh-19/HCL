import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
  badgeClass?: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-container" [class.collapsed]="isCollapsed">
      <!-- Brand Header -->
      <div class="brand-wrapper">
        <a [routerLink]="['/dashboard']" class="brand-link">
          <div class="brand-logo">
            <i class="fa-solid fa-chart-line"></i>
          </div>
          <div class="brand-text" *ngIf="!isCollapsed">
            <span class="brand-title">Portfolio<span class="brand-accent">Pro</span></span>
            <span class="brand-subtitle">QUANTITATIVE TRADING</span>
          </div>
        </a>
      </div>

      <!-- Navigation Links -->
      <div class="nav-section">
        <div class="section-label" *ngIf="!isCollapsed">MAIN MENU</div>
        
        <nav class="nav-links">
          <ng-container *ngFor="let item of navItems">
            <a 
              *ngIf="!item.adminOnly || authService.isAdmin()"
              [routerLink]="item.path" 
              routerLinkActive="active" 
              class="nav-item-link"
              [title]="item.label"
            >
              <div class="nav-icon-box">
                <i [class]="item.icon"></i>
              </div>
              <span class="nav-label" *ngIf="!isCollapsed">{{ item.label }}</span>
              <span *ngIf="item.badge && !isCollapsed" class="nav-badge" [ngClass]="item.badgeClass || 'bg-indigo-subtle'">
                {{ item.badge }}
              </span>
            </a>
          </ng-container>
        </nav>
      </div>

      <!-- Admin Section -->
      <div class="nav-section" *ngIf="authService.isAdmin()">
        <div class="section-label" *ngIf="!isCollapsed">ADMINISTRATION</div>
        <nav class="nav-links">
          <a [routerLink]="['/admin']" routerLinkActive="active" class="nav-item-link admin-link" title="Admin Portal">
            <div class="nav-icon-box">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <span class="nav-label" *ngIf="!isCollapsed">Admin Portal</span>
            <span *ngIf="!isCollapsed" class="nav-badge bg-amber-subtle">PRO</span>
          </a>
        </nav>
      </div>

      <!-- Bottom Platform Quick Card -->
      <div class="sidebar-bottom-card" *ngIf="!isCollapsed">
        <div class="platform-info">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <span class="text-xs font-semibold text-muted">SIMULATOR ENGINE</span>
            <span class="badge bg-emerald-subtle text-xs">ONLINE</span>
          </div>
          <div class="text-xs text-secondary mb-2">Paper trading with real-time NSE simulation and parametric risk engine.</div>
          <div class="d-flex align-items-center gap-2">
            <div class="latency-indicator">
              <span class="latency-dot"></span>
              <span class="font-mono text-xs text-muted">14ms latency</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 260px;
      height: 100vh;
      background: #0d1322;
      border-right: 1px solid var(--border-glass);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 35;
      overflow-y: auto;
    }
    .sidebar-container.collapsed {
      width: 80px;
    }
    .brand-wrapper {
      padding: 22px 20px;
      border-bottom: 1px solid var(--border-glass);
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .brand-logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.2rem;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
      flex-shrink: 0;
    }
    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    .brand-accent {
      color: #10b981;
    }
    .brand-subtitle {
      font-size: 0.6rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.1em;
      display: block;
    }
    .nav-section {
      padding: 16px 14px 8px;
    }
    .section-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.08em;
      padding: 0 10px 8px;
    }
    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .nav-item-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.18s ease;
      position: relative;
    }
    .nav-item-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      transform: translateX(2px);
    }
    .nav-item-link.active {
      background: linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%);
      color: #818cf8;
      font-weight: 600;
      border-left: 3px solid #6366f1;
    }
    .admin-link.active {
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%);
      color: #fbbf24;
      border-left-color: #f59e0b;
    }
    .nav-icon-box {
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .nav-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .nav-badge {
      font-size: 0.68rem;
      padding: 2px 7px;
      border-radius: 6px;
      font-weight: 600;
    }
    .sidebar-bottom-card {
      margin-top: auto;
      padding: 16px 14px 20px;
    }
    .platform-info {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-glass);
      border-radius: 12px;
      padding: 12px;
    }
    .latency-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .latency-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
  `]
})
export class SidebarComponent {
  @Input() isCollapsed = false;

  authService = inject(AuthService);

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-table-columns' },
    { path: '/market', label: 'Market Overview', icon: 'fa-solid fa-chart-line', badge: 'LIVE', badgeClass: 'bg-emerald-subtle' },
    { path: '/trade', label: 'Buy & Sell', icon: 'fa-solid fa-bolt', badge: 'DMA', badgeClass: 'bg-emerald-subtle' },
    { path: '/portfolio', label: 'Portfolio & Holdings', icon: 'fa-solid fa-briefcase' },
    { path: '/orders', label: 'Orders Book', icon: 'fa-solid fa-clock-rotate-left' },
    { path: '/trades', label: 'Trade Ledger', icon: 'fa-solid fa-receipt' },
    { path: '/risk', label: 'Risk Analysis Radar', icon: 'fa-solid fa-shield-halved', badge: 'VaR 95%', badgeClass: 'bg-rose-subtle' },
    { path: '/analysis', label: 'Technical Analysis', icon: 'fa-solid fa-chart-candlestick' },
    { path: '/profile', label: 'Trader Profile', icon: 'fa-solid fa-user-gear' }
  ];
}
