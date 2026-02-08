'use client';

import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    setSummary(calculateStockSummary());
    const salesData = getSalesRecords();
    const incomingData = getIncomingRecords();
    setSales(salesData);
    setIncoming(incomingData);
    setSalesCount(salesData.length);
    setIncomingCount(incomingData.length);
  }, []);

  const totalProducts = summary.length;
  const totalCurrentStock = summary.reduce((sum, d) => sum + d.currentStock, 0);
  const belowTargetCount = summary.filter((d) => d.gap < 0).length;

  const filteredSummary = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return summary;
    return summary.filter((item) =>
      item.productCode.toLowerCase().includes(query)
      || item.productName.toLowerCase().includes(query),
    );
  }, [search, summary]);

  const filteredProductCodes = useMemo(() => new Set(
    filteredSummary.map((item) => item.productCode),
  ), [filteredSummary]);

  const filteredSales = useMemo(() => {
    if (filteredProductCodes.size === 0 && search.trim()) return [];
    if (!search.trim()) return sales;
    return sales.filter((record) => filteredProductCodes.has(record.productId));
  }, [filteredProductCodes, sales, search]);

  const filteredIncoming = useMemo(() => {
    if (filteredProductCodes.size === 0 && search.trim()) return [];
    if (!search.trim()) return incoming;
    return incoming.filter((record) => filteredProductCodes.has(record.productCode));
  }, [filteredProductCodes, incoming, search]);

  const monthlyData = useMemo(() => {
    const dateMap = new Map<string, { incoming: number; sales: number }>();
    filteredIncoming.forEach((record) => {
      const datePart = record.incomingDate.split(' ')[0];
      const monthKey = datePart.length >= 7 ? datePart.slice(0, 7) : datePart;
      const existing = dateMap.get(monthKey) || { incoming: 0, sales: 0 };
      existing.incoming += record.quantity;
      dateMap.set(monthKey, existing);
    });
    filteredSales.forEach((record) => {
      const datePart = record.orderTime.split(' ')[0];
      const monthKey = datePart.length >= 7 ? datePart.slice(0, 7) : datePart;
      const existing = dateMap.get(monthKey) || { incoming: 0, sales: 0 };
      existing.sales += record.orderQuantity;
      dateMap.set(monthKey, existing);
    });

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, ...value }));
  }, [filteredIncoming, filteredSales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <Link
          href="/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          데이터 업로드
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">총 제품 수</p>
          <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">현재 총 재고</p>
          <p className="text-3xl font-bold text-green-600">{totalCurrentStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">목표 미달</p>
          <p className="text-3xl font-bold text-red-600">{belowTargetCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">판매 건수</p>
          <p className="text-3xl font-bold text-orange-500">{salesCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">입고 건수</p>
          <p className="text-3xl font-bold text-purple-600">{incomingCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">제품 검색</p>
          <p className="text-xs text-gray-500">제품코드/제품명 기준으로 월별 입고/판매 그래프가 필터링됩니다.</p>
        </div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="예: PROD-001"
          className="w-full md:w-96 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">월별 입고 / 판매</h2>
            <p className="text-sm text-gray-500">
              {search.trim() ? '검색된 제품 기준' : '전체 제품 기준'}으로 월별 합산 표시
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
          <p className="text-gray-500 text-center py-8">표시할 월별 데이터가 없습니다.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">재고 현황</h2>
          <p className="text-sm text-gray-500">초기재고 + 입고 - 판매 = 현재재고</p>
        </div>
        <StockTable data={filteredSummary} />
      </div>
    </div>
  );
}
