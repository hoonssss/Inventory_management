'use client';

import { useEffect, useState } from 'react';
import ExportExcel from '@/components/ExportExcel';
import ExportJson from '@/components/ExportJson';
import ExportPdf from '@/components/ExportPdf';
import { getStockData } from '@/lib/storage';
import StockTable from '@/components/StockTable';
import { StockItem } from '@/types/stock';

export default function ExportPage() {
  const [stockData, setLocalStock] = useState<StockItem[]>([]);

  useEffect(() => {
    setLocalStock(getStockData());
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 내보내기</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">엑셀 내보내기</h3>
          <p className="text-sm text-gray-500 mb-4">
            현재 재고 데이터를 엑셀 파일로 다운로드합니다.
          </p>
          <ExportExcel />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">JSON 내보내기</h3>
          <p className="text-sm text-gray-500 mb-4">
            현재 재고 데이터를 JSON 파일로 다운로드합니다.
          </p>
          <ExportJson />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">PDF 내보내기</h3>
          <p className="text-sm text-gray-500 mb-4">
            재고 현황 리포트를 PDF로 다운로드합니다.
          </p>
          <ExportPdf />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">현재 재고 현황 (미리보기)</h2>
          <p className="text-sm text-gray-500">총 {stockData.length}개 상품</p>
        </div>
        <StockTable data={stockData} />
      </div>
    </div>
  );
}
