import { OrderSide } from './order.model';

export interface Trade {
  id: number;
  orderId: number;
  symbol: string;
  stockName: string;
  side: OrderSide;
  quantity: number;
  price: number;
  totalAmount: number;
  realizedPnl: number;
  executedAt: string;
}
