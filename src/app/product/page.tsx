'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProducts, getSalesRecords, getIncomingRecords, calculateStockSummary, updateProductMemo } from '@/lib/storage';
import { Product, SalesRecord, IncomingRecord, StockSummary } from '@/types/stock';
import { getOrderQuantity, normalizeSalesChannel } from '@/lib/sales';

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
  const [searchKeyword, setSearchKeyword] = useState('');
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
      const codeFromQuery = new URLSearchParams(window.location.search).get('code');
      if (codeFromQuery && productData.some((item) => item.productCode === codeFromQuery)) {
        setSelectedCode(codeFromQuery);
      } else if (productData.length > 0) {
        setSelectedCode(productData[0].productCode);
      }
    };
    void load();
  }, []);

  const selectedProduct = products.find((p) => p.productCode === selectedCode);
  const summary = summaries.find((s) => s.productCode === selectedCode);
  const filteredProducts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) => (
      product.productCode.toLowerCase().includes(keyword)
      || (product.productName || '').toLowerCase().includes(keyword)
    ));
  }, [products, searchKeyword]);

  useEffect(() => {
    if (filteredProducts.length === 0) return;
    const selectedInList = filteredProducts.some((product) => product.productCode === selectedCode);
    if (!selectedInList) {
      setSelectedCode(filteredProducts[0].productCode);
    }
  }, [filteredProducts, selectedCode]);

  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];
    incoming
      .filter((r) => r.productCode === selectedCode)
      .forEach((r) => events.push({ date: r.incomingDate, type: 'incoming', quantity: r.quantity }));
    sales
      .filter((r) => r.productId === selectedCode)
      .forEach((r) => events.push({ date: r.orderTime, type: 'sales', quantity: normalizeSalesChannel(r.channel) === '반품' ? getOrderQuantity(r) : -getOrderQuantity(r) }));
    events.sort((a, b) => a.date.localeCompare(b.date));
    return events;
  }, [selectedCode, incoming, sales]);

  const returnRecords = useMemo(() => (
    sales
      .filter((record) => record.productId === selectedCode)
      .filter((record) => normalizeSalesChannel(record.channel) === '반품')
      .sort((a, b) => a.orderTime.localeCompare(b.orderTime))
  ), [sales, selectedCode]);

  const totalReturnQuantity = useMemo(() => (
    returnRecords.reduce((sum, record) => sum + getOrderQuantity(record), 0)
  ), [returnRecords]);

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
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="코드 또는 제품명으로 검색"
          className="mb-3 w-full md:w-80 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
        />
        <select
          value={selectedCode}
          onChange={(e) => setSelectedCode(e.target.value)}
          className="w-full md:w-80 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
          disabled={filteredProducts.length === 0}
        >
          {filteredProducts.map((p) => (
            <option key={p.productCode} value={p.productCode}>
              {p.productCode} {p.productName ? `(${p.productName})` : ''}
            </option>
          ))}
        </select>
        {filteredProducts.length === 0 && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</p>
        )}
      </div>

      {selectedProduct && summary && (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
              <p className="text-xs text-gray-500 dark:text-gray-400">총반품</p>
              <p className="text-xl font-bold text-sky-600">+{summary.totalReturns}</p>
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
                    <span className={`text-sm font-medium ${event.type === 'incoming' || event.quantity > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {event.type === 'incoming' ? `+${event.quantity} 입고` : event.quantity > 0 ? `+${Math.abs(event.quantity)} 반품` : `-${Math.abs(event.quantity)} 판매`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 반품 상세 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-white">반품 정보</h2>
              <span className="text-sm font-medium text-sky-600">총 {totalReturnQuantity}개</span>
            </div>
            {returnRecords.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">반품 이력이 없습니다.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {returnRecords.map((record, index) => (
                  <div key={`${record.orderTime}-${index}`} className="flex items-center justify-between rounded-md border border-sky-100 bg-sky-50/50 px-3 py-2 text-sm dark:border-sky-500/30 dark:bg-sky-500/10">
                    <span className="text-gray-600 dark:text-gray-200">{record.orderTime}</span>
                    <span className="font-semibold text-sky-700 dark:text-sky-200">+{getOrderQuantity(record)} 반품</span>
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
