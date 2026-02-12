import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StockSummary } from '@/types/stock';

export async function exportSummaryToPdf(data: StockSummary[]): Promise<void> {
  const today = new Date().toLocaleDateString('ko-KR');
  const totalProducts = data.length;
  const totalCurrentStock = data.reduce((sum, d) => sum + d.currentStock, 0);
  const lowStockCount = data.filter((d) => d.gap < 0).length;

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '980px';
  container.style.padding = '24px';
  container.style.background = '#ffffff';
  container.style.color = '#111827';
  container.style.fontFamily = '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

  const rows = data
    .map(
      (item) => `
      <tr>
        <td>${item.productCode}</td>
        <td>${item.productName || '-'}</td>
        <td>${item.initialStock}</td>
        <td>${item.targetStock}</td>
        <td>${item.totalIncoming}</td>
        <td>${item.totalSales}</td>
        <td>${item.currentStock}</td>
        <td>${item.gap}</td>
      </tr>
    `,
    )
    .join('');

  container.innerHTML = `
    <h1 style="margin:0 0 12px;font-size:28px;">재고 현황 리포트</h1>
    <div style="margin-bottom:16px;font-size:14px;line-height:1.8;">
      <div>생성일: ${today}</div>
      <div>총 제품 수: ${totalProducts}</div>
      <div>총 현재 재고: ${totalCurrentStock}</div>
      <div>목표 미달 제품 수: ${lowStockCount}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="width:12%;">제품코드</th>
          <th style="width:24%;">제품명</th>
          <th>초기재고</th>
          <th>목표재고</th>
          <th>입고수량</th>
          <th>판매수량</th>
          <th>현재재고</th>
          <th>차이</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  const style = document.createElement('style');
  style.textContent = `
    th, td {
      border: 1px solid #d1d5db;
      padding: 8px;
      text-align: center;
      word-break: keep-all;
    }
  `;
  container.appendChild(style);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save('재고현황_리포트.pdf');
  } finally {
    document.body.removeChild(container);
  }
}
