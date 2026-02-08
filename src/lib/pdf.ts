import jsPDF from 'jspdf';
import { StockSummary } from '@/types/stock';

export function exportSummaryToPdf(data: StockSummary[]): void {
  const doc = new jsPDF();

  const today = new Date().toLocaleDateString('ko-KR');
  const totalProducts = data.length;
  const totalCurrentStock = data.reduce((sum, d) => sum + d.currentStock, 0);
  const lowStockCount = data.filter((d) => d.gap < 0).length;

  doc.setFontSize(18);
  doc.text('Stock Summary Report', 14, 22);

  doc.setFontSize(11);
  doc.text(`Date: ${today}`, 14, 35);
  doc.text(`Total Products: ${totalProducts}`, 14, 43);
  doc.text(`Total Current Stock: ${totalCurrentStock}`, 14, 51);
  doc.text(`Below Target: ${lowStockCount}`, 14, 59);

  const startY = 75;
  const headers = ['Code', 'Initial', 'Target', 'Incoming', 'Sales', 'Current', 'Gap'];
  const colWidths = [30, 22, 22, 25, 22, 25, 22];

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  let x = 14;
  headers.forEach((header, i) => {
    doc.text(header, x, startY);
    x += colWidths[i];
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  data.forEach((item, index) => {
    const y = startY + 8 + index * 7;
    if (y > 280) return;

    let xPos = 14;
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
      doc.text(val, xPos, y);
      xPos += colWidths[i];
    });
  });

  doc.save('재고현황_리포트.pdf');
}
