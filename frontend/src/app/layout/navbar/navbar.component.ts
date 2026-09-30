import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { MarketService } from '../../core/services/market.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="navbar-container">
      <div class="navbar-left">
        <button class="toggle-sidebar-btn" (click)="toggleSidebar.emit()" title="Toggle Sidebar">
          <i class="fa-solid fa-bars-staggered"></i>
        </button>

        <!-- Global Search Bar -->
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (keyup.enter)="onSearch()"
            placeholder="Search stock symbol, company, or sector (e.g. RELIANCE, TCS)..." 
            class="search-input font-mono" 
          />
          <span class="search-shortcut">⌘K</span>
        </div>
      </div>

      <div class="navbar-right">
        <!-- Theme Toggle Button -->
        <button class="theme-toggle-btn" (click)="themeService.toggleTheme()" [title]="'Switch to ' + (themeService.currentTheme() === 'dark' ? 'Light' : 'Dark') + ' Mode'">
          <i class="fa-solid" [ngClass]="themeService.currentTheme() === 'dark' ? 'fa-sun text-amber' : 'fa-moon text-indigo'"></i>
        </button>

        <!-- Market Status Badge -->
        <div class="market-status-pill d-none d-md-flex">
          <span class="status-dot pulse-live"></span>
          <span class="status-text">NSE / BSE LIVE</span>
        </div>

        <!-- Virtual Cash Pill -->
        <div class="balance-pill" *ngIf="authService.currentUser() as user" (click)="openBalanceModal()">
          <div class="balance-meta">
            <span class="balance-label">VIRTUAL CASH</span>
            <span class="balance-amount font-mono">₹{{ user.virtualBalance | number:'1.2-2' }}</span>
          </div>
          <button class="balance-add-btn" title="Quick Top-up / Reset">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>

        <!-- Quick Trade Action Button -->
        <button class="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-2" (click)="openTradeModal.emit()">
          <i class="fa-solid fa-bolt"></i>
          <span class="d-none d-sm-inline">Quick Trade</span>
        </button>

        <!-- Guest Login / Register Buttons -->
        <div class="d-flex align-items-center gap-2" *ngIf="!authService.currentUser()">
          <a [routerLink]="['/login']" class="btn btn-glass btn-sm px-3 text-xs">
            <i class="fa-solid fa-right-to-bracket me-1"></i> Sign In
          </a>
          <a [routerLink]="['/register']" class="btn btn-emerald btn-sm px-3 text-xs">
            <i class="fa-solid fa-user-plus me-1"></i> Register
          </a>
        </div>

        <!-- User Profile Dropdown -->
        <div class="user-menu-wrapper" *ngIf="authService.currentUser() as user">
          <div class="user-avatar-btn" (click)="isDropdownOpen = !isDropdownOpen">
            <div class="avatar-circle">
              {{ user.fullName.charAt(0) || 'U' }}
            </div>
            <div class="user-details d-none d-lg-block text-start">
              <div class="user-name">{{ user.fullName }}</div>
              <div class="user-role-badge">
                <span class="badge" [ngClass]="user.role === 'ROLE_ADMIN' ? 'bg-amber-subtle' : 'bg-indigo-subtle'">
                  {{ user.role === 'ROLE_ADMIN' ? 'SUPER ADMIN' : 'TRADER' }}
                </span>
              </div>
            </div>
            <i class="fa-solid fa-chevron-down text-muted text-xs ms-1"></i>
          </div>

          <!-- Dropdown Menu -->
          <div class="user-dropdown-menu" *ngIf="isDropdownOpen" (mouseleave)="isDropdownOpen = false">
            <div class="dropdown-header">
              <div class="font-semibold text-white">{{ user.fullName }}</div>
              <div class="text-xs text-muted font-mono">{{ user.email }}</div>
            </div>
            <div class="dropdown-divider"></div>
            <a [routerLink]="['/profile']" class="dropdown-item" (click)="isDropdownOpen = false">
              <i class="fa-solid fa-user me-2 text-muted"></i> Account Profile
            </a>
            <a [routerLink]="['/trade']" class="dropdown-item" (click)="isDropdownOpen = false">
              <i class="fa-solid fa-bolt me-2 text-muted"></i> Buy & Sell Terminal
            </a>
            <a [routerLink]="['/portfolio']" class="dropdown-item" (click)="isDropdownOpen = false">
              <i class="fa-solid fa-briefcase me-2 text-muted"></i> My Portfolio
            </a>
            <a [routerLink]="['/analysis']" class="dropdown-item" (click)="isDropdownOpen = false">
              <i class="fa-solid fa-chart-candlestick me-2 text-muted"></i> Technical Analysis
            </a>
            <a [routerLink]="['/risk']" class="dropdown-item" (click)="isDropdownOpen = false">
              <i class="fa-solid fa-shield-halved me-2 text-muted"></i> Risk Radar
            </a>
            <a *ngIf="authService.isAdmin()" [routerLink]="['/admin']" class="dropdown-item text-amber" (click)="isDropdownOpen = false">
              <i class="fa-solid fa-shield-cat me-2"></i> Admin Portal
            </a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item text-rose" (click)="onResetBalance(); isDropdownOpen = false">
              <i class="fa-solid fa-rotate-left me-2"></i> Reset ₹10L Balance
            </button>
            <button class="dropdown-item text-muted" (click)="onLogout(); isDropdownOpen = false">
              <i class="fa-solid fa-right-from-bracket me-2"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-container {
      height: 64px;
      background: var(--bg-card-glass);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-glass);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 30;
      transition: background 0.25s, border-color 0.25s;
    }
    .navbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
      max-width: 600px;
    }
    .toggle-sidebar-btn, .theme-toggle-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-glass);
      color: var(--text-secondary);
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    [data-theme="light"] .toggle-sidebar-btn, [data-theme="light"] .theme-toggle-btn {
      background: #f1f5f9;
      border-color: rgba(0, 0, 0, 0.1);
    }
    .toggle-sidebar-btn:hover, .theme-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
      transform: translateY(-1px);
    }
    .search-box {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    .search-input {
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border-glass);
      border-radius: 10px;
      padding: 9px 40px 9px 38px;
      color: var(--text-primary);
      font-size: 0.825rem;
      transition: all 0.2s;
    }
    .search-input:focus {
      background: var(--bg-card-hover);
      border-color: rgba(99, 102, 241, 0.5);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
      outline: none;
    }
    .search-shortcut {
      position: absolute;
      right: 12px;
      font-size: 0.7rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-glass);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--text-muted);
    }
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .market-status-pill {
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      padding: 6px 12px;
      border-radius: 9999px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    .status-text {
      font-size: 0.72rem;
      font-weight: 700;
      color: #10b981;
      letter-spacing: 0.06em;
    }
    .balance-pill {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border-glass);
      padding: 6px 14px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    [data-theme="light"] .balance-pill {
      background: #f8fafc;
      border-color: rgba(0, 0, 0, 0.08);
    }
    .balance-pill:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(16, 185, 129, 0.4);
    }
    .balance-meta {
      display: flex;
      flex-direction: column;
    }
    .balance-label {
      font-size: 0.65rem;
      color: var(--text-muted);
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .balance-amount {
      font-size: 0.88rem;
      font-weight: 700;
      color: #10b981;
    }
    .balance-add-btn {
      background: rgba(16, 185, 129, 0.2);
      border: none;
      color: #10b981;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
    }
    .user-menu-wrapper {
      position: relative;
    }
    .user-avatar-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-glass);
      padding: 4px 10px 4px 4px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    [data-theme="light"] .user-avatar-btn {
      background: #f8fafc;
      border-color: rgba(0, 0, 0, 0.08);
    }
    .user-avatar-btn:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: #fff;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
    .user-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.1;
    }
    .user-role-badge .badge {
      font-size: 0.65rem;
      padding: 1px 6px;
      font-weight: 600;
    }
    .user-dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 220px;
      background: var(--bg-card);
      border: 1px solid var(--border-glass-hover);
      border-radius: 14px;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(16px);
      padding: 8px;
      z-index: 50;
      animation: fadeIn 0.15s ease-out;
    }
    .dropdown-header {
      padding: 8px 12px;
    }
    .dropdown-divider {
      height: 1px;
      background: var(--border-glass);
      margin: 6px 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 0.8rem;
      border-radius: 8px;
      transition: all 0.15s;
      background: transparent;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }
    .dropdown-item:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    [data-theme="light"] .dropdown-item:hover {
      background: #f1f5f9;
    }
  `]
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() openTradeModal = new EventEmitter<void>();

  authService = inject(AuthService);
  themeService = inject(ThemeService);
  notifyService = inject(NotificationService);
  router = inject(Router);

  searchQuery = '';
  isDropdownOpen = false;

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/market'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  openBalanceModal(): void {
    this.router.navigate(['/profile']);
  }

  onResetBalance(): void {
    this.authService.resetBalance().subscribe(() => {
      this.notifyService.success('Balance Reset', 'Your virtual cash balance has been reset to ₹10,00,000.00');
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.notifyService.info('Logged Out', 'You have been logged out.');
    this.router.navigate(['/market']);
  }
}
