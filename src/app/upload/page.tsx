'use client';

import { useState } from 'react';
import UploadExcel from '@/components/UploadExcel';
import UploadJson from '@/components/UploadJson';
import { calculateStockSummary, getUploadHistory } from '@/lib/storage';
import StockTable from '@/components/StockTable';
import { StockSummary, UploadHistoryRecord } from '@/types/stock';

export default function UploadPage() {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<UploadHistoryRecord[]>([]);

  const handleUploadComplete = async () => {
    const [summaryData, historyData] = await Promise.all([
      calculateStockSummary(),
      getUploadHistory(),
    ]);
    setSummary(summaryData);
    setHistory(historyData.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).slice(0, 10));
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">데이터 업로드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UploadExcel onUploadComplete={handleUploadComplete} />
        <UploadJson onUploadComplete={handleUploadComplete} />
      </div>

      {showPreview && history.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">최근 업로드 이력 (JSON/Excel)</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {history.map((item, idx) => (
              <li key={`${item.uploadedAt}-${item.source}-${idx}`} className="border-b last:border-b-0 pb-2">
                {new Date(item.uploadedAt).toLocaleString('ko-KR')} · {item.source.toUpperCase()} · {item.type} · {item.count}건
                {item.mode ? ` · ${item.mode === 'merge' ? '병합' : '덮어쓰기'}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

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
