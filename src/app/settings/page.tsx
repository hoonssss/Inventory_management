'use client';

import { useEffect, useState } from 'react';
import { getProducts, setProducts, clearAllData } from '@/lib/storage';
import { Product } from '@/types/stock';
import StockForm from '@/components/StockForm';

export default function SettingsPage() {
  const [products, setLocalProducts] = useState<Product[]>([]);
  const [editItem, setEditItem] = useState<Product | null>(null);

  useEffect(() => {
    setLocalProducts(getProducts());
  }, []);

  const refresh = () => {
    setLocalProducts(getProducts());
  };

  const handleSubmit = (item: Product) => {
    const current = getProducts();
    const existingIndex = current.findIndex((p) => p.productCode === item.productCode);

    if (editItem) {
      current[existingIndex] = item;
      setProducts(current);
      setEditItem(null);
    } else {
      if (existingIndex !== -1) {
        alert('이미 존재하는 제품코드입니다. 수정 버튼을 이용해주세요.');
        return;
      }
      current.push(item);
      setProducts(current);
    }

    refresh();
  };

  const handleEdit = (product: Product) => {
    setEditItem(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (productCode: string) => {
    if (!confirm('정말 이 제품을 삭제하시겠습니까?')) return;
    const updated = products.filter((p) => p.productCode !== productCode);
    setProducts(updated);
    refresh();
    if (editItem?.productCode === productCode) setEditItem(null);
  };

  const handleClearAll = () => {
    if (!confirm('모든 데이터(제품/판매/입고)를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    clearAllData();
    setEditItem(null);
    refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">재고 설정</h1>

      <StockForm
        editItem={editItem}
        onSubmit={handleSubmit}
        onCancel={() => setEditItem(null)}
      />

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">제품 목록 (초기 데이터)</h2>
            <p className="text-sm text-gray-500">총 {products.length}개 제품</p>
          </div>
          {products.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              전체 초기화
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">등록된 제품이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품코드</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">목표재고</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p.productCode} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.productCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.targetStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                      <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-900">수정</button>
                      <button onClick={() => handleDelete(p.productCode)} className="text-red-600 hover:text-red-900">삭제</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
