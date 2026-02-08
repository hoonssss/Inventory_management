'use client';

import { useEffect, useState } from 'react';
import ExportExcel from '@/components/ExportExcel';
import ExportJson from '@/components/ExportJson';
import ExportPdf from '@/components/ExportPdf';
import { calculateStockSummary } from '@/lib/storage';
import StockTable from '@/components/StockTable';
import { StockSummary } from '@/types/stock';

export default function ExportPage() {
  const [summary, setSummary] = useState<StockSummary[]>([]);

  useEffect(() => {
    setSummary(calculateStockSummary());
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 내보내기</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">엑셀 (.xlsx)</h3>
          <ExportExcel />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">JSON (.json)</h3>
          <ExportJson />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">PDF (.pdf)</h3>
          <ExportPdf />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">현재 재고 현황 (미리보기)</h2>
          <p className="text-sm text-gray-500">총 {summary.length}개 제품</p>
        </div>
        <StockTable data={summary} />
      </div>
    </div>
  );
}
