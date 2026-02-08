'use client';

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { StockItem, TransactionLog } from '@/types/stock';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

interface StockChartsProps {
  stockData: StockItem[];
  transactionLog: TransactionLog[];
}

export default function StockCharts({ stockData, transactionLog }: StockChartsProps) {
  // Category-based pie chart data
  const categoryMap = new Map<string, number>();
  stockData.forEach((item) => {
    const current = categoryMap.get(item.category) || 0;
    categoryMap.set(item.category, current + item.stock);
  });
  const pieData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // Product-based bar chart data
  const barData = stockData.map((item) => ({
    name: item.productName,
    stock: item.stock,
  }));

  // Transaction trend line chart data
  const dateMap = new Map<string, { in: number; out: number }>();
  transactionLog.forEach((log) => {
    const existing = dateMap.get(log.date) || { in: 0, out: 0 };
    if (log.type === 'IN') {
      existing.in += log.quantity;
    } else {
      existing.out += log.quantity;
    }
    dateMap.set(log.date, existing);
  });
  const lineData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({
      date,
      ...val,
    }));

  return (
    <div className="space-y-8">
      {/* Pie Chart - Category Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">카테고리별 재고 비율</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
        )}
      </div>

      {/* Bar Chart - Stock per Product */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">상품별 재고 수량</h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
        )}
      </div>

      {/* Line Chart - Transaction Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">입고 / 출고 추이</h3>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="in" stroke="#10B981" name="입고" strokeWidth={2} />
              <Line type="monotone" dataKey="out" stroke="#EF4444" name="출고" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">거래 기록이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
