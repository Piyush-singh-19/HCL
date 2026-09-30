import { Component, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AdminService } from "../../core/services/admin.service";
import { MarketService } from "../../core/services/market.service";
import { NotificationService } from "../../core/services/notification.service";
import { AdminStats, User } from "../../core/models/user.model";
import { Stock } from "../../core/models/stock.model";
import { OrderResponse } from "../../core/models/order.model";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-page animate-fade-in">
      <!-- Top Header -->
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
      >
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="fw-extrabold text-white mb-0">
              System Administration Portal
            </h2>
            <span class="badge bg-amber-subtle font-mono text-xs"
              >ROOT CONTROL</span
            >
          </div>
          <p class="text-secondary text-sm mb-0">
            Manage platform users, adjust virtual balances, list equities, and
            audit trading flow.
          </p>
        </div>

        <div class="d-flex gap-2">
          <button
            class="btn btn-emerald btn-sm px-3 d-flex align-items-center gap-2"
            (click)="openCreateStockModal()"
          >
            <i class="fa-solid fa-plus"></i>
            <span>List New Equity</span>
          </button>
        </div>
      </div>

      <!-- System KPI Stats Cards -->
      <div class="row g-3 mb-4" *ngIf="stats">
        <div class="col-lg-2 col-md-4 col-sm-6">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold">TOTAL USERS</span>
            <div class="font-mono fs-4 fw-extrabold text-white mt-1">
              {{ stats.totalUsers }}
            </div>
            <span class="text-xs text-emerald font-mono"
              >Active: {{ stats.activeUsers }}</span
            >
          </div>
        </div>

        <div class="col-lg-2 col-md-4 col-sm-6">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold">TOTAL ORDERS</span>
            <div class="font-mono fs-4 fw-extrabold text-cyan mt-1">
              {{ stats.totalOrders | number }}
            </div>
            <span class="text-xs text-secondary font-mono">Submitted</span>
          </div>
        </div>

        <div class="col-lg-2 col-md-4 col-sm-6">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold">EXECUTED TRADES</span>
            <div class="font-mono fs-4 fw-extrabold text-emerald mt-1">
              {{ stats.executedTrades | number }}
            </div>
            <span class="text-xs text-secondary font-mono">Filled</span>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 col-sm-6">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold"
              >SYSTEM VOLUME TURNOVER</span
            >
            <div class="font-mono fs-4 fw-extrabold text-amber mt-1">
              ₹{{ stats.totalTradingVolume / 10000000 | number: "1.2-2" }} Cr
            </div>
            <span class="text-xs text-secondary font-mono"
              >Gross paper turnover</span
            >
          </div>
        </div>

        <div class="col-lg-3 col-md-6 col-sm-12">
          <div class="glass-card p-3">
            <span class="text-xs text-muted fw-bold">LISTED INSTRUMENTS</span>
            <div class="font-mono fs-4 fw-extrabold text-indigo mt-1">
              {{ stats.totalStocksListed }} Stocks
            </div>
            <span class="text-xs text-secondary font-mono"
              >NSE & BSE equities</span
            >
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="d-flex gap-2 mb-4 border-bottom border-glass pb-2">
        <button
          class="btn btn-glass btn-sm px-4"
          [class.active]="activeTab === 'users'"
          (click)="activeTab = 'users'"
        >
          <i class="fa-solid fa-users me-2"></i> User Directory & Balances
        </button>
        <button
          class="btn btn-glass btn-sm px-4"
          [class.active]="activeTab === 'stocks'"
          (click)="activeTab = 'stocks'"
        >
          <i class="fa-solid fa-cubes-stacked me-2"></i> Equity Master & Listed
          Stocks
        </button>
        <button
          class="btn btn-glass btn-sm px-4"
          [class.active]="activeTab === 'orders'"
          (click)="activeTab = 'orders'"
        >
          <i class="fa-solid fa-shield-halved me-2"></i> System Orders
          Surveillance
        </button>
      </div>

      <!-- TAB 1: USERS MANAGEMENT -->
      <div class="glass-card overflow-hidden" *ngIf="activeTab === 'users'">
        <div
          class="p-3 border-bottom border-glass d-flex justify-content-between align-items-center"
        >
          <h6 class="fw-bold text-white mb-0">
            Registered Traders & Administrator Accounts
          </h6>
        </div>

        <div class="table-responsive">
          <table class="table-glass">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Trader Info</th>
                <th>Assigned Role</th>
                <th class="text-end">Virtual Cash Balance</th>
                <th class="text-end">Realized P&L</th>
                <th>Status</th>
                <th class="text-center">Manage Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="font-mono text-muted">#UID-{{ u.id }}</td>
                <td>
                  <div class="text-white fw-bold">{{ u.fullName }}</div>
                  <div class="text-xs text-muted font-mono">
                    {{ u.email }} (&#64;{{ u.username }})
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="
                      u.role === 'ROLE_ADMIN'
                        ? 'bg-amber-subtle'
                        : 'bg-indigo-subtle'
                    "
                  >
                    {{ u.role === "ROLE_ADMIN" ? "ADMIN" : "TRADER" }}
                  </span>
                </td>
                <td class="text-end font-mono text-emerald fw-bold">
                  ₹{{ u.virtualBalance | number: "1.2-2" }}
                </td>
                <td
                  class="text-end font-mono fw-bold"
                  [ngClass]="u.realizedPnl >= 0 ? 'text-emerald' : 'text-rose'"
                >
                  ₹{{ u.realizedPnl | number: "1.2-2" }}
                </td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="
                      u.isActive ? 'bg-emerald-subtle' : 'bg-rose-subtle'
                    "
                  >
                    {{ u.isActive ? "ACTIVE" : "SUSPENDED" }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="d-inline-flex gap-2">
                    <button
                      class="btn btn-glass btn-sm py-1 px-2 text-xs"
                      (click)="openEditUserModal(u)"
                    >
                      <i class="fa-solid fa-pen-to-square me-1"></i> Edit
                      Balance
                    </button>
                    <button
                      class="btn btn-sm py-1 px-2 text-xs"
                      [ngClass]="
                        u.isActive
                          ? 'btn-outline-danger'
                          : 'btn-outline-success'
                      "
                      (click)="toggleUserActive(u)"
                    >
                      {{ u.isActive ? "Suspend" : "Activate" }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 2: STOCK MANAGEMENT -->
      <div class="glass-card overflow-hidden" *ngIf="activeTab === 'stocks'">
        <div
          class="p-3 border-bottom border-glass d-flex justify-content-between align-items-center"
        >
          <h6 class="fw-bold text-white mb-0">Listed Equities Master Table</h6>
          <button
            class="btn btn-emerald btn-sm px-3"
            (click)="openCreateStockModal()"
          >
            + New Stock
          </button>
        </div>

        <div class="table-responsive">
          <table class="table-glass">
            <thead>
              <tr>
                <th>Symbol & Company</th>
                <th>Sector</th>
                <th class="text-end">Current Price</th>
                <th class="text-end">Day Open</th>
                <th class="text-end">Day High / Low</th>
                <th class="text-end">P/E Ratio</th>
                <th class="text-end">Beta</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of stocks">
                <td>
                  <div class="font-mono text-white fw-bold">{{ s.symbol }}</div>
                  <div class="text-xs text-muted">{{ s.name }}</div>
                </td>
                <td>
                  <span class="badge bg-indigo-subtle text-xs">{{
                    s.sector
                  }}</span>
                </td>
                <td class="text-end font-mono text-white fw-bold">
                  ₹{{ s.currentPrice | number: "1.2-2" }}
                </td>
                <td class="text-end font-mono text-muted">
                  ₹{{ s.dayOpen | number: "1.2-2" }}
                </td>
                <td class="text-end font-mono text-xs">
                  <span class="text-emerald"
                    >₹{{ s.dayHigh | number: "1.2-2" }}</span
                  >
                  /
                  <span class="text-rose"
                    >₹{{ s.dayLow | number: "1.2-2" }}</span
                  >
                </td>
                <td class="text-end font-mono">{{ s.peRatio }}</td>
                <td class="text-end font-mono">{{ s.beta }}</td>
                <td class="text-center">
                  <button
                    class="btn btn-glass btn-sm py-1 px-2 text-xs"
                    (click)="openEditStockModal(s)"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: SYSTEM ORDERS SURVEILLANCE -->
      <div class="glass-card overflow-hidden" *ngIf="activeTab === 'orders'">
        <div class="p-3 border-bottom border-glass">
          <h6 class="fw-bold text-white mb-0">Live System Order Flow</h6>
        </div>

        <div class="table-responsive">
          <table class="table-glass">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Asset</th>
                <th>Side</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ord of systemOrders">
                <td class="font-mono text-white">#{{ ord.id }}</td>
                <td class="font-mono text-xs text-muted">
                  {{ ord.createdAt | date: "short" }}
                </td>
                <td class="font-mono text-white fw-bold">{{ ord.symbol }}</td>
                <td>
                  <span
                    class="badge-pill"
                    [ngClass]="ord.side === 'BUY' ? 'badge-buy' : 'badge-sell'"
                  >
                    {{ ord.side }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-indigo-subtle text-xs">{{
                    ord.type
                  }}</span>
                </td>
                <td class="font-mono text-white">{{ ord.quantity }}</td>
                <td>
                  <span
                    class="badge-pill"
                    [ngClass]="
                      ord.status === 'EXECUTED'
                        ? 'badge-executed'
                        : 'badge-pending'
                    "
                  >
                    {{ ord.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div
      class="modal-backdrop"
      *ngIf="isEditUserModalOpen"
      (click)="isEditUserModalOpen = false"
    >
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h5 class="fw-bold text-white mb-0">Edit Trader Virtual Account</h5>
          <button
            class="btn-close-custom"
            (click)="isEditUserModalOpen = false"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body p-4" *ngIf="selectedUser">
          <div class="mb-3">
            <label class="text-xs text-muted fw-bold">TRADER NAME</label>
            <input
              type="text"
              class="form-control form-control-glass"
              [value]="selectedUser.fullName"
              disabled
            />
          </div>
          <div class="mb-3">
            <label class="text-xs text-muted fw-bold"
              >VIRTUAL CASH BALANCE (₹)</label
            >
            <input
              type="number"
              class="form-control form-control-glass font-mono"
              [(ngModel)]="editUserBalance"
            />
          </div>
          <div class="mb-3">
            <label class="text-xs text-muted fw-bold">ROLE</label>
            <select
              class="form-select form-control-glass font-mono"
              [(ngModel)]="editUserRole"
            >
              <option value="ROLE_USER">ROLE_USER (Trader)</option>
              <option value="ROLE_ADMIN">
                ROLE_ADMIN (Super Administrator)
              </option>
            </select>
          </div>
        </div>
        <div
          class="modal-footer p-3 border-top border-glass d-flex justify-content-end gap-2"
        >
          <button
            class="btn btn-glass btn-sm px-3"
            (click)="isEditUserModalOpen = false"
          >
            Cancel
          </button>
          <button
            class="btn btn-emerald btn-sm px-4"
            (click)="saveUserUpdate()"
          >
            Update User
          </button>
        </div>
      </div>
    </div>

    <!-- Create Stock Modal -->
    <div
      class="modal-backdrop"
      *ngIf="isCreateStockModalOpen"
      (click)="isCreateStockModalOpen = false"
    >
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h5 class="fw-bold text-white mb-0">List New Equity Asset</h5>
          <button
            class="btn-close-custom"
            (click)="isCreateStockModalOpen = false"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-body p-4">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="text-xs text-muted fw-bold">SYMBOL</label>
              <input
                type="text"
                class="form-control form-control-glass font-mono uppercase"
                [(ngModel)]="newStock.symbol"
                placeholder="e.g. ZOMATO"
              />
            </div>
            <div class="col-md-6">
              <label class="text-xs text-muted fw-bold">COMPANY NAME</label>
              <input
                type="text"
                class="form-control form-control-glass"
                [(ngModel)]="newStock.name"
                placeholder="e.g. Zomato Limited"
              />
            </div>
            <div class="col-md-6">
              <label class="text-xs text-muted fw-bold">SECTOR</label>
              <input
                type="text"
                class="form-control form-control-glass"
                [(ngModel)]="newStock.sector"
                placeholder="e.g. Tech & Internet"
              />
            </div>
            <div class="col-md-6">
              <label class="text-xs text-muted fw-bold"
                >INITIAL PRICE (₹)</label
              >
              <input
                type="number"
                class="form-control form-control-glass font-mono"
                [(ngModel)]="newStock.currentPrice"
                placeholder="240.00"
              />
            </div>
            <div class="col-md-6">
              <label class="text-xs text-muted fw-bold">P/E RATIO</label>
              <input
                type="number"
                class="form-control form-control-glass font-mono"
                [(ngModel)]="newStock.peRatio"
                placeholder="45.0"
              />
            </div>
            <div class="col-md-6">
              <label class="text-xs text-muted fw-bold">BETA</label>
              <input
                type="number"
                class="form-control form-control-glass font-mono"
                [(ngModel)]="newStock.beta"
                placeholder="1.20"
              />
            </div>
          </div>
        </div>
        <div
          class="modal-footer p-3 border-top border-glass d-flex justify-content-end gap-2"
        >
          <button
            class="btn btn-glass btn-sm px-3"
            (click)="isCreateStockModalOpen = false"
          >
            Cancel
          </button>
          <button
            class="btn btn-emerald btn-sm px-4"
            (click)="saveCreateStock()"
          >
            List Stock
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
      }
      .modal-card {
        width: 100%;
        max-width: 500px;
        background: #111827;
        border: 1px solid var(--border-glass-hover);
        border-radius: 18px;
        overflow: hidden;
      }
      .modal-header {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border-glass);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .btn-close-custom {
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
      }
      .btn-close-custom:hover {
        color: #fff;
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  adminService = inject(AdminService);
  marketService = inject(MarketService);
  notifyService = inject(NotificationService);

  stats: AdminStats | null = null;
  users: User[] = [];
  stocks: Stock[] = [];
  systemOrders: OrderResponse[] = [];

  activeTab: "users" | "stocks" | "orders" = "users";

  // Edit User modal state
  isEditUserModalOpen = false;
  selectedUser: User | null = null;
  editUserBalance: number = 0;
  editUserRole: string = "ROLE_USER";

  // Create Stock modal state
  isCreateStockModalOpen = false;
  newStock: Partial<Stock> = {
    symbol: "",
    name: "",
    sector: "Information Technology",
    currentPrice: 1000,
    peRatio: 25.0,
    beta: 1.0,
    marketCap: "₹1.50 Lakh Cr",
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.adminService.getAdminStats().subscribe((s) => (this.stats = s));
    this.adminService.getAllUsers().subscribe((u) => (this.users = u));
    this.marketService.getStocks().subscribe((st) => (this.stocks = st));
    this.adminService.getAllOrders().subscribe((o) => (this.systemOrders = o));
  }

  openEditUserModal(user: User): void {
    this.selectedUser = user;
    this.editUserBalance = user.virtualBalance;
    this.editUserRole = user.role;
    this.isEditUserModalOpen = true;
  }

  saveUserUpdate(): void {
    if (!this.selectedUser) return;
    this.adminService
      .updateUser(this.selectedUser.id, {
        virtualBalance: this.editUserBalance,
        role: this.editUserRole,
      })
      .subscribe((updated) => {
        this.isEditUserModalOpen = false;
        this.notifyService.success(
          "User Updated",
          `Updated balance & role for ${this.selectedUser?.fullName}.`,
        );
        this.loadData();
      });
  }

  toggleUserActive(user: User): void {
    this.adminService
      .updateUser(user.id, {
        isActive: !user.isActive,
      })
      .subscribe(() => {
        this.notifyService.info(
          "User Status Changed",
          `Toggled active state for ${user.fullName}`,
        );
        this.loadData();
      });
  }

  openCreateStockModal(): void {
    this.newStock = {
      symbol: "",
      name: "",
      sector: "General",
      currentPrice: 500,
      peRatio: 22.5,
      beta: 1.05,
      marketCap: "₹50,000 Cr",
    };
    this.isCreateStockModalOpen = true;
  }

  saveCreateStock(): void {
    if (!this.newStock.symbol || !this.newStock.name) {
      this.notifyService.error(
        "Validation Error",
        "Symbol and Name are required.",
      );
      return;
    }

    this.adminService.createStock(this.newStock).subscribe((created) => {
      this.marketService.refreshLocalStocks();
      this.isCreateStockModalOpen = false;
      this.notifyService.success(
        "Stock Listed",
        `Successfully listed ${created.symbol} on PortfolioPro.`,
      );
      this.loadData();
    });
  }

  openEditStockModal(stock: Stock): void {
    const newPrice = prompt(
      `Enter new price for ${stock.symbol}:`,
      stock.currentPrice.toString(),
    );
    if (newPrice && !isNaN(Number(newPrice))) {
      this.adminService
        .updateStock(stock.id, { currentPrice: Number(newPrice) })
        .subscribe(() => {
          this.marketService.refreshLocalStocks();
          this.notifyService.success(
            "Price Updated",
            `Updated price for ${stock.symbol} to ₹${newPrice}`,
          );
          this.loadData();
        });
    }
  }
}
