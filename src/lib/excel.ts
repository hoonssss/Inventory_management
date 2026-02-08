import * as XLSX from 'xlsx';
import { Product, SalesRecord, IncomingRecord, StockSummary } from '@/types/stock';

// --- 엑셀 파싱 ---
export function parseProductsExcel(file: File): Promise<Product[]> {
  return parseExcel<Product>(file, (row) => ({
    productCode: String(row['제품코드'] || ''),
    productName: String(row['제품명'] || ''),
    stock: Number(row['재고'] || 0),
    targetStock: Number(row['목표재고'] || 0),
    memo: String(row['메모'] || ''),
  }));
}

export function parseSalesExcel(file: File): Promise<SalesRecord[]> {
  return parseExcel<SalesRecord>(file, (row) => ({
    orderTime: normalizeExcelDate(row['주문시간']),
    productId: String(row['제품ID'] || ''),
    orderQuantity: Number(row['주문수량'] || 0),
  }));
}

export function parseIncomingExcel(file: File): Promise<IncomingRecord[]> {
  return parseExcel<IncomingRecord>(file, (row) => ({
    incomingDate: normalizeExcelDate(row['입고일자'], { includeTime: false }),
    productCode: String(row['제품코드'] || ''),
    quantity: Number(row['수량'] || 0),
  }));
}

export async function parseWorkbookExcel(file: File): Promise<{
  products: Product[];
  sales: SalesRecord[];
  incoming: IncomingRecord[];
}> {
  const workbook = await readWorkbook(file);
  const productsRows = sheetToJson(workbook, '초기데이터');
  const salesRows = sheetToJson(workbook, '판매내역');
  const incomingRows = sheetToJson(workbook, '입고내역');

  return {
    products: productsRows.map((row) => ({
      productCode: String(row['제품코드'] || ''),
      productName: String(row['제품명'] || ''),
      stock: Number(row['재고'] || 0),
      targetStock: Number(row['목표재고'] || 0),
      memo: String(row['메모'] || ''),
    })),
    sales: salesRows.map((row) => ({
      orderTime: normalizeExcelDate(row['주문시간']),
      productId: String(row['제품ID'] || ''),
      orderQuantity: Number(row['주문수량'] || 0),
    })),
    incoming: incomingRows.map((row) => ({
      incomingDate: normalizeExcelDate(row['입고일자'], { includeTime: false }),
      productCode: String(row['제품코드'] || ''),
      quantity: Number(row['수량'] || 0),
    })),
  };
}

function normalizeExcelDate(
  value: unknown,
  options: { includeTime?: boolean } = { includeTime: true },
): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) {
      return String(value);
    }
    const year = String(parsed.y).padStart(4, '0');
    const month = String(parsed.m).padStart(2, '0');
    const day = String(parsed.d).padStart(2, '0');
    const datePart = `${year}-${month}-${day}`;
    const timePart = `${String(parsed.H).padStart(2, '0')}:${String(parsed.M).padStart(2, '0')}`;
    if (options.includeTime && (parsed.H !== 0 || parsed.M !== 0 || parsed.S !== 0)) {
      return `${datePart} ${timePart}`;
    }
    return datePart;
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    const datePart = `${year}-${month}-${day}`;
    if (!options.includeTime) {
      return datePart;
    }
    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');
    return `${datePart} ${hours}:${minutes}`;
  }

  return String(value).trim();
}

function parseExcel<T>(file: File, mapper: (row: Record<string, unknown>) => T): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
        resolve(jsonData.map(mapper));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsArrayBuffer(file);
  });
}

function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        resolve(XLSX.read(data, { type: 'array' }));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsArrayBuffer(file);
  });
}

function sheetToJson(workbook: XLSX.WorkBook, sheetName: string): Record<string, unknown>[] {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return [];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);
}

// --- 엑셀 템플릿 다운로드 ---
export function downloadProductTemplate(): void {
  const data = [{ '제품코드': 'PROD-001', '제품명': '샘플 제품', '재고': 100, '목표재고': 150, '메모': '거래처 정보 메모' }];
  downloadTemplate(data, '초기데이터_템플릿.xlsx', '초기데이터');
}

export function downloadSalesTemplate(): void {
  const data = [{ '주문시간': '2026-02-08 14:30', '제품ID': 'PROD-001', '주문수량': 5 }];
  downloadTemplate(data, '판매내역_템플릿.xlsx', '판매내역');
}

export function downloadIncomingTemplate(): void {
  const data = [{ '입고일자': '2026-02-08', '제품코드': 'PROD-001', '수량': 50 }];
  downloadTemplate(data, '입고내역_템플릿.xlsx', '입고내역');
}

export function downloadFullTemplate(): void {
  const productRows = [{ '제품코드': 'PROD-001', '제품명': '샘플 제품', '재고': 100, '목표재고': 150, '메모': '거래처 정보 메모' }];
  const salesRows = [{ '주문시간': '2026-02-08 14:30', '제품ID': 'PROD-001', '주문수량': 5 }];
  const incomingRows = [{ '입고일자': '2026-02-08', '제품코드': 'PROD-001', '수량': 50 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productRows), '초기데이터');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesRows), '판매내역');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomingRows), '입고내역');
  XLSX.writeFile(wb, '전체_업로드_템플릿.xlsx');
}

function downloadTemplate(data: Record<string, unknown>[], filename: string, sheetName: string): void {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

// --- 엑셀 내보내기 ---
export function exportSummaryToExcel(data: StockSummary[]): void {
  const rows = data.map((d) => ({
    '제품코드': d.productCode,
    '제품명': d.productName,
    '초기재고': d.initialStock,
    '목표재고': d.targetStock,
    '총입고': d.totalIncoming,
    '총판매': d.totalSales,
    '현재재고': d.currentStock,
    '과부족': d.gap,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '재고현황');
  XLSX.writeFile(wb, '재고현황.xlsx');
}

export function exportSalesToExcel(data: SalesRecord[]): void {
  const rows = data.map((d) => ({
    '주문시간': d.orderTime,
    '제품ID': d.productId,
    '주문수량': d.orderQuantity,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '판매내역');
  XLSX.writeFile(wb, '판매내역.xlsx');
}

export function exportIncomingToExcel(data: IncomingRecord[]): void {
  const rows = data.map((d) => ({
    '입고일자': d.incomingDate,
    '제품코드': d.productCode,
    '수량': d.quantity,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '입고내역');
  XLSX.writeFile(wb, '입고내역.xlsx');
}
