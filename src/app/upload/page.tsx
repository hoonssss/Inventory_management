'use client';

import { useState } from 'react';
import UploadExcel from '@/components/UploadExcel';
import UploadJson from '@/components/UploadJson';
import { getStockData } from '@/lib/storage';
import StockTable from '@/components/StockTable';
import { StockItem } from '@/types/stock';

export default function UploadPage() {
  const [stockData, setLocalStock] = useState<StockItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleUploadComplete = () => {
    const data = getStockData();
    setLocalStock(data);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 업로드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadExcel onUploadComplete={handleUploadComplete} />
        <UploadJson onUploadComplete={handleUploadComplete} />
      </div>

      {showPreview && stockData.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">업로드 후 재고 현황</h2>
          </div>
          <StockTable data={stockData} />
        </div>
      )}
    </div>
  );
}
