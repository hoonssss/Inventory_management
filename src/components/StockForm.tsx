'use client';

import { useState, useEffect } from 'react';
import { StockItem } from '@/types/stock';

interface StockFormProps {
  editItem?: StockItem | null;
  onSubmit: (item: StockItem) => void;
  onCancel?: () => void;
}

export default function StockForm({ editItem, onSubmit, onCancel }: StockFormProps) {
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState<number>(0);

  useEffect(() => {
    if (editItem) {
      setProductId(editItem.productId);
      setProductName(editItem.productName);
      setCategory(editItem.category);
      setStock(editItem.stock);
    } else {
      resetForm();
    }
  }, [editItem]);

  const resetForm = () => {
    setProductId('');
    setProductName('');
    setCategory('');
    setStock(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId.trim() || !productName.trim() || !category.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (stock < 0) {
      alert('재고 수량은 0 이상이어야 합니다.');
      return;
    }

    onSubmit({
      productId: productId.trim(),
      productName: productName.trim(),
      category: category.trim(),
      stock,
      updatedAt: new Date().toISOString().split('T')[0],
    });

    if (!editItem) resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        {editItem ? '재고 수정' : '재고 추가'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품 ID
          </label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={!!editItem}
            placeholder="예: PROD-001"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            상품명
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="예: 에티오피아 예가체프"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="예: 원두"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            재고 수량
          </label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {editItem ? '수정 완료' : '추가'}
        </button>
        {editItem && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
