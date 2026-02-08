# 📦 재고관리 프론트엔드 웹 (Frontend Only)

본 프로젝트는 **백엔드 없이 브라우저에서만 동작하는 재고관리 웹 애플리케이션**입니다.  
모든 데이터는 **LocalStorage**에 저장되며,  
엑셀 / JSON 업로드를 통해 재고를 관리하고 다양한 형식으로 내보낼 수 있습니다.

---

## ✨ 주요 기능

- Frontend Only (서버 / DB 없음)
- LocalStorage 기반 데이터 저장
- 엑셀 업로드 (.xlsx)
- 엑셀 내보내기 (.xlsx)
- JSON 업로드 / 내보내기
- PDF 미리보기 및 다운로드
- 재고 데이터 시각화 (차트)
- 새로고침 후에도 데이터 유지

---

## 🧱 기술 스택

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: React State + LocalStorage
- Excel 처리: xlsx
- PDF 생성: jsPDF, html2canvas
- Chart: Chart.js 또는 Recharts

---

## 📂 프로젝트 구조

src/
├─ app/
│ ├─ page.tsx # 대시보드
│ ├─ upload/ # 엑셀 / JSON 업로드
│ ├─ export/ # 엑셀 / JSON / PDF 내보내기
│ └─ charts/ # 시각화 페이지
├─ components/
│ ├─ UploadExcel.tsx
│ ├─ UploadJson.tsx
│ ├─ ExportExcel.tsx
│ ├─ ExportJson.tsx
│ ├─ StockTable.tsx
│ └─ StockCharts.tsx
├─ lib/
│ ├─ storage.ts # LocalStorage 유틸
│ ├─ excel.ts # 엑셀 파싱 / 생성
│ └─ pdf.ts # PDF 생성
├─ types/
│ └─ stock.ts


---

## 📊 데이터 구조

json
{
  "productId": "P001",
  "productName": "아메리카노 원두",
  "category": "원두",
  "stock": 120,
  "updatedAt": "2026-02-08"
}
📥 업로드 지원 형식
1. 엑셀 업로드 (.xlsx)
현재 재고 등록

입고 재고 반영 (+)

출고 재고 반영 (-)

엑셀 컬럼 예시:

productId	productName	category	quantity	type
P001	아메리카노 원두	원두	20	IN
P002	종이컵	소모품	10	OUT
type

IN : 입고

OUT : 출고

2. JSON 업로드 (.json)
[
  {
    "productId": "P001",
    "productName": "아메리카노 원두",
    "category": "원두",
    "quantity": 30,
    "type": "IN"
  }
]
📤 내보내기 지원 형식
엑셀 (.xlsx)

JSON (.json)

PDF (.pdf)

PDF 내보내기 포함 정보:

현재 재고 목록

총 상품 수

총 재고 수량

생성 일자

📈 시각화 기능
카테고리별 재고 비율 (Pie Chart)

상품별 재고 수량 (Bar Chart)

입고 / 출고 추이 (Line Chart)

💾 데이터 저장 방식
모든 데이터는 브라우저 LocalStorage에 저장됩니다.

서버 통신 없음

브라우저 데이터 삭제 시 재고 정보도 함께 삭제됩니다.

LocalStorage Key 예시:

stockData
⚠️ 주의사항
브라우저 변경 시 데이터 자동 이전 불가

데이터 백업을 위해 JSON 내보내기 권장

대량 데이터(수만 건 이상)에는 적합하지 않음

멀티 사용자 동시 사용 불가

🚀 실행 방법
npm install
npm run dev
브라우저 접속:

http://localhost:3000
