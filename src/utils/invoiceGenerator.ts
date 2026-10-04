import jsPDF from 'jspdf';
import { Order, StoreSettings } from '../types';

export function generateInvoicePDF(order: Order, settings: StoreSettings) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  // Header Background Accent Bar
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(0, 0, pageWidth, 6, 'F');

  // Store Brand & Invoice Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(24, 24, 27); // Zinc 900
  doc.text(settings.storeName || 'Student Hub Egypt', margin, y);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(113, 113, 122); // Zinc 500
  y += 5;
  doc.text(settings.tagline || 'Official University Store', margin, y);
  y += 4;
  doc.text(`Contact: ${settings.supportPhone || '+20 100 234 5678'} | ${settings.supportEmail || 'support@studenthub.eg'}`, margin, y);

  // Invoice / Receipt Badge on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235);
  doc.text('OFFICIAL INVOICE', pageWidth - margin, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(82, 82, 91);
  doc.text(`Invoice No: ${order.id}`, pageWidth - margin, 24, { align: 'right' });
  doc.text(`Date: ${order.date}`, pageWidth - margin, 29, { align: 'right' });
  doc.text(`Status: ${order.status.toUpperCase()}`, pageWidth - margin, 34, { align: 'right' });

  // Divider
  y += 12;
  doc.setDrawColor(228, 228, 231); // Zinc 200
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);

  // Two columns: Customer Information & Delivery / Payment Details
  y += 8;
  const colWidth = (pageWidth - margin * 2 - 10) / 2;

  // Box 1: Customer Details
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('CUSTOMER INFORMATION', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${order.studentName}`, margin + 4, y + 13);
  doc.text(`Phone: ${order.phone}`, margin + 4, y + 19);
  doc.text(`WhatsApp: ${order.whatsapp || order.phone}`, margin + 4, y + 25);
  if (order.email) {
    doc.text(`Email: ${order.email}`, margin + 4, y + 31);
  } else {
    doc.text(`Preferred Contact: ${order.preferredContactMethod ? order.preferredContactMethod.toUpperCase() : 'WHATSAPP'}`, margin + 4, y + 31);
  }

  // Box 2: Fulfillment & Payment Details
  const col2X = margin + colWidth + 10;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col2X, y, colWidth, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col2X, y, colWidth, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('FULFILLMENT & PAYMENT', col2X + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const methodLabel = order.deliveryMethod === 'pickup' ? 'Campus Pickup' : 'Home Delivery';
  doc.text(`Method: ${methodLabel}`, col2X + 4, y + 13);
  doc.text(`Payment: ${order.paymentMethod}`, col2X + 4, y + 19);

  // Address line (wrap if long)
  const addr = order.deliveryAddress || order.campusDeliveryPoint || 'Campus Pickup';
  const splitAddr = doc.splitTextToSize(`Address: ${addr}`, colWidth - 8);
  doc.text(splitAddr, col2X + 4, y + 25);

  y += 44;

  // Products Table Header
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, pageWidth - margin * 2, 8, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  doc.text('ITEM DESCRIPTION', margin + 3, y + 5.5);
  doc.text('QTY', margin + 105, y + 5.5, { align: 'center' });
  doc.text('UNIT PRICE', margin + 135, y + 5.5, { align: 'right' });
  doc.text('TOTAL', pageWidth - margin - 3, y + 5.5, { align: 'right' });

  y += 8;

  // Products Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(margin, y, pageWidth - margin * 2, 9, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 9, pageWidth - margin, y + 9);

    doc.setTextColor(30, 41, 59);
    const itemTitle = item.title.length > 55 ? `${item.title.substring(0, 52)}...` : item.title;
    doc.text(itemTitle, margin + 3, y + 6);

    doc.setTextColor(71, 85, 105);
    doc.text(String(item.quantity), margin + 105, y + 6, { align: 'center' });
    doc.text(`${item.price} EGP`, margin + 135, y + 6, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${itemTotal} EGP`, pageWidth - margin - 3, y + 6, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 9;
  });

  // Totals Section
  y += 4;
  const totalsWidth = 75;
  const totalsX = pageWidth - margin - totalsWidth;

  const addTotalRow = (label: string, value: string, isBold: boolean = false, isAccent: boolean = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 10 : 8.5);
    doc.setTextColor(isAccent ? 37 : 71, isAccent ? 99 : 85, isAccent ? 235 : 105);
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - margin - 3, y, { align: 'right' });
    y += 5.5;
  };

  addTotalRow('Subtotal:', `${order.subtotal} EGP`);

  if (order.discount > 0) {
    addTotalRow('Discount:', `-${order.discount} EGP`);
  }

  addTotalRow('Delivery Fee:', order.shipping === 0 ? 'FREE' : `${order.shipping} EGP`);

  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX, y - 2, pageWidth - margin, y - 2);
  y += 1;

  addTotalRow('FINAL TOTAL:', `${order.total} EGP`, true, true);

  // Customer Notes if available
  if (order.customerNotes) {
    y = Math.max(y, 190);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('CUSTOMER NOTES / INSTRUCTIONS:', margin, y);
    y += 4.5;
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    const splitNotes = doc.splitTextToSize(`"${order.customerNotes}"`, pageWidth - margin * 2);
    doc.text(splitNotes, margin, y);
    y += splitNotes.length * 4.5;
  }

  // Footer notes & terms
  const footerY = 275;
  doc.setDrawColor(228, 228, 231);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Thank you for shopping with Student Hub Egypt! All student products are covered by our standard quality guarantee.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    `For inquiries, quote Order #${order.id} on WhatsApp: ${settings.supportPhone || '+20 100 234 5678'}`,
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );

  // Save the generated PDF
  doc.save(`Invoice-${order.id}.pdf`);
}

