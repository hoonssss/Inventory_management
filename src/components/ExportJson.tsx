'use client';

import { getStockData } from '@/lib/storage';

export default function ExportJson() {
  const handleExport = () => {
    const data = getStockData();
    if (data.length === 0) {
      alert('내보낼 재고 데이터가 없습니다.');
      return;
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
    >
      JSON으로 내보내기 (.json)
    </button>
  );
}
