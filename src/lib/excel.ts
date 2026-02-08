import * as XLSX from 'xlsx';
import { StockItem, StockTransaction } from '@/types/stock';

export function parseExcelFile(file: File): Promise<StockTransaction[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        const transactions: StockTransaction[] = jsonData.map((row) => ({
          productId: String(row['productId'] || ''),
          productName: String(row['productName'] || ''),
          category: String(row['category'] || ''),
          quantity: Number(row['quantity'] || 0),
          type: (String(row['type'] || 'IN').toUpperCase() === 'OUT' ? 'OUT' : 'IN') as 'IN' | 'OUT',
        }));

        resolve(transactions);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsArrayBuffer(file);
  });
}

export function exportToExcel(data: StockItem[], filename: string = 'stock_data.xlsx'): void {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '재고현황');
  XLSX.writeFile(workbook, filename);
}
