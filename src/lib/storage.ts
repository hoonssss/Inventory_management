import { Product, SalesRecord, IncomingRecord, StockSummary } from '@/types/stock';

const PRODUCTS_KEY = 'products';
const SALES_KEY = 'salesRecords';
const INCOMING_KEY = 'incomingRecords';

// --- 초기 데이터 (제품 마스터) ---
export function getProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function setProducts(data: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
}

// --- 판매내역 ---
export function getSalesRecords(): SalesRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(SALES_KEY);
  return data ? JSON.parse(data) : [];
}

export function setSalesRecords(data: SalesRecord[]): void {
  localStorage.setItem(SALES_KEY, JSON.stringify(data));
}

export function addSalesRecords(records: SalesRecord[]): void {
  const current = getSalesRecords();
  setSalesRecords([...current, ...records]);
}

// --- 입고내역 ---
export function getIncomingRecords(): IncomingRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(INCOMING_KEY);
  return data ? JSON.parse(data) : [];
}

export function setIncomingRecords(data: IncomingRecord[]): void {
  localStorage.setItem(INCOMING_KEY, JSON.stringify(data));
}

export function addIncomingRecords(records: IncomingRecord[]): void {
  const current = getIncomingRecords();
  const products = getProducts();
  const existingCodes = new Set(products.map((product) => product.productCode));

  const newProducts = records
    .map((record) => record.productCode)
    .filter((productCode) => productCode && !existingCodes.has(productCode))
    .map((productCode) => ({ productCode, stock: 0, targetStock: 0 }));

  if (newProducts.length > 0) {
    setProducts([...products, ...newProducts]);
  }
  setIncomingRecords([...current, ...records]);
}

// --- 대시보드용 재고 현황 계산 ---
export function calculateStockSummary(): StockSummary[] {
  const products = getProducts();
  const sales = getSalesRecords();
  const incoming = getIncomingRecords();

  return products.map((product) => {
    const totalSales = sales
      .filter((s) => s.productId === product.productCode)
      .reduce((sum, s) => sum + s.orderQuantity, 0);

    const totalIncoming = incoming
      .filter((i) => i.productCode === product.productCode)
      .reduce((sum, i) => sum + i.quantity, 0);

    const currentStock = product.stock + totalIncoming - totalSales;

    return {
      productCode: product.productCode,
      initialStock: product.stock,
      targetStock: product.targetStock,
      totalIncoming,
      totalSales,
      currentStock,
      gap: currentStock - product.targetStock,
    };
  });
}

// --- 전체 초기화 ---
export function clearAllData(): void {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(SALES_KEY);
  localStorage.removeItem(INCOMING_KEY);
}
