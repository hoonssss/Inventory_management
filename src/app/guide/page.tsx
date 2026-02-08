'use client';

import {
  downloadProductTemplate,
  downloadSalesTemplate,
  downloadIncomingTemplate,
  downloadFullTemplate,
} from '@/lib/excel';

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">사용 가이드</h1>

      {/* 재고 계산 로직 */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">재고 계산 방식</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 font-mono text-center text-lg font-bold">
            현재재고 = 입력재고 + 총입고 - 총판매
          </p>
        </div>
        <ul className="text-sm text-gray-700 space-y-2">
          <li><span className="font-medium">입력재고(초기재고)</span> — 사용자가 직접 입력한 기본 재고 수량. 한번 설정하면 유지됩니다.</li>
          <li><span className="font-medium">총입고</span> — 입고내역에서 해당 제품의 입고 수량을 모두 합산한 값</li>
          <li><span className="font-medium">총판매</span> — 판매내역에서 해당 제품의 판매 수량을 모두 합산한 값</li>
          <li><span className="font-medium">과부족(Gap)</span> — 현재재고 - 목표재고 (음수면 재고 부족)</li>
        </ul>
      </section>

      {/* 데이터 형식 */}
      <section className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">데이터 형식</h2>

        {/* 초기 데이터 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800">1. 초기 데이터 (제품 마스터)</h3>
          <div className="overflow-x-auto">
            <table className="text-sm border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">컬럼명</th>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">설명</th>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">예시</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="px-4 py-2 border-b">제품코드</td><td className="px-4 py-2 border-b">고유 제품 식별코드</td><td className="px-4 py-2 border-b text-gray-500">PROD-001</td></tr>
                <tr><td className="px-4 py-2 border-b">제품명</td><td className="px-4 py-2 border-b">제품 이름</td><td className="px-4 py-2 border-b text-gray-500">샘플 제품</td></tr>
                <tr><td className="px-4 py-2 border-b">재고</td><td className="px-4 py-2 border-b">초기 입력 재고 수량</td><td className="px-4 py-2 border-b text-gray-500">100</td></tr>
                <tr><td className="px-4 py-2">목표재고</td><td className="px-4 py-2">유지하고자 하는 목표 수량</td><td className="px-4 py-2 text-gray-500">150</td></tr>
              </tbody>
            </table>
          </div>
          <button onClick={downloadProductTemplate} className="text-sm text-blue-600 hover:text-blue-800 underline">
            초기데이터 템플릿 다운로드
          </button>
        </div>

        {/* 판매내역 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800">2. 판매내역</h3>
          <div className="overflow-x-auto">
            <table className="text-sm border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">컬럼명</th>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">설명</th>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">예시</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="px-4 py-2 border-b">주문시간</td><td className="px-4 py-2 border-b">주문 발생 일시</td><td className="px-4 py-2 border-b text-gray-500">2026-02-08 14:30</td></tr>
                <tr><td className="px-4 py-2 border-b">제품ID</td><td className="px-4 py-2 border-b">초기데이터의 제품코드와 일치</td><td className="px-4 py-2 border-b text-gray-500">PROD-001</td></tr>
                <tr><td className="px-4 py-2">주문수량</td><td className="px-4 py-2">판매된 수량</td><td className="px-4 py-2 text-gray-500">5</td></tr>
              </tbody>
            </table>
          </div>
          <button onClick={downloadSalesTemplate} className="text-sm text-blue-600 hover:text-blue-800 underline">
            판매내역 템플릿 다운로드
          </button>
        </div>

        {/* 입고내역 */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-800">3. 입고내역</h3>
          <div className="overflow-x-auto">
            <table className="text-sm border border-gray-200 rounded">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">컬럼명</th>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">설명</th>
                  <th className="px-4 py-2 text-left border-b font-medium text-gray-600">예시</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="px-4 py-2 border-b">입고일자</td><td className="px-4 py-2 border-b">입고 날짜</td><td className="px-4 py-2 border-b text-gray-500">2026-02-08</td></tr>
                <tr><td className="px-4 py-2 border-b">제품코드</td><td className="px-4 py-2 border-b">초기데이터의 제품코드와 일치</td><td className="px-4 py-2 border-b text-gray-500">PROD-001</td></tr>
                <tr><td className="px-4 py-2">수량</td><td className="px-4 py-2">입고된 수량</td><td className="px-4 py-2 text-gray-500">50</td></tr>
              </tbody>
            </table>
          </div>
          <button onClick={downloadIncomingTemplate} className="text-sm text-blue-600 hover:text-blue-800 underline">
            입고내역 템플릿 다운로드
          </button>
        </div>

        {/* 전체 템플릿 */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-medium text-gray-800">전체 통합 템플릿</h3>
          <p className="text-sm text-gray-600">
            3개 시트(초기데이터, 판매내역, 입고내역)가 하나의 엑셀 파일에 포함된 통합 템플릿입니다.
            업로드 페이지의 &quot;전체 업로드&quot; 탭에서 한번에 업로드할 수 있습니다.
          </p>
          <button onClick={downloadFullTemplate} className="text-sm text-blue-600 hover:text-blue-800 underline">
            전체 통합 템플릿 다운로드
          </button>
        </div>
      </section>

      {/* 사용 순서 */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">사용 순서</h2>
        <ol className="text-sm text-gray-700 space-y-3 list-decimal list-inside">
          <li>
            <span className="font-medium">초기 데이터 등록</span> — 재고설정 페이지에서 수동 입력하거나, 엑셀 템플릿을 다운받아 작성 후 업로드 페이지에서 업로드합니다.
          </li>
          <li>
            <span className="font-medium">판매 / 입고 내역 업로드</span> — 판매, 입고 데이터를 각각 또는 통합 템플릿으로 업로드합니다. 업로드할 때마다 기존 데이터에 누적됩니다.
          </li>
          <li>
            <span className="font-medium">대시보드 확인</span> — 현재재고, 과부족, 월별 입고/판매 추이를 확인합니다. 제품 검색으로 특정 제품만 필터링할 수 있습니다.
          </li>
          <li>
            <span className="font-medium">시각화</span> — 차트 페이지에서 현재재고 vs 목표재고, 입고/판매 추이, 과부족 그래프를 확인합니다.
          </li>
          <li>
            <span className="font-medium">내보내기</span> — 재고현황, 판매내역, 입고내역을 엑셀/JSON/PDF로 내보냅니다.
          </li>
        </ol>
      </section>

      {/* 주의사항 */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">주의사항</h2>
        <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
          <li>모든 데이터는 브라우저 LocalStorage에 저장됩니다. 브라우저 데이터를 삭제하면 모든 데이터가 사라집니다.</li>
          <li>초기 데이터 업로드 시 기존 제품 목록이 <span className="font-medium text-red-600">덮어쓰기</span>됩니다.</li>
          <li>판매/입고 내역은 업로드할 때마다 기존 데이터에 <span className="font-medium text-green-600">누적</span>됩니다.</li>
          <li>판매내역의 &quot;제품ID&quot;와 초기데이터의 &quot;제품코드&quot;가 일치해야 정상적으로 계산됩니다.</li>
          <li>재고설정 페이지에서 개별 데이터(판매/입고)를 각각 초기화할 수 있습니다.</li>
        </ul>
      </section>
    </div>
  );
}
