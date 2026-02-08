'use client';

import { useEffect, useState } from 'react';
import { getStockData, getTransactionLog } from '@/lib/storage';
import { StockItem, TransactionLog } from '@/types/stock';
import StockCharts from '@/components/StockCharts';

export default function ChartsPage() {
  const [stockData, setLocalStock] = useState<StockItem[]>([]);
  const [transactionLog, setTransactionLog] = useState<TransactionLog[]>([]);

  useEffect(() => {
    setLocalStock(getStockData());
    setTransactionLog(getTransactionLog());
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 시각화</h1>
      <StockCharts stockData={stockData} transactionLog={transactionLog} />
    </div>
  );
}
