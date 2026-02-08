import jsPDF from 'jspdf';
import { StockSummary } from '@/types/stock';

export function exportSummaryToPdf(data: StockSummary[]): void {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 14;
  const marginBottom = 12;
  const tableHeaderY = 20;

  const today = new Date().toLocaleDateString('ko-KR');
  const totalProducts = data.length;
  const totalCurrentStock = data.reduce((sum, d) => sum + d.currentStock, 0);
  const lowStockCount = data.filter((d) => d.gap < 0).length;

  doc.setFontSize(18);
  doc.text('Stock Summary Report', marginLeft, 22);

  doc.setFontSize(11);
  doc.text(`Date: ${today}`, marginLeft, 35);
  doc.text(`Total Products: ${totalProducts}`, marginLeft, 43);
  doc.text(`Total Current Stock: ${totalCurrentStock}`, marginLeft, 51);
  doc.text(`Below Target: ${lowStockCount}`, marginLeft, 59);

  const startY = 75;
  const headers = ['Code', 'Initial', 'Target', 'Incoming', 'Sales', 'Current', 'Gap'];
  const colWidths = [30, 22, 22, 25, 22, 25, 22];

  const drawTableHeader = (y: number) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    let x = marginLeft;
    headers.forEach((header, i) => {
      doc.text(header, x, y);
      x += colWidths[i];
    });
  };

  drawTableHeader(startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  let currentY = startY + 8;
  data.forEach((item, index) => {
    if (currentY > pageHeight - marginBottom) {
      doc.addPage();
      currentY = tableHeaderY;
      drawTableHeader(currentY);
      currentY += 8;
    }

    let xPos = marginLeft;
    const values = [
      item.productCode,
      String(item.initialStock),
      String(item.targetStock),
      String(item.totalIncoming),
      String(item.totalSales),
      String(item.currentStock),
      String(item.gap),
    ];
    values.forEach((val, i) => {
      doc.text(val, xPos, currentY);
      xPos += colWidths[i];
    });
    currentY += 7;
  });

  doc.save('재고현황_리포트.pdf');
}
