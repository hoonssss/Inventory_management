'use client';

import { useEffect, useMemo, useState } from 'react';
import { StockSummary } from '@/types/stock';

interface StockTableProps {
  data: StockSummary[];
}

type SortKey =
  | 'productCode'
  | 'productName'
  | 'initialStock'
  | 'targetStock'
  | 'totalIncoming'
  | 'totalSales'
  | 'currentStock'
  | 'gap';

type SortDirection = 'asc' | 'desc';
type AbcGrade = 'A' | 'B' | 'C';
type SortPreset = 'default' | 'shortage' | 'sales';

export default function StockTable({ data }: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('productCode');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [abcFilter, setAbcFilter] = useState<AbcGrade | 'all'>('all');
  const [sortPreset, setSortPreset] = useState<SortPreset>('default');

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredData = useMemo(() => {
    if (!normalizedQuery) {
      return data;
    }
    return data.filter((item) =>
      item.productCode.toLowerCase().includes(normalizedQuery)
      || (item.productName || '').toLowerCase().includes(normalizedQuery),
    );
  }, [data, normalizedQuery]);

  const abcGrades = useMemo(() => {
    const totalSalesSum = data.reduce((sum, item) => sum + item.totalSales, 0) || 1;
    const sortedBySales = [...data].sort((a, b) => b.totalSales - a.totalSales);
    let cumulative = 0;
    const gradeMap = new Map<string, AbcGrade>();
    sortedBySales.forEach((item) => {
      cumulative += item.totalSales;
      const ratio = cumulative / totalSalesSum;
      const grade: AbcGrade = ratio <= 0.7 ? 'A' : ratio <= 0.9 ? 'B' : 'C';
      gradeMap.set(item.productCode, grade);
    });
    return gradeMap;
  }, [data]);

  const abcFilteredData = useMemo(() => {
    if (abcFilter === 'all') return filteredData;
    return filteredData.filter((item) => abcGrades.get(item.productCode) === abcFilter);
  }, [abcFilter, filteredData, abcGrades]);

  const sortedData = useMemo(() => {
    const sorted = [...abcFilteredData];
    const directionFactor = sortDirection === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * directionFactor;
      }

      return (Number(aValue) - Number(bValue)) * directionFactor;
    });

    return sorted;
  }, [abcFilteredData, sortDirection, sortKey]);

  useEffect(() => {
    if (sortPreset === 'default') return;
    if (sortPreset === 'shortage') {
      setSortKey('gap');
      setSortDirection('asc');
    }
    if (sortPreset === 'sales') {
      setSortKey('totalSales');
      setSortDirection('desc');
    }
  }, [sortPreset]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  const renderSortLabel = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="inline-flex items-center gap-1 hover:text-gray-700"
      aria-sort={
        sortKey === key
          ? sortDirection === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
    >
      <span>{label}</span>
      {sortKey === key ? (
        <span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>
      ) : null}
    </button>
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        등록된 재고가 없습니다. 업로드 페이지에서 초기 데이터를 추가해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-6 py-4 border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">검색</p>
          <p className="text-sm text-gray-500">제품코드/제품명 기준으로 필터링됩니다.</p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">정렬 프리셋</label>
            <select
              value={sortPreset}
              onChange={(event) => setSortPreset(event.target.value as SortPreset)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="default">기본</option>
              <option value="shortage">재고 부족순</option>
              <option value="sales">판매량순</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ABC 등급</label>
            <select
              value={abcFilter}
              onChange={(event) => setAbcFilter(event.target.value as AbcGrade | 'all')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="all">전체</option>
              <option value="A">A (상위 70%)</option>
              <option value="B">B (다음 20%)</option>
              <option value="C">C (하위 10%)</option>
            </select>
          </div>
        </div>
        <div className="w-full sm:w-72">
          <label className="sr-only" htmlFor="product-search">
            제품코드 검색
          </label>
          <input
            id="product-search"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="예: SKU-001"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortLabel('제품코드', 'productCode')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortLabel('제품명', 'productName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortLabel('초기재고', 'initialStock')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortLabel('목표재고', 'targetStock')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortLabel('총입고', 'totalIncoming')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortLabel('총판매', 'totalSales')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortLabel('현재재고', 'currentStock')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {renderSortLabel('과부족', 'gap')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length > 0 ? (
              sortedData.map((item) => (
                <tr key={item.productCode} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.productCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.productName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.initialStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.targetStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    +{item.totalIncoming}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">
                    -{item.totalSales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    <span className={item.gap < 0 ? 'text-red-600' : 'text-green-600'}>
                      {item.gap > 0 ? `+${item.gap}` : item.gap}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
