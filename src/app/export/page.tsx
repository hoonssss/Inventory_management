'use client';

import { useEffect, useRef, useState } from 'react';
import ExportExcel from '@/components/ExportExcel';
import ExportJson from '@/components/ExportJson';
import ExportPdf from '@/components/ExportPdf';
import { calculateStockSummary, exportFullBackup, importFullBackup } from '@/lib/storage';
import StockTable from '@/components/StockTable';
import { StockSummary } from '@/types/stock';

export default function ExportPage() {
  const [summary, setSummary] = useState<StockSummary[]>([]);
  const [backupMsg, setBackupMsg] = useState('');
  const restoreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSummary(calculateStockSummary());
  }, []);

  const handleBackup = () => {
    const json = exportFullBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `재고관리_백업_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMsg('백업 파일이 다운로드되었습니다.');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = importFullBackup(ev.target?.result as string);
        setBackupMsg(`복원 완료: 제품 ${result.products}건, 판매 ${result.sales}건, 입고 ${result.incoming}건`);
        setSummary(calculateStockSummary());
      } catch {
        setBackupMsg('백업 파일 형식이 올바르지 않습니다.');
      }
    };
    reader.readAsText(file);
    if (restoreRef.current) restoreRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">데이터 내보내기</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">엑셀 (.xlsx)</h3>
          <ExportExcel />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">JSON (.json)</h3>
          <ExportJson />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">PDF (.pdf)</h3>
          <ExportPdf />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">전체 백업/복원</h3>
          <div className="space-y-3">
            <button
              onClick={handleBackup}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              전체 백업 다운로드
            </button>
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-gray-400">백업 파일로 복원:</span>
              <input
                ref={restoreRef}
                type="file"
                accept=".json"
                onChange={handleRestore}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </label>
            {backupMsg && <p className="text-sm text-green-600">{backupMsg}</p>}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">현재 재고 현황 (미리보기)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">총 {summary.length}개 제품</p>
        </div>
        <StockTable data={summary} />
      </div>
    </div>
  );
}
