'use client';

import { getStockData } from '@/lib/storage';
import { exportToExcel } from '@/lib/excel';

export default function ExportExcel() {
  const handleExport = () => {
    const data = getStockData();
    if (data.length === 0) {
      alert('내보낼 재고 데이터가 없습니다.');
      return;
    }
    exportToExcel(data);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      엑셀로 내보내기 (.xlsx)
    </button>
  );
}
