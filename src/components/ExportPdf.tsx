'use client';

import { calculateStockSummary } from '@/lib/storage';
import { exportSummaryToPdf } from '@/lib/pdf';

export default function ExportPdf() {
  const handleExport = () => {
    const data = calculateStockSummary();
    if (data.length === 0) {
      alert('내보낼 재고 데이터가 없습니다.');
      return;
    }
    exportSummaryToPdf(data);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
    >
      재고현황 PDF 내보내기
    </button>
  );
}
