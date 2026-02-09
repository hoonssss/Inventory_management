'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculateStockSummary, getSalesRecords, getIncomingRecords } from '@/lib/storage';
import { StockSummary, SalesRecord, IncomingRecord } from '@/types/stock';
import StockCharts from '@/components/StockCharts';

export default function ChartsPage() {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [incoming, setIncoming] = useState<IncomingRecord[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      const [summaryData, salesData, incomingData] = await Promise.all([
        calculateStockSummary(),
        getSalesRecords(),
        getIncomingRecords(),
      ]);
      setSummary(summaryData);
      setSales(salesData);
      setIncoming(incomingData);
    };
    void load();
  }, []);

  const filteredSummary = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return summary;
    return summary.filter((item) => item.productCode.toLowerCase().includes(query));
  }, [search, summary]);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sales;
    return sales.filter((record) => record.productId.toLowerCase().includes(query));
  }, [search, sales]);

  const filteredIncoming = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return incoming;
    return incoming.filter((record) => record.productCode.toLowerCase().includes(query));
  }, [search, incoming]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 시각화</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">제품 검색</p>
          <p className="text-xs text-gray-500">제품코드를 입력하면 해당 입고/판매 그래프만 표시됩니다.</p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="예: PROD-001"
          className="w-full md:w-96 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <StockCharts summaryData={filteredSummary} salesData={filteredSales} incomingData={filteredIncoming} />
    </div>
  );
}
