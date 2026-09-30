export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LOSS';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  targetPrice?: number;
  stopPrice?: number;
}

export interface OrderResponse {
  id: number;
  symbol: string;
  stockName: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  filledQuantity: number;
  targetPrice?: number;
  stopPrice?: number;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: string;
  executedAt?: string;
}
