'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculateStockSummary, getSalesRecords, getIncomingRecords } from '@/lib/storage';
import { StockSummary, SalesRecord, IncomingRecord } from '@/types/stock';
import StockCharts from '@/components/StockCharts';
import { matchesSearchTokens } from '@/lib/search';

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

  const filteredSummary = useMemo(() => (
    summary.filter((item) => matchesSearchTokens(search, item.productCode, item.productName))
  ), [search, summary]);

  const productNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    summary.forEach((item) => {
      map.set(item.productCode.toLowerCase(), item.productName.toLowerCase());
    });
    return map;
  }, [summary]);

  const filteredSales = useMemo(() => (
    sales.filter((record) => {
      const productCode = record.productId.toLowerCase();
      const productName = productNameByCode.get(productCode) || '';
      return matchesSearchTokens(search, productCode, productName);
    })
  ), [productNameByCode, search, sales]);

  const filteredIncoming = useMemo(() => (
    incoming.filter((record) => {
      const productCode = record.productCode.toLowerCase();
      const productName = productNameByCode.get(productCode) || '';
      return matchesSearchTokens(search, productCode, productName);
    })
  ), [incoming, productNameByCode, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 시각화</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">제품 검색</p>
          <p className="text-xs text-gray-500">제품코드 또는 제품명을 입력하면 해당 입고/판매 그래프만 표시됩니다.</p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="예: PROD-001 또는 샘플 제품"
          className="w-full md:w-96 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <StockCharts summaryData={filteredSummary} salesData={filteredSales} incomingData={filteredIncoming} />
    </div>
  );
}
