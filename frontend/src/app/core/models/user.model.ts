export type RoleType = 'ROLE_USER' | 'ROLE_ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  virtualBalance: number;
  realizedPnl: number;
  role: RoleType;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: RoleType;
  virtualBalance: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  executedTrades: number;
  totalTradingVolume: number;
  totalStocksListed: number;
  totalActiveStocks?: number;
  totalTrades?: number;
  totalVolumeTraded?: number;
  totalSystemLiquidity?: number;
  totalUserCash?: number;
}
