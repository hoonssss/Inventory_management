export interface StockItem {
  productId: string;
  productName: string;
  category: string;
  stock: number;
  updatedAt: string;
}

export interface StockTransaction {
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  type: 'IN' | 'OUT';
  date?: string;
}

export interface TransactionLog {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  type: 'IN' | 'OUT';
  date: string;
}
