'use client';

import { useEffect, useState } from 'react';
import { getStockData, setStockData } from '@/lib/storage';
import { StockItem } from '@/types/stock';
import StockTable from '@/components/StockTable';
import Link from 'next/link';

export default function DashboardPage() {
  const [stockData, setLocalStock] = useState<StockItem[]>([]);

  useEffect(() => {
    setLocalStock(getStockData());
  }, []);

  const totalProducts = stockData.length;
  const totalStock = stockData.reduce((sum, item) => sum + item.stock, 0);
  const categories = new Set(stockData.map((item) => item.category)).size;
  const lowStockCount = stockData.filter((item) => item.stock <= 10).length;

  const handleDelete = (productId: string) => {
    const updated = stockData.filter((item) => item.productId !== productId);
    setStockData(updated);
    setLocalStock(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <Link
          href="/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          재고 업로드
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">총 상품 수</p>
          <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">총 재고 수량</p>
          <p className="text-3xl font-bold text-green-600">{totalStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">카테고리 수</p>
          <p className="text-3xl font-bold text-purple-600">{categories}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">재고 부족 (10개 이하)</p>
          <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">재고 현황</h2>
        </div>
        <StockTable data={stockData} onDelete={handleDelete} />
      </div>
    </div>
  );
}
