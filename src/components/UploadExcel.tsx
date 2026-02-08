'use client';

import { useState, useRef } from 'react';
import {
  parseProductsExcel,
  parseSalesExcel,
  parseIncomingExcel,
  parseWorkbookExcel,
  downloadProductTemplate,
  downloadSalesTemplate,
  downloadIncomingTemplate,
  downloadFullTemplate,
} from '@/lib/excel';
import { getProducts, setProducts, addSalesRecords, addIncomingRecords } from '@/lib/storage';
import { Product } from '@/types/stock';

interface UploadExcelProps {
  onUploadComplete: () => void;
}

type UploadType = 'all' | 'products' | 'sales' | 'incoming';
type ProductMode = 'overwrite' | 'merge';

const uploadConfig = {
  all: { label: '전체 업로드', columns: '초기데이터 / 판매내역 / 입고내역 (시트)', template: downloadFullTemplate },
  products: { label: '초기 데이터', columns: '제품코드 / 제품명 / 재고 / 목표재고', template: downloadProductTemplate },
  sales: { label: '판매내역', columns: '주문시간 / 제품ID / 주문수량', template: downloadSalesTemplate },
  incoming: { label: '입고내역', columns: '입고일자 / 제품코드 / 수량', template: downloadIncomingTemplate },
};

function mergeProducts(existing: Product[], incoming: Product[]): Product[] {
  const map = new Map(existing.map((p) => [p.productCode, p]));
  incoming.forEach((p) => map.set(p.productCode, p));
  return Array.from(map.values());
}

export default function UploadExcel({ onUploadComplete }: UploadExcelProps) {
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<UploadType>('products');
  const [productMode, setProductMode] = useState<ProductMode>('overwrite');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showsProductMode = activeTab === 'products' || activeTab === 'all';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let count = 0;

      if (activeTab === 'all') {
        const { products, sales, incoming } = await parseWorkbookExcel(file);
        const totalCount = products.length + sales.length + incoming.length;
        if (totalCount === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        if (products.length > 0) {
          if (productMode === 'merge') {
            setProducts(mergeProducts(getProducts(), products));
          } else {
            setProducts(products);
          }
        }
        if (sales.length > 0) addSalesRecords(sales);
        if (incoming.length > 0) addIncomingRecords(incoming);
        count = totalCount;
      } else if (activeTab === 'products') {
        const data = await parseProductsExcel(file);
        if (data.length === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        if (productMode === 'merge') {
          setProducts(mergeProducts(getProducts(), data));
        } else {
          setProducts(data);
        }
        count = data.length;
      } else if (activeTab === 'sales') {
        const data = await parseSalesExcel(file);
        if (data.length === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        addSalesRecords(data);
        count = data.length;
      } else {
        const data = await parseIncomingExcel(file);
        if (data.length === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        addIncomingRecords(data);
        count = data.length;
      }

      setMessage(`${count}건이 처리되었습니다.`);
      setIsError(false);
      onUploadComplete();
    } catch {
      setMessage('엑셀 파일 처리 중 오류가 발생했습니다.');
      setIsError(true);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const config = uploadConfig[activeTab];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">엑셀 업로드 (.xlsx)</h3>

      <div className="flex flex-wrap border-b mb-4">
        {(Object.keys(uploadConfig) as UploadType[]).map((key) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setMessage(''); }}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {uploadConfig[key].label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-2">
        컬럼: <span className="font-medium">{config.columns}</span>
      </p>

      <button
        onClick={config.template}
        className="text-sm text-blue-600 hover:text-blue-800 underline mb-4 block"
      >
        템플릿 다운로드
      </button>

      {showsProductMode && (
        <div className="flex items-center gap-4 mb-4 text-sm">
          <span className="text-gray-600 font-medium">초기데이터 처리:</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="productMode"
              checked={productMode === 'overwrite'}
              onChange={() => setProductMode('overwrite')}
              className="accent-blue-600"
            />
            <span className="text-gray-700">덮어쓰기</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="productMode"
              checked={productMode === 'merge'}
              onChange={() => setProductMode('merge')}
              className="accent-blue-600"
            />
            <span className="text-gray-700">병합 (기존 유지 + 추가/갱신)</span>
          </label>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      {message && (
        <p className={`mt-3 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
