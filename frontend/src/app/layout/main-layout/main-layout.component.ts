import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TickerComponent } from '../ticker/ticker.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal.component';
import { NotificationService } from '../../core/services/notification.service';
import { Stock } from '../../core/models/stock.model';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TickerComponent, 
    SidebarComponent, 
    NavbarComponent, 
    TradeModalComponent
  ],
  template: `
    <div class="app-layout-root">
      <!-- Top Live Market Ticker -->
      <app-ticker></app-ticker>

      <div class="layout-body">
        <!-- Sidebar Navigation -->
        <app-sidebar [isCollapsed]="isSidebarCollapsed"></app-sidebar>

        <!-- Main Viewport Column -->
        <div class="viewport-column">
          <app-navbar 
            (toggleSidebar)="toggleSidebar()" 
            (openTradeModal)="openGlobalTradeModal()"
          ></app-navbar>

          <main class="page-content-wrapper">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>

      <!-- Global Trade Modal -->
      <app-trade-modal 
        [isOpen]="isTradeModalOpen" 
        [stock]="selectedStockForTrade"
        (closeEvent)="isTradeModalOpen = false"
      ></app-trade-modal>

      <!-- Global Toast Notifications Overlay -->
      <div class="toast-container-fixed">
        <div 
          *ngFor="let toast of notifyService.toasts()" 
          class="toast-card"
          [ngClass]="'toast-' + toast.type"
        >
          <div class="toast-icon">
            <i class="fa-solid" [class]="toast.icon"></i>
          </div>
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="notifyService.remove(toast.id)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-layout-root {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-main);
    }
    .layout-body {
      display: flex;
      flex: 1;
      position: relative;
    }
    .viewport-column {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      overflow-x: hidden;
    }
    .page-content-wrapper {
      flex: 1;
      padding: 24px;
      background: #090d16;
    }
    .toast-container-fixed {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }
    .toast-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 14px;
      background: #111827;
      border: 1px solid var(--border-glass-hover);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(12px);
      animation: toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .toast-icon {
      font-size: 1.1rem;
      margin-top: 2px;
    }
    .toast-title {
      font-weight: 700;
      font-size: 0.85rem;
      color: #fff;
    }
    .toast-message {
      font-size: 0.78rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .toast-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.8rem;
      margin-left: auto;
    }
    .toast-close:hover {
      color: #fff;
    }
    .toast-success {
      border-left: 4px solid #10b981;
    }
    .toast-success .toast-icon {
      color: #10b981;
    }
    .toast-danger {
      border-left: 4px solid #f43f5e;
    }
    .toast-danger .toast-icon {
      color: #f43f5e;
    }
    .toast-warning {
      border-left: 4px solid #f59e0b;
    }
    .toast-warning .toast-icon {
      color: #f59e0b;
    }
    .toast-info {
      border-left: 4px solid #6366f1;
    }
    .toast-info .toast-icon {
      color: #818cf8;
    }
  `]
})
export class MainLayoutComponent {
  notifyService = inject(NotificationService);

  isSidebarCollapsed = false;
  isTradeModalOpen = false;
  selectedStockForTrade: Stock | null = null;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  openGlobalTradeModal(stock?: Stock): void {
    this.selectedStockForTrade = stock || null;
    this.isTradeModalOpen = true;
  }
}
