'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProducts, getSalesRecords, getIncomingRecords, calculateStockSummary, updateProductMemo } from '@/lib/storage';
import { Product, SalesRecord, IncomingRecord, StockSummary } from '@/types/stock';

interface TimelineEvent {
  date: string;
  type: 'incoming' | 'sales';
  quantity: number;
}

export default function ProductDetailPage() {
  const [products, setProductsList] = useState<Product[]>([]);
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [incoming, setIncoming] = useState<IncomingRecord[]>([]);
  const [summaries, setSummaries] = useState<StockSummary[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [memoDraft, setMemoDraft] = useState('');

  useEffect(() => {
    const load = async () => {
      const [productData, salesData, incomingData, summaryData] = await Promise.all([
        getProducts(),
        getSalesRecords(),
        getIncomingRecords(),
        calculateStockSummary(),
      ]);
      setProductsList(productData);
      setSales(salesData);
      setIncoming(incomingData);
      setSummaries(summaryData);
      if (productData.length > 0) setSelectedCode(productData[0].productCode);
    };
    void load();
  }, []);

  const selectedProduct = products.find((p) => p.productCode === selectedCode);
  const summary = summaries.find((s) => s.productCode === selectedCode);

  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];
    incoming
      .filter((r) => r.productCode === selectedCode)
      .forEach((r) => events.push({ date: r.incomingDate, type: 'incoming', quantity: r.quantity }));
    sales
      .filter((r) => r.productId === selectedCode)
      .forEach((r) => events.push({ date: r.orderTime, type: 'sales', quantity: r.orderQuantity }));
    events.sort((a, b) => a.date.localeCompare(b.date));
    return events;
  }, [selectedCode, incoming, sales]);

  // 재고 회전율 = 총판매 / 평균재고 (간이 계산: 평균재고 = (초기 + 현재) / 2)
  const turnoverRate = useMemo(() => {
    if (!summary) return null;
    const avgStock = (summary.initialStock + summary.currentStock) / 2;
    if (avgStock <= 0) return null;
    return summary.totalSales / avgStock;
  }, [summary]);

  useEffect(() => {
    setMemoDraft(selectedProduct?.memo || '');
  }, [selectedProduct]);

  const handleMemoSave = async () => {
    if (!selectedProduct) return;
    await updateProductMemo(selectedProduct.productCode, memoDraft.trim());
    const productData = await getProducts();
    setProductsList(productData);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">제품 상세</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">제품 선택</label>
        <select
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
          className="w-full md:w-80 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
        >
          {products.map((p) => (
            <option key={p.productCode} value={p.productCode}>
              {p.productCode} {p.productName ? `(${p.productName})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && summary && (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">초기재고</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{summary.initialStock}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">총입고</p>
              <p className="text-xl font-bold text-green-600">+{summary.totalIncoming}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">총판매</p>
              <p className="text-xl font-bold text-orange-500">-{summary.totalSales}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">현재재고</p>
              <p className="text-xl font-bold text-blue-600">{summary.currentStock}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">재고 회전율</p>
              <p className="text-xl font-bold text-purple-600">{turnoverRate !== null ? turnoverRate.toFixed(2) : '-'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">제품 메모</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              거래처 정보, 특이사항 등 참고 메모를 저장하세요.
            </p>
            <textarea
              value={memoDraft}
              onChange={(e) => setMemoDraft(e.target.value)}
              rows={4}
              placeholder="메모를 입력하세요."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            />
            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={handleMemoSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                메모 저장
              </button>
            </div>
          </div>

          {/* 타임라인 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">입고/판매 타임라인</h2>
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">거래 기록이 없습니다.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {timeline.map((event, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${event.type === 'incoming' ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-36 shrink-0">{event.date}</span>
                    <span className={`text-sm font-medium ${event.type === 'incoming' ? 'text-green-600' : 'text-orange-600'}`}>
                      {event.type === 'incoming' ? `+${event.quantity} 입고` : `-${event.quantity} 판매`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">등록된 제품이 없습니다.</div>
      )}
    </div>
  );
}
