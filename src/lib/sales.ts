import { SalesChannel, SalesRecord } from '@/types/stock';

const DEFAULT_SALES_CHANNEL: SalesChannel = '오프라인';

export function normalizeSalesChannel(channel: unknown): SalesChannel {
  const value = String(channel ?? '').trim();
  if (value === '오프라인' || value === '업체' || value === '반품') {
    return value;
  }
  return DEFAULT_SALES_CHANNEL;
}

export function getOrderQuantity(record: SalesRecord): number {
  return Math.abs(record.orderQuantity);
}

export function getStockDeltaFromSale(record: SalesRecord): number {
  const qty = getOrderQuantity(record);
  return normalizeSalesChannel(record.channel) === '반품' ? qty : -qty;
}
