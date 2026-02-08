'use client';

import { getStockData } from '@/lib/storage';
import { exportToPdf } from '@/lib/pdf';

export default function ExportPdf() {
  const handleExport = () => {
    const data = getStockData();
    if (data.length === 0) {
      alert('내보낼 재고 데이터가 없습니다.');
      return;
    }
    exportToPdf(data);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
    >
      PDF로 내보내기 (.pdf)
    </button>
  );
}
