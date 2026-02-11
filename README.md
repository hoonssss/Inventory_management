# 📦 재고관리 프론트엔드 웹 (Frontend Only)

본 프로젝트는 **백엔드 없이 브라우저에서만 동작하는 재고관리 웹 애플리케이션**입니다.  
데이터는 브라우저의 **IndexedDB**에 저장되며,  
엑셀 / JSON 업로드를 통해 재고를 관리하고 다양한 형식으로 내보낼 수 있습니다.

---

## ✨ 주요 기능

- Frontend Only (서버 / DB 서버 없음)
- IndexedDB 기반 데이터 저장 (브라우저 영속 저장)
- 엑셀 업로드 (.xlsx, .xls)
  - 전체 업로드(초기데이터/판매내역/입고내역)
  - 초기 데이터 업로드(덮어쓰기/병합)
  - 제품 마스터 업로드(제품코드/제품명 반영)
  - 판매내역 업로드
  - 입고내역 업로드
- JSON 업로드 (.json)
  - 초기 데이터 / 제품 마스터 / 판매내역 / 입고내역
- 내보내기
  - 엑셀(.xlsx), JSON(.json), PDF(.pdf)
- 대시보드 분석
  - 재고 현황 테이블(검색/정렬/ABC 필터/페이지네이션)
  - 월별 입고/판매 추이
  - 계절별 판매 분포
  - 품절(소진) 예측 및 발주 필요량 계산
- 다크모드 지원

---

## 🧱 기술 스택

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: React State
- Client Storage: IndexedDB
- Excel 처리: xlsx
- PDF 생성: jsPDF, html2canvas
- Chart: Recharts

---

## 📂 프로젝트 구조

```text
src/
├─ app/
│  ├─ page.tsx          # 대시보드
│  ├─ upload/           # 엑셀 / JSON 업로드
│  ├─ export/           # 엑셀 / JSON / PDF 내보내기
│  ├─ charts/           # 시각화 페이지
│  ├─ records/          # 입출고 이력 페이지
│  ├─ product/          # 제품 관리 페이지
│  └─ settings/         # 설정 페이지
├─ components/
│  ├─ UploadExcel.tsx
│  ├─ UploadJson.tsx
│  ├─ ExportExcel.tsx
│  ├─ ExportJson.tsx
│  ├─ ExportPdf.tsx
│  ├─ StockTable.tsx
│  └─ StockCharts.tsx
├─ lib/
│  ├─ storage.ts        # IndexedDB 유틸
│  ├─ excel.ts          # 엑셀 파싱 / 생성
│  └─ pdf.ts            # PDF 생성
└─ types/
   └─ stock.ts
```

---

## 📊 핵심 데이터 구조

### Product

```json
{
  "productCode": "P001",
  "productName": "아메리카노 원두",
  "stock": 120,
  "targetStock": 200,
  "memo": "주력 상품"
}
```

### SalesRecord

```json
{
  "orderTime": "2026-02-08 10:30:00",
  "productId": "P001",
  "orderQuantity": 8
}
```

### IncomingRecord

```json
{
  "incomingDate": "2026-02-09 09:00:00",
  "productCode": "P001",
  "quantity": 20
}
```

---

## 📥 업로드 가이드

### 1) 엑셀 업로드 (.xlsx, .xls)

- 업로드 탭에서 데이터 유형을 선택해 업로드합니다.
- 템플릿 다운로드 기능을 통해 권장 포맷을 바로 받을 수 있습니다.
- 초기 데이터는 **덮어쓰기 / 병합** 모드를 선택할 수 있습니다.

### 2) JSON 업로드 (.json)

- 배열(JSON Array) 형식 파일만 지원합니다.
- 데이터 유형별로 필요한 필드가 다르며, 빈 배열은 업로드되지 않습니다.

---

## 📤 내보내기 가이드

- 엑셀(.xlsx)
- JSON(.json)
- PDF(.pdf)

PDF에는 현재 재고 목록, 요약 정보, 생성 일자 등이 포함됩니다.

---

## 💾 데이터 저장 방식

- 모든 데이터는 브라우저 **IndexedDB**에 저장됩니다.
- 서버 통신이 없어 오프라인/단일 브라우저 환경에 적합합니다.
- 브라우저 데이터 삭제 시 재고 데이터도 함께 삭제됩니다.

---

## ⚠️ 주의사항

- 브라우저/기기 변경 시 데이터 자동 이전이 되지 않습니다.
- 중요 데이터는 주기적으로 JSON/엑셀 백업을 권장합니다.
- 멀티 사용자 동시 작업 환경(권한/충돌 제어)에는 적합하지 않습니다.

---

## 🚀 실행 방법

```bash
npm install
npm run dev
```

브라우저 접속: <http://localhost:3000>
