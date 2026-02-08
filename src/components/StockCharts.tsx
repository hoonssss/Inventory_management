'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { StockSummary, SalesRecord, IncomingRecord } from '@/types/stock';

interface StockChartsProps {
  summaryData: StockSummary[];
  salesData: SalesRecord[];
  incomingData: IncomingRecord[];
}

export default function StockCharts({ summaryData, salesData, incomingData }: StockChartsProps) {
  const barData = summaryData.map((d) => ({
    name: d.productName ? `${d.productCode} (${d.productName})` : d.productCode,
    currentStock: d.currentStock,
    targetStock: d.targetStock,
  }));

  const dateMap = new Map<string, { incoming: number; sales: number }>();
  incomingData.forEach((r) => {
    const date = r.incomingDate.split(' ')[0];
    const existing = dateMap.get(date) || { incoming: 0, sales: 0 };
    existing.incoming += r.quantity;
    dateMap.set(date, existing);
  });
  salesData.forEach((r) => {
    const date = r.orderTime.split(' ')[0];
    const existing = dateMap.get(date) || { incoming: 0, sales: 0 };
    existing.sales += r.orderQuantity;
    dateMap.set(date, existing);
  });
  const lineData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({ date, ...val }));

  const gapData = summaryData.map((d) => ({
    name: d.productName ? `${d.productCode} (${d.productName})` : d.productCode,
    gap: d.gap,
  }));

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">제품별 현재재고 vs 목표재고</h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentStock" fill="#3B82F6" name="현재재고" />
              <Bar dataKey="targetStock" fill="#E5E7EB" name="목표재고" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">입고 / 판매 추이</h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="incoming" stroke="#10B981" name="입고" strokeWidth={2} />
              <Line type="monotone" dataKey="sales" stroke="#F59E0B" name="판매" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">거래 기록이 없습니다.</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">제품별 과부족 (현재 - 목표)</h3>
        {gapData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="gap" name="과부족" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
