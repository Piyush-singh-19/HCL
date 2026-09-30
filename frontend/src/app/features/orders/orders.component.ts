import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TradingService } from '../../core/services/trading.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrderResponse, OrderStatus, OrderSide } from '../../core/models/order.model';
import { TradeModalComponent } from '../../shared/components/trade-modal/trade-modal.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TradeModalComponent],
  template: `
    <div class="orders-page animate-fade-in">
      <!-- Top Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="fw-extrabold text-white mb-0">Order Management</h2>
            <span class="badge bg-indigo-subtle font-mono text-xs">ORDER BOOK</span>
          </div>
          <p class="text-secondary text-sm mb-0">Track real-time status of pending triggers, limit orders, and execution confirmations.</p>
        </div>

        <button class="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-2" (click)="isTradeModalOpen = true">
          <i class="fa-solid fa-plus"></i>
          <span>Create New Order</span>
        </button>
      </div>

      <!-- Filter Controls Toolbar -->
      <div class="glass-card p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-lg-4 col-md-6">
            <div class="search-box">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input 
                type="text" 
                class="form-control form-control-glass font-mono" 
                [(ngModel)]="searchQuery" 
                (ngModelChange)="applyFilters()"
                placeholder="Filter by symbol, order ID..." 
              />
            </div>
          </div>

          <div class="col-lg-4 col-md-6">
            <div class="d-flex gap-2">
              <select class="form-select form-control-glass font-mono text-xs" [(ngModel)]="sideFilter" (change)="applyFilters()">
                <option value="ALL">All Sides (BUY & SELL)</option>
                <option value="BUY">BUY Orders Only</option>
                <option value="SELL">SELL Orders Only</option>
              </select>
            </div>
          </div>

          <!-- Status Filter Tabs -->
          <div class="col-lg-4 col-md-12 d-flex justify-content-lg-end gap-1">
            <button 
              *ngFor="let s of statusTabs" 
              class="btn btn-glass btn-sm text-xs" 
              [class.active]="selectedStatus === s.value"
              (click)="selectedStatus = s.value; applyFilters()"
            >
              {{ s.label }} ({{ getCountForStatus(s.value) }})
            </button>
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="glass-card overflow-hidden">
        <div class="table-responsive">
          <table class="table-glass">
            <thead>
              <tr>
                <th>Order ID & Date</th>
                <th>Asset</th>
                <th>Side</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Trigger / Limit Price</th>
                <th>Status</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td>
                  <div class="font-mono text-white fw-bold">#{{ order.id }}</div>
                  <div class="text-xs text-muted font-mono">{{ order.createdAt | date:'short' }}</div>
                </td>
                <td>
                  <a [routerLink]="['/market', order.symbol]" class="text-white fw-bold text-decoration-none hover-indigo">
                    {{ order.symbol }}
                  </a>
                  <div class="text-xs text-muted text-truncate" style="max-width: 140px;">{{ order.stockName }}</div>
                </td>
                <td>
                  <span class="badge-pill" [ngClass]="order.side === 'BUY' ? 'badge-buy' : 'badge-sell'">
                    {{ order.side }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-indigo-subtle text-xs font-mono">{{ order.type }}</span>
                </td>
                <td>
                  <div class="font-mono text-white fw-semibold">{{ order.filledQuantity }} / {{ order.quantity }}</div>
                  <div class="progress mt-1" style="height: 4px; width: 60px; background: rgba(255,255,255,0.1);">
                    <div 
                      class="progress-bar" 
                      [ngClass]="order.status === 'EXECUTED' ? 'bg-emerald' : 'bg-amber'" 
                      [style.width.%]="(order.filledQuantity / order.quantity) * 100"
                    ></div>
                  </div>
                </td>
                <td class="font-mono">
                  <ng-container *ngIf="order.targetPrice">
                    <span class="text-muted text-xs">Limit: </span>
                    <span class="text-white fw-semibold">₹{{ order.targetPrice | number:'1.2-2' }}</span>
                  </ng-container>
                  <ng-container *ngIf="order.stopPrice">
                    <span class="text-muted text-xs">Stop: </span>
                    <span class="text-white fw-semibold">₹{{ order.stopPrice | number:'1.2-2' }}</span>
                  </ng-container>
                  <ng-container *ngIf="!order.targetPrice && !order.stopPrice">
                    <span class="text-muted text-xs">Market Price</span>
                  </ng-container>
                </td>
                <td>
                  <span class="badge-pill" [ngClass]="getStatusBadgeClass(order.status)">
                    <i class="fa-solid" [ngClass]="getStatusIcon(order.status)"></i>
                    {{ order.status }}
                  </span>
                </td>
                <td class="text-center">
                  <button 
                    *ngIf="order.status === 'PENDING'" 
                    class="btn btn-outline-danger btn-sm py-1 px-2 text-xs" 
                    (click)="cancelOrder(order.id)"
                  >
                    <i class="fa-solid fa-ban me-1"></i> Cancel
                  </button>
                  <span *ngIf="order.status !== 'PENDING'" class="text-muted text-xs font-mono">
                    {{ order.executedAt ? (order.executedAt | date:'shortTime') : '-' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredOrders.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fa-solid fa-receipt fs-3 mb-2 d-block"></i>
                  No orders found for the selected criteria.
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
      (closeEvent)="isTradeModalOpen = false"
      (orderPlaced)="loadOrders()"
    ></app-trade-modal>
  `,
  styles: [`
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
    .bg-emerald {
      background-color: #10b981 !important;
    }
    .bg-amber {
      background-color: #f59e0b !important;
    }
  `]
})
export class OrdersComponent implements OnInit {
  tradingService = inject(TradingService);
  notifyService = inject(NotificationService);

  allOrders: OrderResponse[] = [];
  filteredOrders: OrderResponse[] = [];

  searchQuery = '';
  sideFilter = 'ALL';
  selectedStatus = 'ALL';

  isTradeModalOpen = false;

  statusTabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Executed', value: 'EXECUTED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.tradingService.getUserOrders().subscribe(orders => {
      this.allOrders = orders;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let list = [...this.allOrders];

    if (this.selectedStatus !== 'ALL') {
      list = list.filter(o => o.status === this.selectedStatus);
    }

    if (this.sideFilter !== 'ALL') {
      list = list.filter(o => o.side === this.sideFilter);
    }

    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(o => 
        o.symbol.toLowerCase().includes(q) ||
        o.stockName.toLowerCase().includes(q) ||
        o.id.toString().includes(q)
      );
    }

    this.filteredOrders = list;
  }

  getCountForStatus(status: string): number {
    if (status === 'ALL') return this.allOrders.length;
    return this.allOrders.filter(o => o.status === status).length;
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'EXECUTED': return 'badge-executed';
      case 'PENDING': return 'badge-pending';
      case 'CANCELLED': return 'badge-cancelled';
      default: return 'badge-cancelled';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case 'EXECUTED': return 'fa-check';
      case 'PENDING': return 'fa-clock';
      case 'CANCELLED': return 'fa-ban';
      default: return 'fa-circle-question';
    }
  }

  cancelOrder(id: number): void {
    this.tradingService.cancelOrder(id).subscribe(res => {
      if (res) {
        this.notifyService.success('Order Cancelled', `Order #${id} has been cancelled.`);
        this.loadOrders();
      }
    });
  }
}
