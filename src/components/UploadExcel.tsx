'use client';

import { useState, useRef, useCallback } from 'react';
import {
  parseProductsExcel,
  parseSalesExcel,
  parseIncomingExcel,
  parseWorkbookExcel,
  downloadProductTemplate,
  downloadProductMasterTemplate,
  downloadSalesTemplate,
  downloadIncomingTemplate,
  downloadFullTemplate,
} from '@/lib/excel';
import { getProducts, setProducts, addSalesRecords, addIncomingRecords } from '@/lib/storage';
import { Product } from '@/types/stock';

interface UploadExcelProps {
  onUploadComplete: () => void;
}

type UploadType = 'all' | 'products' | 'productMaster' | 'sales' | 'incoming';
type ProductMode = 'overwrite' | 'merge';

const uploadConfig = {
  all: { label: '전체 업로드', columns: '초기데이터 / 판매내역 / 입고내역 (시트)', template: downloadFullTemplate },
  products: { label: '초기 데이터', columns: '제품코드 / 제품명 / 재고 / 목표재고', template: downloadProductTemplate },
  productMaster: { label: '제품 마스터', columns: '제품코드 / 제품명', template: downloadProductMasterTemplate },
  sales: { label: '판매내역', columns: '주문시간 / 제품ID / 주문수량', template: downloadSalesTemplate },
  incoming: { label: '입고내역', columns: '입고일자 / 제품코드 / 수량', template: downloadIncomingTemplate },
};

function mergeProducts(existing: Product[], incoming: Product[]): Product[] {
  const map = new Map(existing.map((p) => [p.productCode, p]));
  incoming.forEach((p) => map.set(p.productCode, p));
  return Array.from(map.values());
}

function mergeProductMaster(existing: Product[], incoming: Product[]): Product[] {
  const map = new Map(existing.map((p) => [p.productCode, p]));
  incoming.forEach((p) => {
    const current = map.get(p.productCode);
    if (current) {
      map.set(p.productCode, { ...current, productName: p.productName || current.productName });
    } else {
      map.set(p.productCode, { productCode: p.productCode, productName: p.productName || '', stock: 0, targetStock: 0, memo: '' });
    }
  });
  return Array.from(map.values());
}

export default function UploadExcel({ onUploadComplete }: UploadExcelProps) {
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<UploadType>('products');
  const [productMode, setProductMode] = useState<ProductMode>('overwrite');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showsProductMode = activeTab === 'products' || activeTab === 'all';

  const processFile = useCallback(async (file: File) => {
    try {
      let count = 0;

      if (activeTab === 'all') {
        const { products, sales, incoming } = await parseWorkbookExcel(file);
        const totalCount = products.length + sales.length + incoming.length;
        if (totalCount === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        if (products.length > 0) {
          const current = await getProducts();
          await setProducts(productMode === 'merge' ? mergeProducts(current, products) : products);
        }
        if (sales.length > 0) await addSalesRecords(sales);
        if (incoming.length > 0) await addIncomingRecords(incoming);
        count = totalCount;
      } else if (activeTab === 'products') {
        const data = await parseProductsExcel(file);
        if (data.length === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        const current = await getProducts();
        await setProducts(productMode === 'merge' ? mergeProducts(current, data) : data);
        count = data.length;
      } else if (activeTab === 'productMaster') {
        const data = await parseProductsExcel(file);
        if (data.length === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        const current = await getProducts();
        await setProducts(mergeProductMaster(current, data));
        count = data.length;
      } else if (activeTab === 'sales') {
        const data = await parseSalesExcel(file);
        if (data.length === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        await addSalesRecords(data);
        count = data.length;
      } else {
        const data = await parseIncomingExcel(file);
        if (data.length === 0) { setMessage('데이터가 없습니다.'); setIsError(true); return; }
        await addIncomingRecords(data);
        count = data.length;
      }

      setMessage(`${count}건이 처리되었습니다.`);
      setIsError(false);
      onUploadComplete();
    } catch {
      setMessage('엑셀 파일 처리 중 오류가 발생했습니다.');
      setIsError(true);
    }
  }, [activeTab, productMode, onUploadComplete]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      await processFile(file);
    } else {
      setMessage('.xlsx 또는 .xls 파일만 업로드 가능합니다.');
      setIsError(true);
    }
  }, [processFile]);

  const config = uploadConfig[activeTab];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">엑셀 업로드 (.xlsx)</h3>

      <div className="flex flex-wrap border-b dark:border-gray-600 mb-4">
        {(Object.keys(uploadConfig) as UploadType[]).map((key) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setMessage(''); }}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {uploadConfig[key].label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        컬럼: <span className="font-medium">{config.columns}</span>
      </p>

      <button
        onClick={config.template}
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 underline mb-4 block"
      >
        템플릿 다운로드
      </button>

      {showsProductMode && (
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400 font-medium">초기데이터 처리:</span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="productMode" checked={productMode === 'overwrite'} onChange={() => setProductMode('overwrite')} className="accent-blue-600" />
            <span className="text-gray-700 dark:text-gray-300">덮어쓰기</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="productMode" checked={productMode === 'merge'} onChange={() => setProductMode('merge')} className="accent-blue-600" />
            <span className="text-gray-700 dark:text-gray-300">병합</span>
          </label>
        </div>
      )}

      {/* 드래그앤드롭 영역 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {dragging ? '여기에 파일을 놓으세요' : '클릭하거나 파일을 드래그하여 업로드'}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">.xlsx, .xls</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
      />

      {message && (
        <p className={`mt-3 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
