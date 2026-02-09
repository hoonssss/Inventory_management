'use client';

import { calculateStockSummary, getSalesRecords, getIncomingRecords } from '@/lib/storage';

function downloadJson(data: unknown, filename: string) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ExportJson() {
  const handleExportSummary = async () => {
    const data = await calculateStockSummary();
    if (data.length === 0) { alert('내보낼 재고 데이터가 없습니다.'); return; }
    downloadJson(data, '재고현황.json');
  };

  const handleExportSales = async () => {
    const data = await getSalesRecords();
    if (data.length === 0) { alert('내보낼 판매 데이터가 없습니다.'); return; }
    downloadJson(data, '판매내역.json');
  };

  const handleExportIncoming = async () => {
    const data = await getIncomingRecords();
    if (data.length === 0) { alert('내보낼 입고 데이터가 없습니다.'); return; }
    downloadJson(data, '입고내역.json');
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