export function printInvoiceHTML(order: Order, settings: StoreSettings) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
        <strong>${item.title}</strong>
        ${item.variant ? `<br/><span style="color: #64748b; font-size: 11px;">${item.variant}</span>` : ''}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px;">${item.quantity}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">${item.price} EGP</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-weight: bold;">${item.price * item.quantity} EGP</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html dir="ltr">
    <head>
      <meta charset="utf-8" />
      <title>Invoice - ${order.id}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; padding: 24px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
        .brand { font-size: 24px; font-weight: bold; color: #0f172a; }
        .tagline { font-size: 12px; color: #64748b; margin-top: 2px; }
        .invoice-title { font-size: 20px; font-weight: bold; color: #2563eb; text-align: right; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-size: 12px; }
        .info-card h4 { margin: 0 0 8px 0; font-size: 12px; color: #334155; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f1f5f9; padding: 8px 12px; font-size: 12px; text-transform: uppercase; color: #475569; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
        .totals { margin-left: auto; width: 280px; font-size: 13px; }
        .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
        .grand-total { border-top: 2px solid #0f172a; padding-top: 6px; font-size: 16px; font-weight: bold; color: #2563eb; }
        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">${settings.storeName || 'Student Hub Egypt'}</div>
          <div class="tagline">${settings.tagline || 'Official University Supplies & Campus Delivery'}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Phone: ${settings.supportPhone || '+20 100 234 5678'} · Email: ${settings.supportEmail || 'support@studenthub.eg'}</div>
        </div>
        <div>
          <div class="invoice-title">INVOICE</div>
          <div style="font-size: 12px; font-weight: bold; color: #0f172a;">#${order.id}</div>
          <div style="font-size: 11px; color: #64748b;">Date: ${order.date}</div>
          <div style="font-size: 11px; color: #16a34a; font-weight: bold;">Status: ${order.status}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <h4>Customer Details</h4>
          <div><strong>Name:</strong> ${order.studentName}</div>
          <div><strong>Phone:</strong> ${order.phone}</div>
          ${order.whatsapp ? `<div><strong>WhatsApp:</strong> ${order.whatsapp}</div>` : ''}
          ${order.email ? `<div><strong>Email:</strong> ${order.email}</div>` : ''}
        </div>
        <div class="info-card">
          <h4>Fulfillment & Payment</h4>
          <div><strong>Fulfillment:</strong> ${order.deliveryMethod === 'pickup' ? 'Campus Pickup' : 'Address Delivery'}</div>
          <div><strong>Destination:</strong> ${order.deliveryAddress || order.campusDeliveryPoint || 'Campus Pickup'}</div>
          <div><strong>Payment Method:</strong> ${order.paymentMethod}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">Item Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row"><span>Subtotal:</span><span>${order.subtotal} EGP</span></div>
        ${order.discount > 0 ? `<div class="totals-row" style="color: #16a34a;"><span>Discount:</span><span>-${order.discount} EGP</span></div>` : ''}
        <div class="totals-row"><span>Delivery Fee:</span><span>${order.shipping === 0 ? 'FREE' : `${order.shipping} EGP`}</span></div>
        <div class="totals-row grand-total"><span>Total Amount:</span><span>${order.total} EGP</span></div>
      </div>

      ${order.customerNotes ? `<div style="margin-top: 24px; padding: 12px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; font-size: 12px;"><strong>Order Notes:</strong> ${order.customerNotes}</div>` : ''}

      <div class="footer">
        <div>Thank you for choosing Student Hub! Keep your Order ID <strong>#${order.id}</strong> for any inquiries.</div>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
