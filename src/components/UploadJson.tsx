'use client';

import { useState, useRef } from 'react';
import { getProducts, setProducts, addSalesRecords, addIncomingRecords, mergeProductMaster } from '@/lib/storage';
import { Product, SalesRecord, IncomingRecord } from '@/types/stock';

interface UploadJsonProps {
  onUploadComplete: () => void;
}

type UploadType = 'products' | 'productMaster' | 'sales' | 'incoming';

const uploadConfig = {
  products: { label: '초기 데이터', desc: '{ productCode, productName, stock, targetStock }' },
  productMaster: { label: '제품 마스터', desc: '{ productCode, productName }' },
  sales: { label: '판매내역', desc: '{ orderTime, productId, orderQuantity }' },
  incoming: { label: '입고내역', desc: '{ incomingDate, productCode, quantity }' },
};

export default function UploadJson({ onUploadComplete }: UploadJsonProps) {
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState<UploadType>('products');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          setMessage('유효한 JSON 배열 데이터가 없습니다.');
          setIsError(true);
          return;
        }

        if (activeTab === 'products') {
          setProducts(jsonData as Product[]);
        } else if (activeTab === 'productMaster') {
          const data = (jsonData as Product[]).map((item) => ({
            productCode: String(item.productCode || ''),
            productName: String(item.productName || ''),
            stock: 0,
            targetStock: 0,
            memo: '',
          }));
          setProducts(mergeProductMaster(getProducts(), data));
        } else if (activeTab === 'sales') {
          addSalesRecords(jsonData as SalesRecord[]);
        } else {
          addIncomingRecords(jsonData as IncomingRecord[]);
        }

        setMessage(`${jsonData.length}건이 처리되었습니다.`);
        setIsError(false);
        onUploadComplete();
      } catch {
        setMessage('JSON 파일 파싱 중 오류가 발생했습니다.');
        setIsError(true);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const config = uploadConfig[activeTab];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 dark:text-white">JSON 업로드 (.json)</h3>

      <div className="flex flex-wrap border-b dark:border-gray-600 mb-4">
        {(Object.keys(uploadConfig) as UploadType[]).map((key) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setMessage(''); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-green-600 text-green-600 dark:text-green-400 dark:border-green-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {uploadConfig[key].label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        배열 형식: [{config.desc}]
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-900/30 dark:file:text-green-400 dark:hover:file:bg-green-900/50"
      />

      {message && (
        <p className={`mt-3 text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
