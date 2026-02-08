'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { calculateStockSummary, getSalesRecords, getIncomingRecords } from '@/lib/storage';
import { StockSummary, SalesRecord, IncomingRecord } from '@/types/stock';
import StockTable from '@/components/StockTable';
import Link from 'next/link';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function DashboardPage() {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [incoming, setIncoming] = useState<IncomingRecord[]>([]);
  const [salesCount, setSalesCount] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadData = useCallback(() => {
    setSummary(calculateStockSummary());
    const salesData = getSalesRecords();
    const incomingData = getIncomingRecords();
    setSales(salesData);
    setIncoming(incomingData);
    setSalesCount(salesData.length);
    setIncomingCount(incomingData.length);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalProducts = summary.length;
  const totalCurrentStock = summary.reduce((sum, d) => sum + d.currentStock, 0);
  const belowTargetCount = summary.filter((d) => d.gap < 0).length;

  const filteredSummary = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return summary;
    return summary.filter((item) =>
      item.productCode.toLowerCase().includes(query)
      || (item.productName || '').toLowerCase().includes(query),
    );
  }, [search, summary]);

  const filteredProductCodes = useMemo(() => new Set(
    filteredSummary.map((item) => item.productCode),
  ), [filteredSummary]);

  // 날짜 범위 필터 적용
  const dateFilteredSales = useMemo(() => {
    let filtered = search.trim()
      ? sales.filter((r) => filteredProductCodes.has(r.productId))
      : sales;
    if (dateFrom) filtered = filtered.filter((r) => r.orderTime.split(' ')[0] >= dateFrom);
    if (dateTo) filtered = filtered.filter((r) => r.orderTime.split(' ')[0] <= dateTo);
    return filtered;
  }, [sales, filteredProductCodes, search, dateFrom, dateTo]);

  const dateFilteredIncoming = useMemo(() => {
    let filtered = search.trim()
      ? incoming.filter((r) => filteredProductCodes.has(r.productCode))
      : incoming;
    if (dateFrom) filtered = filtered.filter((r) => r.incomingDate.split(' ')[0] >= dateFrom);
    if (dateTo) filtered = filtered.filter((r) => r.incomingDate.split(' ')[0] <= dateTo);
    return filtered;
  }, [incoming, filteredProductCodes, search, dateFrom, dateTo]);

  const monthlyData = useMemo(() => {
    const dateMap = new Map<string, { incoming: number; sales: number }>();
    dateFilteredIncoming.forEach((record) => {
      const datePart = record.incomingDate.split(' ')[0];
      const monthKey = datePart.length >= 7 ? datePart.slice(0, 7) : datePart;
      const existing = dateMap.get(monthKey) || { incoming: 0, sales: 0 };
      existing.incoming += record.quantity;
      dateMap.set(monthKey, existing);
    });
    dateFilteredSales.forEach((record) => {
      const datePart = record.orderTime.split(' ')[0];
      const monthKey = datePart.length >= 7 ? datePart.slice(0, 7) : datePart;
      const existing = dateMap.get(monthKey) || { incoming: 0, sales: 0 };
      existing.sales += record.orderQuantity;
      dateMap.set(monthKey, existing);
    });
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, ...value }));
  }, [dateFilteredIncoming, dateFilteredSales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">대시보드</h1>
        <div className="flex gap-2">
          <button onClick={loadData} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium">
            새로고침
          </button>
          <Link href="/upload" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            데이터 업로드
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">총 제품 수</p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">현재 총 재고</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{totalCurrentStock}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">목표 미달</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{belowTargetCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">판매 건수</p>
          <p className="text-2xl sm:text-3xl font-bold text-orange-500">{salesCount}</p>
        </div>
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">입고 건수</p>
          <p className="text-2xl sm:text-3xl font-bold text-purple-600">{incomingCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-3">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">제품 검색</p>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="제품코드/제품명"
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">기간 (시작)</p>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="mt-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">기간 (종료)</p>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="mt-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-sm text-blue-600 dark:text-blue-400 hover:underline pb-2">초기화</button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold dark:text-white">월별 입고 / 판매</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {search.trim() ? '검색된 제품 기준' : '전체 제품 기준'}
              {(dateFrom || dateTo) ? ` (${dateFrom || '~'} ~ ${dateTo || '~'})` : ''}
            </p>
          </div>
        </div>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incoming" stroke="#10B981" name="입고" strokeWidth={2} />
              <Line type="monotone" dataKey="sales" stroke="#F59E0B" name="판매" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">표시할 월별 데이터가 없습니다.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">재고 현황</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">초기재고 + 입고 - 판매 = 현재재고</p>
        </div>
        <StockTable data={filteredSummary} />
      </div>
    </div>
  );
}
