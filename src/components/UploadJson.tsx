'use client';

import { useState, useRef } from 'react';
import { getStockData, setStockData, addTransactionLog } from '@/lib/storage';
import { StockItem, StockTransaction } from '@/types/stock';

interface UploadJsonProps {
  onUploadComplete: () => void;
}

export default function UploadJson({ onUploadComplete }: UploadJsonProps) {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string) as StockTransaction[];

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          setMessage('유효한 JSON 배열 데이터가 없습니다.');
          setIsError(true);
          return;
        }

        processTransactions(jsonData);
        setMessage(`${jsonData.length}건의 거래가 처리되었습니다.`);
        setIsError(false);
        onUploadComplete();
      } catch {
        setMessage('JSON 파일 파싱 중 오류가 발생했습니다.');
        setIsError(true);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">JSON 업로드 (.json)</h3>
      <p className="text-sm text-gray-500 mb-4">
        배열 형식: [&#123; productId, productName, category, quantity, type &#125;]
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />
      {message && (
        <p className={`mt-3 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
