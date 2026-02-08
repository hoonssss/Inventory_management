'use client';

import { calculateStockSummary, getSalesRecords, getIncomingRecords } from '@/lib/storage';
import { exportSummaryToExcel, exportSalesToExcel, exportIncomingToExcel } from '@/lib/excel';

export default function ExportExcel() {
  const handleExportSummary = () => {
    const data = calculateStockSummary();
    if (data.length === 0) { alert('내보낼 재고 데이터가 없습니다.'); return; }
    exportSummaryToExcel(data);
  };

  const handleExportSales = () => {
    const data = getSalesRecords();
    if (data.length === 0) { alert('내보낼 판매 데이터가 없습니다.'); return; }
    exportSalesToExcel(data);
  };

  const handleExportIncoming = () => {
    const data = getIncomingRecords();
    if (data.length === 0) { alert('내보낼 입고 데이터가 없습니다.'); return; }
    exportIncomingToExcel(data);
  };

  return (
    <div className="space-y-3">
      <button onClick={handleExportSummary} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
        재고현황 내보내기
      </button>
      <button onClick={handleExportSales} className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
        판매내역 내보내기
      </button>
      <button onClick={handleExportIncoming} className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
        입고내역 내보내기
      </button>
    </div>
  );
}
