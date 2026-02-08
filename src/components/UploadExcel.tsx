'use client';

import { useState, useRef } from 'react';
import { parseExcelFile } from '@/lib/excel';
import { getStockData, setStockData, addTransactionLog } from '@/lib/storage';
import { StockItem, StockTransaction } from '@/types/stock';

interface UploadExcelProps {
  onUploadComplete: () => void;
}

export default function UploadExcel({ onUploadComplete }: UploadExcelProps) {
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processTransactions = (transactions: StockTransaction[]) => {
    const currentStock = getStockData();
    const stockMap = new Map<string, StockItem>();

    currentStock.forEach((item) => stockMap.set(item.productId, { ...item }));

    const today = new Date().toISOString().split('T')[0];

    transactions.forEach((tx) => {
      const existing = stockMap.get(tx.productId);

      if (existing) {
        if (tx.type === 'IN') {
          existing.stock += tx.quantity;
        } else {
          existing.stock = Math.max(0, existing.stock - tx.quantity);
        }
        existing.updatedAt = today;
      } else {
        stockMap.set(tx.productId, {
          productId: tx.productId,
          productName: tx.productName,
          category: tx.category,
          stock: tx.type === 'IN' ? tx.quantity : 0,
          updatedAt: today,
        });
      }

      addTransactionLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        productId: tx.productId,
        productName: tx.productName,
        category: tx.category,
        quantity: tx.quantity,
        type: tx.type,
        date: today,
      });
    });

    setStockData(Array.from(stockMap.values()));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const transactions = await parseExcelFile(file);
      if (transactions.length === 0) {
        setMessage('업로드한 파일에 데이터가 없습니다.');
        setIsError(true);
        return;
      }

      processTransactions(transactions);
      setMessage(`${transactions.length}건의 거래가 처리되었습니다.`);
      setIsError(false);
      onUploadComplete();
    } catch {
      setMessage('엑셀 파일 처리 중 오류가 발생했습니다.');
      setIsError(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">엑셀 업로드 (.xlsx)</h3>
      <p className="text-sm text-gray-500 mb-4">
        컬럼: productId, productName, category, quantity, type (IN/OUT)
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {message && (
        <p className={`mt-3 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
