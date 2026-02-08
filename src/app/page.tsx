'use client';

import { useEffect, useState } from 'react';
import {
  calculateStockSummary,
  getSalesRecords,
  getIncomingRecords,
} from '@/lib/storage';
import { StockSummary } from '@/types/stock';
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
  const [salesCount, setSalesCount] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; incoming: number; sales: number }[]
  >([]);

  useEffect(() => {
    setSummary(calculateStockSummary());
    const sales = getSalesRecords();
    const incoming = getIncomingRecords();
    setSalesCount(sales.length);
    setIncomingCount(incoming.length);

    const monthlyMap = new Map<string, { incoming: number; sales: number }>();
    const normalizeMonth = (value: string) => {
      const datePart = value.split(' ')[0];
      return datePart.length >= 7 ? datePart.slice(0, 7) : datePart;
    };

    incoming.forEach((record) => {
      const month = normalizeMonth(record.incomingDate);
      const existing = monthlyMap.get(month) || { incoming: 0, sales: 0 };
      existing.incoming += record.quantity;
      monthlyMap.set(month, existing);
    });

    sales.forEach((record) => {
      const month = normalizeMonth(record.orderTime);
      const existing = monthlyMap.get(month) || { incoming: 0, sales: 0 };
      existing.sales += record.orderQuantity;
      monthlyMap.set(month, existing);
    });

    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, values]) => ({ month, ...values }));
    setMonthlyData(monthly);
  }, []);

  const totalProducts = summary.length;
  const totalCurrentStock = summary.reduce((sum, d) => sum + d.currentStock, 0);
  const belowTargetCount = summary.filter((d) => d.gap < 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <Link
          href="/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          데이터 업로드
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">재고 현황</h2>
          <p className="text-sm text-gray-500">초기재고 + 입고 - 판매 = 현재재고</p>
        </div>
        <StockTable data={summary} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">월별 입고 / 판매</h2>
          <p className="text-sm text-gray-500">월 단위로 합산된 입고 및 판매량입니다.</p>
        </div>
        <div className="p-6">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="incoming" stroke="#10B981" name="입고" />
                <Line type="monotone" dataKey="sales" stroke="#F59E0B" name="판매" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">월별 거래 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
