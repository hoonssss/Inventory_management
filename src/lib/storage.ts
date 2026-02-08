import { StockItem, TransactionLog } from '@/types/stock';

const STOCK_KEY = 'stockData';
const TRANSACTION_KEY = 'transactionLog';

export function getStockData(): StockItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STOCK_KEY);
  return data ? JSON.parse(data) : [];
}

export function setStockData(data: StockItem[]): void {
  localStorage.setItem(STOCK_KEY, JSON.stringify(data));
}

export function getTransactionLog(): TransactionLog[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(TRANSACTION_KEY);
  return data ? JSON.parse(data) : [];
}

export function addTransactionLog(log: TransactionLog): void {
  const logs = getTransactionLog();
  logs.push(log);
  localStorage.setItem(TRANSACTION_KEY, JSON.stringify(logs));
}

export function clearAllData(): void {
  localStorage.removeItem(STOCK_KEY);
  localStorage.removeItem(TRANSACTION_KEY);
}
