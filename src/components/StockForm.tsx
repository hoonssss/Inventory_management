'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/stock';

interface StockFormProps {
  editItem?: Product | null;
  onSubmit: (item: Product) => void;
  onCancel?: () => void;
}

export default function StockForm({ editItem, onSubmit, onCancel }: StockFormProps) {
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [stock, setStock] = useState<number>(0);
  const [targetStock, setTargetStock] = useState<number>(0);
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (editItem) {
      setProductCode(editItem.productCode);
      setProductName(editItem.productName || '');
      setStock(editItem.stock);
      setTargetStock(editItem.targetStock);
      setMemo(editItem.memo || '');
    } else {
      resetForm();
    }
  }, [editItem]);

  const resetForm = () => {
    setProductCode('');
    setProductName('');
    setStock(0);
    setTargetStock(0);
    setMemo('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productCode.trim()) {
      alert('제품코드를 입력해주세요.');
      return;
    }

    onSubmit({
      productCode: productCode.trim(),
      productName: productName.trim(),
      stock,
      targetStock,
      memo: memo.trim(),
    });

    if (!editItem) resetForm();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        {editItem ? '제품 수정' : '제품 추가'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제품코드</label>
          <input
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            disabled={!!editItem}
            placeholder="예: PROD-001"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제품명</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="예: 샘플 제품"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">목표재고</label>
          <input
            type="number"
            value={targetStock}
            onChange={(e) => setTargetStock(Number(e.target.value))}
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="거래처 정보, 특이사항 등"
            rows={2}
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
