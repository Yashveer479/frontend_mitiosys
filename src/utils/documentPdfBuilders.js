import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (value) => {
    if (!value) return '-';
    return String(value);
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatMoney = (value, currency = 'UGX') => `${formatNumber(value)} ${currency}`;

const drawHeader = (pdf, title, subtitle) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text('MITIOSYS', 14, 18);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Industrial Area, Plot 78B, Kampala, Uganda', 14, 24);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(17);
    pdf.text(title, 196, 18, { align: 'right' });

    if (subtitle) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(subtitle, 196, 24, { align: 'right' });
    }

    pdf.setDrawColor(30, 41, 59);
    pdf.line(14, 28, 196, 28);
};

export const buildTaxInvoicePdf = (invoiceData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    const subtotal = (invoiceData.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = (invoiceData.items || []).reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice * (Number(item.taxRate || 0) / 100)),
        0
    );
    const total = subtotal + tax;

    drawHeader(pdf, 'TAX INVOICE', 'Original Copy');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Invoice #: ${invoiceData.invoiceNumber || '-'}`, 14, 36);
    pdf.text(`Date: ${formatDate(invoiceData.date)}`, 14, 42);
    pdf.text(`TIN: ${invoiceData.tin || '-'}`, 110, 36);
    pdf.text(`VRN: ${invoiceData.vrn || '-'}`, 110, 42);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Bill To', 14, 52);
    pdf.setFont('helvetica', 'normal');
    pdf.text(invoiceData.customer?.name || '-', 14, 58);
    pdf.text(invoiceData.customer?.address || '-', 14, 64);
    pdf.text(`Customer TIN: ${invoiceData.customer?.tin || '-'}`, 14, 70);

    autoTable(pdf, {
        startY: 78,
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Tax %', 'Line Total']],
        body: (invoiceData.items || []).map((item, index) => {
            const lineTotal = item.quantity * item.unitPrice;
            return [
                String(index + 1),
                item.description || '-',
                formatNumber(item.quantity),
                formatMoney(item.unitPrice),
                String(item.taxRate || 0),
                formatMoney(lineTotal)
            ];
        }),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9, cellPadding: 2.5 }
    });

    const summaryStart = (pdf.lastAutoTable?.finalY || 78) + 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Subtotal:', 140, summaryStart);
    pdf.text(formatMoney(subtotal), 196, summaryStart, { align: 'right' });

    pdf.text('VAT:', 140, summaryStart + 7);
    pdf.text(formatMoney(tax), 196, summaryStart + 7, { align: 'right' });

    pdf.setFontSize(12);
    pdf.text('Total Payable:', 140, summaryStart + 16);
    pdf.text(formatMoney(total), 196, summaryStart + 16, { align: 'right' });

    pdf.save(`Tax_Invoice_${invoiceData.invoiceNumber || 'document'}.pdf`);
};

export const buildDeliveryNotePdf = (deliveryData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    drawHeader(pdf, 'DELIVERY NOTE', 'Proof of Delivery');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(`Dispatch #: ${deliveryData.dispatchNumber || '-'}`, 14, 36);
    pdf.text(`Date: ${formatDate(deliveryData.dispatchDate)}`, 14, 42);
    pdf.text(`Order Ref: ${deliveryData.orderReference || '-'}`, 14, 48);

    pdf.text(`Vehicle: ${deliveryData.vehicleReg || '-'}`, 110, 36);
    pdf.text(`Driver: ${deliveryData.driverName || '-'}`, 110, 42);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Deliver To', 14, 58);
    pdf.setFont('helvetica', 'normal');
    pdf.text(deliveryData.customer?.name || '-', 14, 64);
    pdf.text(deliveryData.customer?.address || '-', 14, 70);
    pdf.text(deliveryData.customer?.contact || '-', 14, 76);

    autoTable(pdf, {
        startY: 84,
        head: [['#', 'Description', 'Ordered', 'Shipped']],
        body: (deliveryData.items || []).map((item, index) => [
            String(index + 1),
            item.description || '-',
            formatNumber(item.ordered),
            formatNumber(item.shipped)
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9, cellPadding: 2.5 }
    });

    const footerY = Math.min((pdf.lastAutoTable?.finalY || 84) + 18, 260);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Dispatched By (Mitiosys)', 14, footerY);
    pdf.text('Received By (Customer)', 110, footerY);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Name & Signature: ____________________', 14, footerY + 8);
    pdf.text('Name & Signature: ____________________', 110, footerY + 8);
    pdf.text('Date: _______________', 14, footerY + 15);
    pdf.text('Date: _______________', 110, footerY + 15);

    pdf.save(`Delivery_Note_${deliveryData.dispatchNumber || 'document'}.pdf`);
};

export const buildProformaInvoicePdf = (invoiceData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    const subtotal = (invoiceData.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = (invoiceData.items || []).reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice * (Number(item.taxRate || 0) / 100)),
        0
    );
    const total = subtotal + tax;

    drawHeader(pdf, 'PROFORMA INVOICE', 'Draft / Not a Tax Invoice');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Invoice #: ${invoiceData.invoiceNumber || '-'}`, 14, 36);
    pdf.text(`Date: ${formatDate(invoiceData.date)}`, 14, 42);

    pdf.setFont('helvetica', 'bold');
    pdf.text('Customer', 14, 52);
    pdf.setFont('helvetica', 'normal');
    pdf.text(invoiceData.customer?.name || '-', 14, 58);
    pdf.text(invoiceData.customer?.address || '-', 14, 64);
    pdf.text(invoiceData.customer?.email || '-', 14, 70);
    pdf.text(invoiceData.customer?.phone || '-', 14, 76);

    autoTable(pdf, {
        startY: 84,
        head: [['#', 'Description', 'Qty', 'Unit Price', 'Tax %', 'Line Total']],
        body: (invoiceData.items || []).map((item, index) => {
            const lineTotal = item.quantity * item.unitPrice;
            return [
                String(index + 1),
                item.description || '-',
                formatNumber(item.quantity),
                formatMoney(item.unitPrice),
                String(item.taxRate || 0),
                formatMoney(lineTotal)
            ];
        }),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9, cellPadding: 2.5 }
    });

    const summaryStart = (pdf.lastAutoTable?.finalY || 84) + 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Subtotal:', 140, summaryStart);
    pdf.text(formatMoney(subtotal), 196, summaryStart, { align: 'right' });
    pdf.text('VAT:', 140, summaryStart + 7);
    pdf.text(formatMoney(tax), 196, summaryStart + 7, { align: 'right' });
    pdf.setFontSize(12);
    pdf.text('Total Due:', 140, summaryStart + 16);
    pdf.text(formatMoney(total), 196, summaryStart + 16, { align: 'right' });

    pdf.save(`Proforma_Invoice_${invoiceData.invoiceNumber || 'document'}.pdf`);
};