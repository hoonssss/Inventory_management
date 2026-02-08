'use client';

import { useEffect, useState } from 'react';
import { getStockData, setStockData, addTransactionLog, clearAllData } from '@/lib/storage';
import { StockItem } from '@/types/stock';
import StockForm from '@/components/StockForm';
import StockTable from '@/components/StockTable';

export default function SettingsPage() {
  const [stockData, setLocalStock] = useState<StockItem[]>([]);
  const [editItem, setEditItem] = useState<StockItem | null>(null);

  useEffect(() => {
    setLocalStock(getStockData());
  }, []);

  const refresh = () => {
    setLocalStock(getStockData());
  };

  const handleSubmit = (item: StockItem) => {
    const current = getStockData();
    const existingIndex = current.findIndex((s) => s.productId === item.productId);

    if (editItem) {
      // 수정
      const oldItem = current[existingIndex];
      const diff = item.stock - oldItem.stock;
      current[existingIndex] = item;
      setStockData(current);

      if (diff !== 0) {
        addTransactionLog({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          productId: item.productId,
          productName: item.productName,
          category: item.category,
          quantity: Math.abs(diff),
          type: diff > 0 ? 'IN' : 'OUT',
          date: item.updatedAt,
        });
      }

      setEditItem(null);
    } else {
      // 추가
      if (existingIndex !== -1) {
        alert('이미 존재하는 상품 ID입니다. 수정 버튼을 이용해주세요.');
        return;
      }
      current.push(item);
      setStockData(current);

      addTransactionLog({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        productId: item.productId,
        productName: item.productName,
        category: item.category,
        quantity: item.stock,
        type: 'IN',
        date: item.updatedAt,
      });
    }

    refresh();
  };

  const handleEdit = (item: StockItem) => {
    setEditItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (productId: string) => {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    const updated = stockData.filter((item) => item.productId !== productId);
    setStockData(updated);
    refresh();
    if (editItem?.productId === productId) setEditItem(null);
  };

  const handleClearAll = () => {
    if (!confirm('모든 재고 데이터와 거래 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    clearAllData();
    setEditItem(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">재고 설정</h1>

      {/* Stock Form */}
      <StockForm
        editItem={editItem}
        onSubmit={handleSubmit}
        onCancel={() => setEditItem(null)}
      />

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">재고 목록</h2>
            <p className="text-sm text-gray-500">총 {stockData.length}개 상품</p>
          </div>
          {stockData.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              전체 초기화
            </button>
          )}
        </div>
        <StockTable data={stockData} onEdit={handleEdit} onDelete={handleDelete} />
      </div>
    </div>
  );
}
