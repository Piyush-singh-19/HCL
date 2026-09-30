import { Routes } from "@angular/router";
import { MainLayoutComponent } from "./layout/main-layout/main-layout.component";
import { DashboardComponent } from "./features/dashboard/dashboard.component";
import { MarketComponent } from "./features/market/market.component";
import { StockDetailComponent } from "./features/stock-detail/stock-detail.component";
import { TradeComponent } from "./features/trade/trade.component";
import { OrdersComponent } from "./features/orders/orders.component";
import { TradesComponent } from "./features/trades/trades.component";
import { PortfolioComponent } from "./features/portfolio/portfolio.component";
import { RiskComponent } from "./features/risk/risk.component";
import { AnalysisComponent } from "./features/analysis/analysis.component";
import { ProfileComponent } from "./features/profile/profile.component";
import { AdminComponent } from "./features/admin/admin.component";
import { LoginComponent } from "./features/auth/login.component";
import { RegisterComponent } from "./features/auth/register.component";
import { authGuard, adminGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent, title: "PortfolioPro | Sign In" },
  {
    path: "register",
    component: RegisterComponent,
    title: "PortfolioPro | Create Account",
  },
  {
    path: "",
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        component: DashboardComponent,
        title: "PortfolioPro | Dashboard",
      },
      {
        path: "market",
        component: MarketComponent,
        title: "PortfolioPro | Live Market",
      },
      {
        path: "market/:symbol",
        component: StockDetailComponent,
        title: "PortfolioPro | Stock Detail",
      },
      {
        path: "trade",
        component: TradeComponent,
        title: "PortfolioPro | Buy & Sell Workstation",
      },
      {
        path: "trade/:symbol",
        component: TradeComponent,
        title: "PortfolioPro | Buy & Sell Workstation",
      },
      {
        path: "orders",
        component: OrdersComponent,
        title: "PortfolioPro | Orders Book",
      },
      {
        path: "trades",
        component: TradesComponent,
        title: "PortfolioPro | Trade Ledger",
      },
      {
        path: "portfolio",
        component: PortfolioComponent,
        title: "PortfolioPro | Portfolio & Holdings",
      },
      {
        path: "risk",
        component: RiskComponent,
        title: "PortfolioPro | Risk Analysis Radar",
      },
      {
        path: "analysis",
        component: AnalysisComponent,
        title: "PortfolioPro | Technical Analysis",
      },
      {
        path: "analysis/:symbol",
        component: AnalysisComponent,
        title: "PortfolioPro | Technical Analysis",
      },
      {
        path: "profile",
        component: ProfileComponent,
        title: "PortfolioPro | Trader Profile",
      },
      {
        path: "admin",
        component: AdminComponent,
        canActivate: [adminGuard],
        title: "PortfolioPro | Admin Portal",
      },
    ],
  },
  { path: "**", redirectTo: "dashboard" },
];
