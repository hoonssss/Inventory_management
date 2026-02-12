'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSalesRecords, getIncomingRecords, getProducts, deleteSalesRecord, deleteIncomingRecord } from '@/lib/storage';
import { SalesRecord, IncomingRecord, Product } from '@/types/stock';
import { getOrderQuantity, normalizeSalesChannel } from '@/lib/sales';

type Tab = 'sales' | 'incoming';

export default function RecordsPage() {
  const [tab, setTab] = useState<Tab>('sales');
  const [sales, setSales] = useState<SalesRecord[]>([]);
  const [incoming, setIncoming] = useState<IncomingRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  const refresh = async () => {
    const [salesData, incomingData, productsData] = await Promise.all([
      getSalesRecords(),
      getIncomingRecords(),
      getProducts(),
    ]);
    setSales(salesData);
    setIncoming(incomingData);
    setProducts(productsData);
  };

  const productNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => {
      map.set(product.productCode.toLowerCase(), product.productName);
    });
    return map;
  }, [products]);

  const getProductName = (code: string) => productNameByCode.get(code.toLowerCase()) || '미등록 제품';

  useEffect(() => {
    void refresh();
  }, []);

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((r) => {
      const productCode = r.productId.toLowerCase();
      const productName = (productNameByCode.get(productCode) || '').toLowerCase();
      const channel = normalizeSalesChannel(r.channel).toLowerCase();
      return productCode.includes(q) || productName.includes(q) || r.orderTime.includes(q) || channel.includes(q);
    });
  }, [sales, search, productNameByCode]);

  const filteredIncoming = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return incoming;
    return incoming.filter((r) => {
      const productCode = r.productCode.toLowerCase();
      const productName = (productNameByCode.get(productCode) || '').toLowerCase();
      return productCode.includes(q) || productName.includes(q) || r.incomingDate.includes(q);
    });
  }, [incoming, search, productNameByCode]);

  const handleDeleteSale = async (idx: number) => {
    if (!confirm('이 판매 건을 삭제하시겠습니까?')) return;
    // idx is the index in filtered list; find original index
    const original = sales.indexOf(filteredSales[idx]);
    if (original === -1) return;
    await deleteSalesRecord(original);
    await refresh();
  };

  const handleDeleteIncoming = async (idx: number) => {
    if (!confirm('이 입고 건을 삭제하시겠습니까?')) return;
    const original = incoming.indexOf(filteredIncoming[idx]);
    if (original === -1) return;
    await deleteIncomingRecord(original);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">거래 내역 조회</h1>

      <div className="flex flex-wrap gap-2 border-b dark:border-gray-700 pb-0">
        <button
          onClick={() => setTab('sales')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'sales' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
        >
          판매내역 ({sales.length})
        </button>
        <button
          onClick={() => setTab('incoming')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'incoming' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
        >
          입고내역 ({incoming.length})
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="제품코드/제품명 또는 날짜 검색"
        className="w-full md:w-96 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {tab === 'sales' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">주문시간</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">제품ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">제품명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">구분</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">주문수량</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">데이터 없음</td></tr>
              ) : filteredSales.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{i + 1}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{r.orderTime}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{r.productId}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{getProductName(r.productId)}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{normalizeSalesChannel(r.channel)}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{getOrderQuantity(r)}</td>
                  <td className="px-6 py-3"><button onClick={() => handleDeleteSale(i)} className="text-red-600 hover:text-red-800 text-sm">삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">입고일자</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">제품코드</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">제품명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">수량</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">삭제</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredIncoming.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">데이터 없음</td></tr>
              ) : filteredIncoming.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{i + 1}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{r.incomingDate}</td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{r.productCode}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{getProductName(r.productCode)}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{r.quantity}</td>
                  <td className="px-6 py-3"><button onClick={() => handleDeleteIncoming(i)} className="text-red-600 hover:text-red-800 text-sm">삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
