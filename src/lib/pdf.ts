import jsPDF from 'jspdf';
import { StockItem } from '@/types/stock';

export function exportToPdf(data: StockItem[], filename: string = 'stock_report.pdf'): void {
  const doc = new jsPDF();

  const today = new Date().toLocaleDateString('ko-KR');
  const totalProducts = data.length;
  const totalStock = data.reduce((sum, item) => sum + item.stock, 0);

  doc.setFontSize(18);
  doc.text('Stock Report', 14, 22);

  doc.setFontSize(11);
  doc.text(`Date: ${today}`, 14, 35);
  doc.text(`Total Products: ${totalProducts}`, 14, 43);
  doc.text(`Total Stock: ${totalStock}`, 14, 51);

  const startY = 65;
  const headers = ['Product ID', 'Product Name', 'Category', 'Stock', 'Updated'];
  const colWidths = [30, 50, 35, 25, 40];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  let x = 14;
  headers.forEach((header, i) => {
    doc.text(header, x, startY);
    x += colWidths[i];
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  data.forEach((item, index) => {
    const y = startY + 10 + index * 8;
    if (y > 280) return;

    let xPos = 14;
    const values = [item.productId, item.productName, item.category, String(item.stock), item.updatedAt];
    values.forEach((val, i) => {
      doc.text(val, xPos, y);
      xPos += colWidths[i];
    });
  });

  doc.save(filename);
}
