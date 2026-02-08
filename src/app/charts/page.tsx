'use client';

import { useEffect, useState } from 'react';
import { calculateStockSummary, getSalesRecords, getIncomingRecords } from '@/lib/storage';
import { StockSummary, SalesRecord, IncomingRecord } from '@/types/stock';
import StockCharts from '@/components/StockCharts';

export default function ChartsPage() {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [incoming, setIncoming] = useState<IncomingRecord[]>([]);

  useEffect(() => {
    setSummary(calculateStockSummary());
    setSales(getSalesRecords());
    setIncoming(getIncomingRecords());
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 시각화</h1>
      <StockCharts summaryData={summary} salesData={sales} incomingData={incoming} />
    </div>
  );
}
