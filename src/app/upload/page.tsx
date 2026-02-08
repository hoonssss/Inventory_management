'use client';

import { useState } from 'react';
import UploadExcel from '@/components/UploadExcel';
import UploadJson from '@/components/UploadJson';
import { calculateStockSummary } from '@/lib/storage';
import StockTable from '@/components/StockTable';
import { StockSummary } from '@/types/stock';

export default function UploadPage() {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleUploadComplete = () => {
    setSummary(calculateStockSummary());
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 업로드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadExcel onUploadComplete={handleUploadComplete} />
        <UploadJson onUploadComplete={handleUploadComplete} />
      </div>

      {showPreview && summary.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">업로드 후 재고 현황</h2>
          </div>
          <StockTable data={summary} />
        </div>
      )}
    </div>
  );
}
