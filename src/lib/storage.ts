import { Product, SalesRecord, IncomingRecord, StockSummary } from '@/types/stock';
import { getOrderQuantity, getStockDeltaFromSale, normalizeSalesChannel } from '@/lib/sales';

const DB_NAME = 'inventory-db';
const DB_VERSION = 1;
const PRODUCTS_STORE = 'products';
const SALES_STORE = 'salesRecords';
const INCOMING_STORE = 'incomingRecords';

let dbPromise: Promise<IDBDatabase> | null = null;

const isBrowser = () => typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

const requestToPromise = <T,>(request: IDBRequest<T>): Promise<T> => (
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  })
);

const transactionComplete = (tx: IDBTransaction): Promise<void> => (
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  })
);

const openDb = (): Promise<IDBDatabase> => {
  if (!isBrowser()) {
    return Promise.reject(new Error('indexedDB not available'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
          db.createObjectStore(PRODUCTS_STORE, { keyPath: 'productCode' });
        }
        if (!db.objectStoreNames.contains(SALES_STORE)) {
          db.createObjectStore(SALES_STORE, { autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(INCOMING_STORE)) {
          db.createObjectStore(INCOMING_STORE, { autoIncrement: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
};

const getAllFromStore = async <T,>(storeName: string): Promise<T[]> => {
  if (!isBrowser()) return [];
  const db = await openDb();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const result = await requestToPromise(store.getAll());
  await transactionComplete(tx);
  return result as T[];
};

const clearAndAddAll = async <T,>(storeName: string, items: T[]): Promise<void> => {
  if (!isBrowser()) return;
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.clear();
  items.forEach((item) => {
    store.add(item);
  });
  await transactionComplete(tx);
};

const addAll = async <T,>(storeName: string, items: T[]): Promise<void> => {
  if (!isBrowser()) return;
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  items.forEach((item) => {
    store.add(item);
  });
  await transactionComplete(tx);
};

const putAll = async <T,>(storeName: string, items: T[]): Promise<void> => {
  if (!isBrowser()) return;
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.clear();
  items.forEach((item) => {
    store.put(item);
  });
  await transactionComplete(tx);
};

const deleteByIndex = async (storeName: string, index: number): Promise<void> => {
  if (!isBrowser()) return;
  const db = await openDb();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  const keys = await requestToPromise(store.getAllKeys());
  const key = keys[index];
  if (key !== undefined) {
    store.delete(key);
  }
  await transactionComplete(tx);
};

// --- 초기 데이터 (제품 마스터) ---
export async function getProducts(): Promise<Product[]> {
  return getAllFromStore<Product>(PRODUCTS_STORE);
}

export async function setProducts(data: Product[]): Promise<void> {
  await putAll(PRODUCTS_STORE, data);
}

export async function updateProductMemo(productCode: string, memo: string): Promise<void> {
  const products = await getProducts();
  const updated = products.map((product) =>
    product.productCode === productCode ? { ...product, memo } : product,
  );
  await setProducts(updated);
}

// --- 판매내역 ---
export async function getSalesRecords(): Promise<SalesRecord[]> {
  return getAllFromStore<SalesRecord>(SALES_STORE);
}

export async function setSalesRecords(data: SalesRecord[]): Promise<void> {
  await clearAndAddAll(SALES_STORE, data);
}

export async function addSalesRecords(records: SalesRecord[]): Promise<void> {
  await addAll(SALES_STORE, records);
}

// --- 입고내역 ---
export async function getIncomingRecords(): Promise<IncomingRecord[]> {
  return getAllFromStore<IncomingRecord>(INCOMING_STORE);
}

export async function setIncomingRecords(data: IncomingRecord[]): Promise<void> {
  await clearAndAddAll(INCOMING_STORE, data);
}

export async function addIncomingRecords(records: IncomingRecord[]): Promise<void> {
  await addAll(INCOMING_STORE, records);
}

// --- 대시보드용 재고 현황 계산 ---
export async function calculateStockSummary(): Promise<StockSummary[]> {
  const [products, sales, incoming] = await Promise.all([
    getProducts(),
    getSalesRecords(),
    getIncomingRecords(),
  ]);

  return products.map((product) => {
    const productSales = sales.filter((s) => s.productId === product.productCode);

    const totalSales = productSales
      .filter((s) => normalizeSalesChannel(s.channel) !== '반품')
      .reduce((sum, s) => sum + getOrderQuantity(s), 0);

    const totalReturns = productSales
      .filter((s) => normalizeSalesChannel(s.channel) === '반품')
      .reduce((sum, s) => sum + getOrderQuantity(s), 0);

    const salesStockDelta = productSales
      .reduce((sum, s) => sum + getStockDeltaFromSale(s), 0);

    const totalIncoming = incoming
      .filter((i) => i.productCode === product.productCode)
      .reduce((sum, i) => sum + i.quantity, 0);

    const currentStock = product.stock + totalIncoming + salesStockDelta;

    return {
      productCode: product.productCode,
      productName: product.productName,
      initialStock: product.stock,
      targetStock: product.targetStock,
      totalIncoming,
      totalSales,
      totalReturns,
      currentStock,
      gap: currentStock - product.targetStock,
    };
  });
}

// --- 개별 초기화 ---
export async function clearSalesRecords(): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDb();
  const tx = db.transaction(SALES_STORE, 'readwrite');
  tx.objectStore(SALES_STORE).clear();
  await transactionComplete(tx);
}

export async function clearIncomingRecords(): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDb();
  const tx = db.transaction(INCOMING_STORE, 'readwrite');
  tx.objectStore(INCOMING_STORE).clear();
  await transactionComplete(tx);
}

// --- 판매 개별 삭제 ---
export async function deleteSalesRecord(index: number): Promise<void> {
  await deleteByIndex(SALES_STORE, index);
}

// --- 입고 개별 삭제 ---
export async function deleteIncomingRecord(index: number): Promise<void> {
  await deleteByIndex(INCOMING_STORE, index);
}

// --- 전체 초기화 ---
export async function clearAllData(): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDb();
  const tx = db.transaction([PRODUCTS_STORE, SALES_STORE, INCOMING_STORE], 'readwrite');
  tx.objectStore(PRODUCTS_STORE).clear();
  tx.objectStore(SALES_STORE).clear();
  tx.objectStore(INCOMING_STORE).clear();
  await transactionComplete(tx);
}

// --- 전체 백업/복원 ---
export async function exportFullBackup(): Promise<string> {
  const [products, salesRecords, incomingRecords] = await Promise.all([
    getProducts(),
    getSalesRecords(),
    getIncomingRecords(),
  ]);
  return JSON.stringify({
    products,
    salesRecords,
    incomingRecords,
  });
}

export async function importFullBackup(json: string): Promise<{ products: number; sales: number; incoming: number }> {
  const data = JSON.parse(json);
  const products = data.products || [];
  const sales = data.salesRecords || [];
  const incoming = data.incomingRecords || [];
  await Promise.all([
    setProducts(products),
    setSalesRecords(sales),
    setIncomingRecords(incoming),
  ]);
  return { products: products.length, sales: sales.length, incoming: incoming.length };
}
