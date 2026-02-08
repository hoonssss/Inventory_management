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
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
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

  const monthlySalesData = useMemo(() => (
    monthlyData.map((item) => ({ month: item.month, sales: item.sales }))
  ), [monthlyData]);

  const seasonalSalesData = useMemo(() => {
    const seasonTotals = {
      봄: 0,
      여름: 0,
      가을: 0,
      겨울: 0,
    };
    const getSeason = (month: number) => {
      if ([3, 4, 5].includes(month)) return '봄';
      if ([6, 7, 8].includes(month)) return '여름';
      if ([9, 10, 11].includes(month)) return '가을';
      return '겨울';
    };
    monthlyData.forEach((item) => {
      const monthNumber = Number(item.month.split('-')[1]);
      const season = getSeason(monthNumber);
      seasonTotals[season] += item.sales;
    });
    return Object.entries(seasonTotals).map(([season, sales]) => ({ season, sales }));
  }, [monthlyData]);

  const latestTwoMonths = useMemo(() => {
    if (monthlyData.length === 0) return { latest: null, previous: null };
    const sorted = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));
    const latest = sorted[sorted.length - 1] || null;
    const previous = sorted[sorted.length - 2] || null;
    return { latest, previous };
  }, [monthlyData]);

  const calcChange = (current: number | undefined, previous: number | undefined) => {
    if (!previous || previous === 0 || current === undefined) return null;
    return ((current - previous) / previous) * 100;
  };

  const momSalesChange = calcChange(latestTwoMonths.latest?.sales, latestTwoMonths.previous?.sales);
  const momIncomingChange = calcChange(latestTwoMonths.latest?.incoming, latestTwoMonths.previous?.incoming);

  const parseDate = (dateString: string) => {
    const datePart = dateString.split(' ')[0];
    const parsed = new Date(datePart);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const salesReferenceDate = useMemo(() => {
    const dates = dateFilteredSales
      .map((record) => parseDate(record.orderTime))
      .filter((date): date is Date => Boolean(date));
    if (dates.length === 0) return new Date();
    return new Date(Math.max(...dates.map((date) => date.getTime())));
  }, [dateFilteredSales]);

  const depletionForecast = useMemo(() => {
    const cutoff = new Date(salesReferenceDate);
    cutoff.setDate(cutoff.getDate() - 30);

    return summary.map((item) => {
      const recentSales = dateFilteredSales
        .filter((record) => record.productId === item.productCode)
        .filter((record) => {
          const date = parseDate(record.orderTime);
          return date ? date >= cutoff : false;
        })
        .reduce((sum, record) => sum + record.orderQuantity, 0);
      const avgDailySales = recentSales / 30;
      if (avgDailySales <= 0) {
        return { ...item, avgDailySales: 0, daysLeft: null, depletionDate: null };
      }
      const daysLeft = item.currentStock / avgDailySales;
      const predictedDate = new Date(salesReferenceDate);
      predictedDate.setDate(predictedDate.getDate() + Math.ceil(daysLeft));
      return {
        ...item,
        avgDailySales,
        daysLeft,
        depletionDate: predictedDate,
      };
    }).sort((a, b) => {
      if (a.daysLeft === null) return 1;
      if (b.daysLeft === null) return -1;
      return a.daysLeft - b.daysLeft;
    });
  }, [summary, dateFilteredSales, salesReferenceDate]);

  const reorderList = useMemo(() => (
    summary
      .filter((item) => item.gap < 0)
      .map((item) => ({
        ...item,
        reorderQty: Math.abs(item.gap),
      }))
      .sort((a, b) => b.reorderQty - a.reorderQty)
  ), [summary]);

  const salesShareData = useMemo(() => {
    const salesMap = new Map<string, number>();
    dateFilteredSales.forEach((record) => {
      salesMap.set(record.productId, (salesMap.get(record.productId) || 0) + record.orderQuantity);
    });
    const base = summary.map((item) => ({
      name: item.productName || item.productCode,
      code: item.productCode,
      value: salesMap.get(item.productCode) || 0,
    })).filter((item) => item.value > 0);
    const sorted = base.sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, 6);
    const rest = sorted.slice(6);
    if (rest.length > 0) {
      top.push({
        name: '기타',
        code: 'others',
        value: rest.reduce((sum, item) => sum + item.value, 0),
      });
    }
    return top;
  }, [summary, dateFilteredSales]);

  const heatmapColor = (current: number, target: number) => {
    if (target <= 0) return 'hsl(210, 10%, 85%)';
    const ratio = Math.max(0, Math.min(current / target, 1.2));
    const hue = Math.round(ratio * 120);
    return `hsl(${hue}, 70%, 80%)`;
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">전월 대비 판매 증감률</p>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
            {momSalesChange === null ? '-' : `${momSalesChange > 0 ? '+' : ''}${momSalesChange.toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {latestTwoMonths.previous?.month ? `${latestTwoMonths.previous.month} → ${latestTwoMonths.latest?.month}` : '비교 가능한 데이터 없음'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">전월 대비 입고 증감률</p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {momIncomingChange === null ? '-' : `${momIncomingChange > 0 ? '+' : ''}${momIncomingChange.toFixed(1)}%`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {latestTwoMonths.previous?.month ? `${latestTwoMonths.previous.month} → ${latestTwoMonths.latest?.month}` : '비교 가능한 데이터 없음'}
          </p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold dark:text-white">월별 판매 추이</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {search.trim() ? '검색된 제품 기준' : '전체 제품 기준'}
                {(dateFrom || dateTo) ? ` (${dateFrom || '~'} ~ ${dateTo || '~'})` : ''}
              </p>
            </div>
          </div>
          {monthlySalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#F59E0B" name="판매" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">표시할 월별 데이터가 없습니다.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold dark:text-white">계절별 판매 비교</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                봄/여름/가을/겨울 판매량 합산
              </p>
            </div>
          </div>
          {seasonalSalesData.some((item) => item.sales > 0) ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={seasonalSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#6366F1" name="판매량" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">표시할 계절별 데이터가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold dark:text-white mb-4">제품별 판매 비중</h2>
          {salesShareData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={salesShareData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {salesShareData.map((entry, index) => (
                    <Cell key={entry.code} fill={['#60A5FA', '#34D399', '#FBBF24', '#F472B6', '#A78BFA', '#F97316', '#94A3B8'][index % 7]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">표시할 판매 비중 데이터가 없습니다.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold dark:text-white mb-4">재고 현황 히트맵</h2>
          {summary.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {summary.map((item) => (
                <div
                  key={item.productCode}
                  className="rounded-lg p-3 text-xs text-gray-700"
                  style={{ backgroundColor: heatmapColor(item.currentStock, item.targetStock) }}
                >
                  <p className="font-semibold">{item.productName || item.productCode}</p>
                  <p className="text-gray-600">현재 {item.currentStock} / 목표 {item.targetStock}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">표시할 재고 데이터가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold dark:text-white mb-4">자동 재주문 알림</h2>
          {reorderList.length > 0 ? (
            <ul className="space-y-3">
              {reorderList.map((item) => (
                <li key={item.productCode} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.productName || item.productCode}</p>
                    <p className="text-xs text-gray-500">현재 {item.currentStock} / 목표 {item.targetStock}</p>
                  </div>
                  <span className="text-red-600 font-semibold">주문 필요 {item.reorderQty}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">재주문이 필요한 제품이 없습니다.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold dark:text-white mb-4">재고 소진 예상</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            최근 30일 평균 판매량 기준 예상 소진일
          </p>
          {depletionForecast.length > 0 ? (
            <ul className="space-y-3">
              {depletionForecast.slice(0, 6).map((item) => (
                <li key={item.productCode} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.productName || item.productCode}</p>
                    <p className="text-xs text-gray-500">
                      평균 {item.avgDailySales.toFixed(1)}개/일 · 현재 {item.currentStock}
                    </p>
                  </div>
                  <span className="text-gray-700 dark:text-gray-200 font-semibold">
                    {item.depletionDate
                      ? item.depletionDate.toISOString().split('T')[0]
                      : '-'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">예측할 데이터가 없습니다.</p>
          )}
        </div>
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
