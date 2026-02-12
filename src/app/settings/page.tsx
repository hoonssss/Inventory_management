'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProducts, setProducts, clearAllData, clearSalesRecords, clearIncomingRecords, clearProducts, clearReturnRecords, getSalesRecords, getIncomingRecords } from '@/lib/storage';
import { Product } from '@/types/stock';
import StockForm from '@/components/StockForm';
import { normalizeSalesChannel } from '@/lib/sales';

export default function SettingsPage() {
  const [products, setLocalProducts] = useState<Product[]>([]);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [salesCount, setSalesCount] = useState(0);
  const [incomingCount, setIncomingCount] = useState(0);
  const [returnsCount, setReturnsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [productData, salesData, incomingData] = await Promise.all([
        getProducts(),
        getSalesRecords(),
        getIncomingRecords(),
      ]);
      setLocalProducts(productData);
      setSalesCount(salesData.length);
      setIncomingCount(incomingData.length);
      setReturnsCount(salesData.filter((record) => normalizeSalesChannel(record.channel) === '반품').length);
    };
    void load();
  }, []);

  const refresh = async () => {
    const [productData, salesData, incomingData] = await Promise.all([
      getProducts(),
      getSalesRecords(),
      getIncomingRecords(),
    ]);
    setLocalProducts(productData);
    setSalesCount(salesData.length);
    setIncomingCount(incomingData.length);
    setReturnsCount(salesData.filter((record) => normalizeSalesChannel(record.channel) === '반품').length);
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) =>
      p.productCode.toLowerCase().includes(query)
      || (p.productName || '').toLowerCase().includes(query),
    );
  }, [products, search]);

  const handleSubmit = async (item: Product) => {
    const current = await getProducts();
    const existingIndex = current.findIndex((p) => p.productCode === item.productCode);

    if (editItem) {
      current[existingIndex] = item;
      await setProducts(current);
      setEditItem(null);
    } else {
      if (existingIndex !== -1) {
        alert('이미 존재하는 제품코드입니다. 수정 버튼을 이용해주세요.');
        return;
      }
      current.push(item);
      await setProducts(current);
    }

    await refresh();
  };

  const handleEdit = (product: Product) => {
    setEditItem(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productCode: string) => {
    if (!confirm('정말 이 제품을 삭제하시겠습니까?')) return;
    const updated = products.filter((p) => p.productCode !== productCode);
    await setProducts(updated);
    await refresh();
    if (editItem?.productCode === productCode) setEditItem(null);
  };

  const handleClearAll = async () => {
    if (!confirm('모든 데이터(제품/판매/입고)를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    await clearAllData();
    setEditItem(null);
    await refresh();
  };

  const handleClearSales = async () => {
    if (!confirm(`판매내역 ${salesCount}건을 모두 삭제하시겠습니까?`)) return;
    await clearSalesRecords();
    await refresh();
  };

  const handleClearIncoming = async () => {
    if (!confirm(`입고내역 ${incomingCount}건을 모두 삭제하시겠습니까?`)) return;
    await clearIncomingRecords();
    await refresh();
  };


  const handleClearReturns = async () => {
    if (!confirm(`반품내역 ${returnsCount}건을 모두 삭제하시겠습니까?`)) return;
    await clearReturnRecords();
    await refresh();
  };

  const handleClearProducts = async () => {
    if (!confirm(`제품마스터 ${products.length}건을 모두 삭제하시겠습니까?`)) return;
    await clearProducts();
    setEditItem(null);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">재고 설정</h1>

      <StockForm
        editItem={editItem}
        onSubmit={handleSubmit}
        onCancel={() => setEditItem(null)}
      />

      {/* 데이터 관리 */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">데이터 관리</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleClearSales}
            disabled={salesCount === 0}
            className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            판매내역 초기화 ({salesCount}건)
          </button>
          <button
            onClick={handleClearIncoming}
            disabled={incomingCount === 0}
            className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            입고내역 초기화 ({incomingCount}건)
          </button>
          <button
            onClick={handleClearReturns}
            disabled={returnsCount === 0}
            className="bg-sky-50 text-sky-600 px-4 py-2 rounded-lg hover:bg-sky-100 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            반품내역 초기화 ({returnsCount}건)
          </button>
          <button
            onClick={handleClearProducts}
            disabled={products.length === 0}
            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            제품마스터 초기화 ({products.length}건)
          </button>
          {products.length > 0 && (
            <button
              onClick={handleClearAll}
              className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
            >
              전체 초기화
            </button>
          )}
        </div>
      </div>

      {/* 제품 목록 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">제품 목록 (초기 데이터)</h2>
            <p className="text-sm text-gray-500">총 {products.length}개 제품</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제품코드/제품명 검색"
            className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">등록된 제품이 없습니다.</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">검색 결과가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품코드</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제품명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">목표재고</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">메모</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((p) => (
                  <tr key={p.productCode} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.productCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.productName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.targetStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.memo || '-'}</td>
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
