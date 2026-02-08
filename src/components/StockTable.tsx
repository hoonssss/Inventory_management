'use client';

import { StockSummary } from '@/types/stock';

interface StockTableProps {
  data: StockSummary[];
}

export default function StockTable({ data }: StockTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        등록된 재고가 없습니다. 업로드 페이지에서 초기 데이터를 추가해주세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품코드</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">초기재고</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">목표재고</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총입고</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총판매</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재재고</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">과부족</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.productCode} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productCode}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.initialStock}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.targetStock}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">+{item.totalIncoming}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-medium">-{item.totalSales}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.currentStock}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                <span className={item.gap < 0 ? 'text-red-600' : 'text-green-600'}>
                  {item.gap > 0 ? `+${item.gap}` : item.gap}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
