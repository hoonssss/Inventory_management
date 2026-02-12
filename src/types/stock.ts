// 초기 데이터 (제품 마스터)
export interface Product {
  productCode: string;
  productName: string;
  stock: number;
  targetStock: number;
  memo?: string;
}

export type SalesChannel = '오프라인' | '업체' | '반품';

// 판매내역
export interface SalesRecord {
  orderTime: string;
  productId: string;
  orderQuantity: number;
  channel?: SalesChannel;
}

// 입고내역
export interface IncomingRecord {
  incomingDate: string;
  productCode: string;
  quantity: number;
}

// 대시보드용 계산된 재고 현황
export interface StockSummary {
  productCode: string;
  productName: string;
  initialStock: number;
  targetStock: number;
  totalIncoming: number;
  totalSales: number;
  currentStock: number;
  gap: number; // currentStock - targetStock
}

export interface ReorderItem extends StockSummary {
  reorderQty: number;
}
