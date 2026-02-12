'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Cell,
} from 'recharts';
import { StockSummary, SalesRecord, IncomingRecord } from '@/types/stock';
import { getOrderQuantity, normalizeSalesChannel } from '@/lib/sales';

interface StockChartsProps {
  summaryData: StockSummary[];
  salesData: SalesRecord[];
  incomingData: IncomingRecord[];
}

const ABC_COLORS: Record<string, string> = { A: '#10B981', B: '#F59E0B', C: '#EF4444' };
const MAX_PRODUCT_BARS = 20;

export default function StockCharts({ summaryData, salesData, incomingData }: StockChartsProps) {
  const formatProductName = (code: string, name?: string) => (name ? `${code} (${name})` : code);

  const barData = summaryData
    .map((d) => ({
      name: formatProductName(d.productCode, d.productName),
      currentStock: d.currentStock,
      targetStock: d.targetStock,
    }))
    .sort((a, b) => b.currentStock - a.currentStock);
  const limitedBarData = barData.slice(0, MAX_PRODUCT_BARS);

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
    if (normalizeSalesChannel(r.channel) !== '반품') existing.sales += getOrderQuantity(r);
    dateMap.set(date, existing);
  });
  const lineData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({ date, ...val }));

  const gapData = summaryData
    .map((d) => ({
      name: formatProductName(d.productCode, d.productName),
      gap: d.gap,
    }))
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  const limitedGapData = gapData.slice(0, MAX_PRODUCT_BARS);

  // ABC 분석: 판매량 기준
  const abcData = (() => {
    const salesByProduct = new Map<string, number>();
    salesData.forEach((r) => {
      if (normalizeSalesChannel(r.channel) === '반품') return;
      salesByProduct.set(r.productId, (salesByProduct.get(r.productId) || 0) + getOrderQuantity(r));
    });
    const sorted = Array.from(salesByProduct.entries())
      .sort(([, a], [, b]) => b - a);
    const totalSales = sorted.reduce((sum, [, qty]) => sum + qty, 0);
    let cumulative = 0;
    return sorted.map(([code, qty]) => {
      cumulative += qty;
      const pct = totalSales > 0 ? (cumulative / totalSales) * 100 : 0;
      const grade = pct <= 70 ? 'A' : pct <= 90 ? 'B' : 'C';
      const product = summaryData.find((s) => s.productCode === code);
      return {
        name: formatProductName(code, product?.productName),
        sales: qty,
        grade,
      };
    });
  })();
  const limitedAbcData = abcData.slice(0, MAX_PRODUCT_BARS);

  // 재고 회전율
  const turnoverData = summaryData
    .filter((d) => d.totalSales > 0)
    .map((d) => {
      const avgStock = (d.initialStock + d.currentStock) / 2;
      return {
        name: formatProductName(d.productCode, d.productName),
        turnover: avgStock > 0 ? Number((d.totalSales / avgStock).toFixed(2)) : 0,
      };
    })
    .sort((a, b) => b.turnover - a.turnover);
  const limitedTurnoverData = turnoverData.slice(0, MAX_PRODUCT_BARS);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">제품별 현재재고 vs 목표재고</h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={limitedBarData}>
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
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">데이터가 없습니다.</p>
        )}
        {barData.length > MAX_PRODUCT_BARS && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">제품이 많아 상위 {MAX_PRODUCT_BARS}개만 표시됩니다.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">입고 / 판매 추이</h3>
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
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">거래 기록이 없습니다.</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">제품별 과부족 (현재 - 목표)</h3>
        {gapData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={limitedGapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="gap" name="과부족" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">데이터가 없습니다.</p>
        )}
        {gapData.length > MAX_PRODUCT_BARS && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">제품이 많아 상위 {MAX_PRODUCT_BARS}개만 표시됩니다.</p>
        )}
      </div>

      {/* 재고 회전율 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">재고 회전율</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">총판매 / 평균재고 (높을수록 효율적)</p>
        {turnoverData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={limitedTurnoverData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="turnover" name="회전율" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">판매 기록이 없습니다.</p>
        )}
        {turnoverData.length > MAX_PRODUCT_BARS && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">제품이 많아 상위 {MAX_PRODUCT_BARS}개만 표시됩니다.</p>
        )}
      </div>

      {/* ABC 분석 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">ABC 분석 (판매량 기준)</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="text-green-600 font-medium">A</span> 누적 70% 이하 |{' '}
          <span className="text-yellow-600 font-medium">B</span> 70~90% |{' '}
          <span className="text-red-600 font-medium">C</span> 90% 초과
        </p>
        {abcData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={limitedAbcData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" name="판매량">
                {limitedAbcData.map((entry, idx) => (
                  <Cell key={idx} fill={ABC_COLORS[entry.grade] || '#999'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">판매 기록이 없습니다.</p>
        )}
        {abcData.length > MAX_PRODUCT_BARS && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">제품이 많아 상위 {MAX_PRODUCT_BARS}개만 표시됩니다.</p>
        )}
        {abcData.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400">제품</th>
                  <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400">판매량</th>
                  <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400">등급</th>
                </tr>
              </thead>
              <tbody>
                {abcData.map((item, i) => (
                  <tr key={i} className="border-b dark:border-gray-700">
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.name}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item.sales}</td>
                    <td className="px-3 py-2">
                      <span className={`font-bold ${item.grade === 'A' ? 'text-green-600' : item.grade === 'B' ? 'text-yellow-600' : 'text-red-600'}`}>
                        {item.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
