import { Component, inject, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, ActivatedRoute } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { MarketService } from "../../core/services/market.service";
import { NotificationService } from "../../core/services/notification.service";
import { Stock } from "../../core/models/stock.model";
import { TradeModalComponent } from "../../shared/components/trade-modal/trade-modal.component";

@Component({
  selector: "app-market",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TradeModalComponent],
  template: `
    <div class="market-page animate-fade-in">
      <!-- Header -->
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
      >
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h2 class="fw-extrabold text-heading mb-0">Live Market Feed</h2>
            <span class="badge bg-emerald-subtle font-mono text-xs"
              >NSE / BSE STOCKS</span
            >
          </div>
          <p class="text-secondary text-sm mb-0">
            Real-time quotes, technical metrics, and multi-sector equity
            screener.
          </p>
        </div>

        <!-- Sentiment Quick Bar -->
        <div class="d-flex align-items-center gap-3 glass-card px-3 py-2">
          <div class="d-flex align-items-center gap-2">
            <span class="text-xs text-muted fw-bold">ADVANCES:</span>
            <span class="font-mono text-emerald fw-bold">{{
              advancersCount
            }}</span>
          </div>
          <div class="vr bg-secondary opacity-25"></div>
          <div class="d-flex align-items-center gap-2">
            <span class="text-xs text-muted fw-bold">DECLINES:</span>
            <span class="font-mono text-rose fw-bold">{{
              declinersCount
            }}</span>
          </div>
          <div class="vr bg-secondary opacity-25"></div>
          <div class="d-flex align-items-center gap-1">
            <span class="text-xs text-muted fw-bold">RATIO:</span>
            <span class="font-mono text-cyan fw-bold">{{
              advancersCount / (declinersCount || 1) | number: "1.2-2"
            }}</span>
          </div>
        </div>
      </div>

      <!-- Filters & Controls Toolbar -->
      <div class="glass-card p-3 mb-4">
        <div class="row g-3 align-items-center">
          <!-- Search input -->
          <div class="col-lg-4 col-md-6">
            <div class="search-input-group">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                class="form-control form-control-glass font-mono"
                [(ngModel)]="searchQuery"
                (ngModelChange)="applyFilters()"
                placeholder="Search symbol, company, sector..."
              />
            </div>
          </div>

          <!-- Sector Selector -->
          <div class="col-lg-4 col-md-6">
            <select
              class="form-select form-control-glass"
              [(ngModel)]="selectedSector"
              (change)="applyFilters()"
            >
              <option value="All">All Sectors ({{ allStocks.length }})</option>
              <option value="FAVORITES">
                ⭐ Watchlist Favorites ({{ favoriteSymbols.size }})
              </option>
              <option *ngFor="let sector of sectors" [value]="sector">
                {{ sector }}
              </option>
            </select>
          </div>

          <!-- Sort & View Controls -->
          <div class="col-lg-4 col-md-12 d-flex justify-content-lg-end gap-2">
            <select
              class="form-select form-control-glass font-mono text-xs"
              style="max-width: 170px;"
              [(ngModel)]="sortBy"
              (change)="applySorting()"
            >
              <option value="symbol">Sort: Symbol</option>
              <option value="priceDesc">Price: High → Low</option>
              <option value="priceAsc">Price: Low → High</option>
              <option value="gainers">Top Gainers %</option>
              <option value="losers">Top Losers %</option>
              <option value="volume">Trading Volume</option>
            </select>

            <div class="btn-group">
              <button
                class="btn btn-glass btn-sm"
                [class.active]="viewMode === 'table'"
                (click)="viewMode = 'table'"
                title="Table View"
              >
                <i class="fa-solid fa-list"></i>
              </button>
              <button
                class="btn btn-glass btn-sm"
                [class.active]="viewMode === 'grid'"
                (click)="viewMode = 'grid'"
                title="Grid Cards View"
              >
                <i class="fa-solid fa-grip"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Sector & Watchlist Filter Badges -->
        <div class="d-flex gap-2 mt-3 overflow-x-auto pb-1">
          <button
            type="button"
            class="sector-pill"
            [class.active]="selectedSector === 'All'"
            (click)="selectedSector = 'All'; applyFilters()"
          >
            All
          </button>
          <button
            type="button"
            class="sector-pill"
            [class.active]="selectedSector === 'FAVORITES'"
            (click)="selectedSector = 'FAVORITES'; applyFilters()"
          >
            ⭐ Watchlist ({{ favoriteSymbols.size }})
          </button>
          <button
            type="button"
            class="sector-pill"
            *ngFor="let sec of sectors"
            [class.active]="selectedSector === sec"
            (click)="selectedSector = sec; applyFilters()"
          >
            {{ sec }}
          </button>
        </div>
      </div>

      <!-- Loading Skeleton State -->
      <div
        class="glass-card p-4 mb-4"
        *ngIf="isLoading && allStocks.length === 0"
      >
        <div class="skeleton-box mb-3" style="height: 40px; width: 100%;"></div>
        <div
          class="skeleton-box mb-2"
          style="height: 50px; width: 100%;"
          *ngFor="let i of [1, 2, 3, 4, 5]"
        ></div>
      </div>

      <!-- TABLE VIEW -->
      <div
        class="glass-card overflow-hidden"
        *ngIf="viewMode === 'table' && !isLoading"
      >
        <div class="table-responsive">
          <table class="table-glass">
            <thead>
              <tr>
                <th style="width: 40px;"></th>
                <th (click)="setSort('symbol')" class="cursor-pointer">
                  Asset / Name <i class="fa-solid fa-sort ms-1 text-muted"></i>
                </th>
                <th>Sector</th>
                <th
                  (click)="setSort('priceDesc')"
                  class="cursor-pointer text-end"
                >
                  Price (₹) <i class="fa-solid fa-sort ms-1 text-muted"></i>
                </th>
                <th
                  (click)="setSort('gainers')"
                  class="cursor-pointer text-end"
                >
                  24h Change <i class="fa-solid fa-sort ms-1 text-muted"></i>
                </th>
                <th class="text-end">Day Range</th>
                <th class="text-end">52W Range</th>
                <th class="text-end">P/E Ratio</th>
                <th class="text-end">Volume</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let stock of filteredStocks">
                <td class="text-center">
                  <button
                    class="favorite-star-btn"
                    (click)="toggleFavorite(stock.symbol, $event)"
                    [title]="
                      isFavorite(stock.symbol)
                        ? 'Remove from Watchlist'
                        : 'Add to Watchlist'
                    "
                  >
                    <i
                      class="fa-star"
                      [ngClass]="
                        isFavorite(stock.symbol)
                          ? 'fa-solid text-amber'
                          : 'fa-regular text-muted'
                      "
                    ></i>
                  </button>
                </td>
                <td>
                  <a
                    [routerLink]="['/market', stock.symbol]"
                    class="d-flex align-items-center gap-2 text-decoration-none"
                  >
                    <div class="stock-symbol-chip font-mono">
                      {{ stock.symbol }}
                    </div>
                    <div>
                      <div class="text-heading fw-semibold hover-indigo">
                        {{ stock.name }}
                      </div>
                      <div class="text-xs text-muted font-mono">
                        {{ stock.marketCap }}
                      </div>
                    </div>
                  </a>
                </td>
                <td>
                  <span class="badge bg-indigo-subtle text-xs">{{
                    stock.sector
                  }}</span>
                </td>
                <td class="text-end font-mono fs-6 fw-bold text-heading">
                  ₹{{ stock.currentPrice | number: "1.2-2" }}
                </td>
                <td class="text-end font-mono">
                  <span
                    class="badge-pill"
                    [ngClass]="
                      stock.changePercent >= 0 ? 'badge-buy' : 'badge-sell'
                    "
                  >
                    <i
                      class="fa-solid"
                      [ngClass]="
                        stock.changePercent >= 0
                          ? 'fa-caret-up'
                          : 'fa-caret-down'
                      "
                    ></i>
                    {{ stock.changePercent >= 0 ? "+" : ""
                    }}{{ stock.changePercent | number: "1.2-2" }}%
                  </span>
                  <div class="text-xs text-muted mt-1 font-mono">
                    {{ stock.changeAmount >= 0 ? "+" : "" }}₹{{
                      stock.changeAmount | number: "1.2-2"
                    }}
                  </div>
                </td>
                <td class="text-end font-mono text-xs">
                  <div class="text-secondary">
                    L: ₹{{ stock.dayLow | number: "1.2-2" }}
                  </div>
                  <div class="text-secondary">
                    H: ₹{{ stock.dayHigh | number: "1.2-2" }}
                  </div>
                </td>
                <td class="text-end font-mono text-xs">
                  <div class="text-muted">
                    ₹{{ stock.week52Low | number: "1.0-0" }} - ₹{{
                      stock.week52High | number: "1.0-0"
                    }}
                  </div>
                </td>
                <td class="text-end font-mono text-secondary">
                  {{ stock.peRatio }}
                </td>
                <td class="text-end font-mono text-secondary text-xs">
                  {{ stock.volume | number }}
                </td>
                <td class="text-center">
                  <div class="d-inline-flex gap-2">
                    <button
                      class="btn btn-emerald btn-sm py-1 px-3 text-xs"
                      (click)="openTradeModal(stock)"
                    >
                      <i class="fa-solid fa-bolt me-1"></i> Trade
                    </button>
                    <a
                      [routerLink]="['/market', stock.symbol]"
                      class="btn btn-glass btn-sm py-1 px-2 text-xs"
                      title="View Full Analysis"
                    >
                      <i class="fa-solid fa-chart-candlestick"></i>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State in Table -->
        <div class="empty-state-card py-5" *ngIf="filteredStocks.length === 0">
          <div class="empty-state-icon">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <div class="empty-state-title">No Matching Equities</div>
          <div class="empty-state-desc">
            No stocks found matching "{{ searchQuery || selectedSector }}". Try
            adjusting your filters or search keywords.
          </div>
          <button class="btn btn-glass btn-sm px-4" (click)="resetFilters()">
            Reset All Filters
          </button>
        </div>
      </div>

      <!-- GRID VIEW -->
      <div class="row g-3" *ngIf="viewMode === 'grid' && !isLoading">
        <div
          class="col-xl-3 col-lg-4 col-md-6"
          *ngFor="let stock of filteredStocks"
        >
          <div
            class="glass-card p-3 h-100 d-flex flex-column justify-content-between"
          >
            <div>
              <div
                class="d-flex justify-content-between align-items-start mb-2"
              >
                <div class="d-flex align-items-center gap-2">
                  <button
                    class="favorite-star-btn"
                    (click)="toggleFavorite(stock.symbol, $event)"
                  >
                    <i
                      class="fa-star"
                      [ngClass]="
                        isFavorite(stock.symbol)
                          ? 'fa-solid text-amber'
                          : 'fa-regular text-muted'
                      "
                    ></i>
                  </button>
                  <div>
                    <a
                      [routerLink]="['/market', stock.symbol]"
                      class="font-mono fs-5 fw-extrabold text-heading text-decoration-none hover-indigo"
                    >
                      {{ stock.symbol }}
                    </a>
                    <div
                      class="text-xs text-muted text-truncate"
                      style="max-width: 150px;"
                    >
                      {{ stock.name }}
                    </div>
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

              <div class="mb-3">
                <span class="badge bg-indigo-subtle text-xs">{{
                  stock.sector
                }}</span>
              </div>

              <div
                class="d-flex justify-content-between align-items-baseline mb-3"
              >
                <div class="font-mono fs-4 fw-bold text-heading">
                  ₹{{ stock.currentPrice | number: "1.2-2" }}
                </div>
                <div
                  class="text-xs font-mono"
                  [ngClass]="
                    stock.changeAmount >= 0 ? 'text-emerald' : 'text-rose'
                  "
                >
                  {{ stock.changeAmount >= 0 ? "+" : "" }}₹{{
                    stock.changeAmount | number: "1.2-2"
                  }}
                </div>
              </div>

              <div
                class="d-flex justify-content-between text-xs text-muted mb-3 font-mono"
              >
                <span
                  >P/E:
                  <strong class="text-heading">{{
                    stock.peRatio
                  }}</strong></span
                >
                <span
                  >Beta:
                  <strong class="text-heading">{{ stock.beta }}</strong></span
                >
                <span
                  >Div:
                  <strong class="text-heading"
                    >{{ stock.dividendYield }}%</strong
                  ></span
                >
              </div>
            </div>

            <div class="d-flex gap-2 pt-2 border-top border-glass">
              <button
                class="btn btn-emerald btn-sm flex-fill"
                (click)="openTradeModal(stock)"
              >
                Trade
              </button>
              <a
                [routerLink]="['/market', stock.symbol]"
                class="btn btn-glass btn-sm px-3"
              >
                Details
              </a>
            </div>
          </div>
        </div>

        <!-- Empty State in Grid -->
        <div class="col-12" *ngIf="filteredStocks.length === 0">
          <div class="glass-card empty-state-card py-5">
            <div class="empty-state-icon">
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            <div class="empty-state-title">No Matching Equities</div>
            <div class="empty-state-desc">
              No stocks found matching "{{ searchQuery || selectedSector }}".
              Try adjusting your filters.
            </div>
            <button class="btn btn-glass btn-sm px-4" (click)="resetFilters()">
              Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Trade Modal -->
    <app-trade-modal
      [isOpen]="isTradeModalOpen"
      [stock]="selectedStock"
      (closeEvent)="isTradeModalOpen = false"
    ></app-trade-modal>
  `,
  styles: [
    `
      .search-input-group {
        position: relative;
      }
      .search-input-group .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        font-size: 0.85rem;
      }
      .search-input-group input {
        padding-left: 36px !important;
      }
      .sector-pill {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--border-glass);
        color: var(--text-secondary);
        padding: 6px 14px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.15s;
      }
      [data-theme="light"] .sector-pill {
        background: #f1f5f9;
        border-color: rgba(0, 0, 0, 0.08);
        color: #475569;
      }
      .sector-pill:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-primary);
      }
      .sector-pill.active {
        background: rgba(99, 102, 241, 0.2);
        border-color: rgba(99, 102, 241, 0.5);
        color: #818cf8;
        font-weight: 700;
      }
      .stock-symbol-chip {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-glass);
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.82rem;
        color: #818cf8;
      }
      .favorite-star-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        font-size: 0.9rem;
        transition: transform 0.15s;
      }
      .favorite-star-btn:hover {
        transform: scale(1.2);
      }
      .cursor-pointer {
        cursor: pointer;
      }
      .hover-indigo:hover {
        color: #818cf8 !important;
      }
      .border-glass {
        border-color: var(--border-glass-subtle) !important;
      }
    `,
  ],
})
export class MarketComponent implements OnInit, OnDestroy {
  marketService = inject(MarketService);
  notifyService = inject(NotificationService);
  route = inject(ActivatedRoute);

  allStocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  sectors: string[] = [];
  favoriteSymbols = new Set<string>();

  searchQuery = "";
  selectedSector = "All";
  sortBy = "symbol";
  viewMode: "table" | "grid" = "table";
  isLoading = false;

  advancersCount = 0;
  declinersCount = 0;

  isTradeModalOpen = false;
  selectedStock: Stock | null = null;

  private sub?: Subscription;
  private readonly favKey = "portfoliopro_favorite_symbols";

  ngOnInit(): void {
    this.loadFavorites();

    this.route.queryParams.subscribe((params) => {
      if (params["q"]) {
        this.searchQuery = params["q"];
      }
    });

    this.sub = this.marketService.stocks$.subscribe((stocks) => {
      this.allStocks = stocks;
      this.extractSectors();
      this.calculateSentiment();
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadFavorites(): void {
    try {
      const saved = localStorage.getItem(this.favKey);
      if (saved) {
        this.favoriteSymbols = new Set(JSON.parse(saved));
      } else {
        this.favoriteSymbols = new Set(["RELIANCE", "INFY", "TCS"]);
      }
    } catch {
      this.favoriteSymbols = new Set(["RELIANCE", "INFY"]);
    }
  }

  isFavorite(symbol: string): boolean {
    return this.favoriteSymbols.has(symbol.toUpperCase());
  }

  toggleFavorite(symbol: string, event: Event): void {
    event.stopPropagation();
    const sym = symbol.toUpperCase();
    if (this.favoriteSymbols.has(sym)) {
      this.favoriteSymbols.delete(sym);
      this.notifyService.info("Watchlist", `Removed ${sym} from Watchlist.`);
    } else {
      this.favoriteSymbols.add(sym);
      this.notifyService.success("Watchlist", `Added ${sym} to Watchlist.`);
    }
    localStorage.setItem(
      this.favKey,
      JSON.stringify(Array.from(this.favoriteSymbols)),
    );
    if (this.selectedSector === "FAVORITES") {
      this.applyFilters();
    }
  }

  private extractSectors(): void {
    const set = new Set<string>();
    this.allStocks.forEach((s) => set.add(s.sector));
    this.sectors = Array.from(set);
  }

  private calculateSentiment(): void {
    this.advancersCount = this.allStocks.filter(
      (s) => s.changePercent >= 0,
    ).length;
    this.declinersCount = this.allStocks.filter(
      (s) => s.changePercent < 0,
    ).length;
  }

  applyFilters(): void {
    let list = [...this.allStocks];

    if (this.selectedSector === "FAVORITES") {
      list = list.filter((s) =>
        this.favoriteSymbols.has(s.symbol.toUpperCase()),
      );
    } else if (this.selectedSector !== "All") {
      list = list.filter((s) => s.sector === this.selectedSector);
    }

    if (this.searchQuery && this.searchQuery.trim() !== "") {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q),
      );
    }

    this.filteredStocks = list;
    this.applySorting();
  }

  resetFilters(): void {
    this.searchQuery = "";
    this.selectedSector = "All";
    this.sortBy = "symbol";
    this.applyFilters();
  }

  setSort(sort: string): void {
    this.sortBy = sort;
    this.applySorting();
  }

  applySorting(): void {
    if (this.sortBy === "symbol") {
      this.filteredStocks.sort((a, b) => a.symbol.localeCompare(b.symbol));
    } else if (this.sortBy === "priceDesc") {
      this.filteredStocks.sort((a, b) => b.currentPrice - a.currentPrice);
    } else if (this.sortBy === "priceAsc") {
      this.filteredStocks.sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (this.sortBy === "gainers") {
      this.filteredStocks.sort((a, b) => b.changePercent - a.changePercent);
    } else if (this.sortBy === "losers") {
      this.filteredStocks.sort((a, b) => a.changePercent - b.changePercent);
    } else if (this.sortBy === "volume") {
      this.filteredStocks.sort((a, b) => b.volume - a.volume);
    }
  }

  openTradeModal(stock: Stock): void {
    this.selectedStock = stock;
    this.isTradeModalOpen = true;
  }
}
