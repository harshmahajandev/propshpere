import jsPDF from 'jspdf';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: {
    full_name: string;
    email: string;
    phone?: string;
  };
  property?: {
    title: string;
  };
  total_amount: number;
  status: string;
  due_date: string;
  milestone_name?: string;
  notes?: string;
  created_at: string;
  items?: any[];
}

export const generateInvoicePDF = (invoice: Invoice) => {
  const pdf = new jsPDF();
  
  // Set up the document
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  // Company Header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(41, 128, 185); // Blue color
  pdf.text('DIYAR', margin, 30);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text('Property Management Solutions', margin, 38);
  pdf.text('Kingdom of Bahrain', margin, 45);
  pdf.text('info@diyar.bh | +973 1234 5678', margin, 52);
  
  // Invoice Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('INVOICE', pageWidth - margin - 40, 30, { align: 'right' });
  
  // Invoice Number and Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice #: ${invoice.invoice_number}`, pageWidth - margin - 60, 42, { align: 'right' });
  pdf.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, pageWidth - margin - 60, 49, { align: 'right' });
  pdf.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, pageWidth - margin - 60, 56, { align: 'right' });
  
  // Line separator
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, 70, pageWidth - margin, 70);
  
  // Bill To Section
  let yPosition = 85;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BILL TO:', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.customer.full_name, margin, yPosition);
  
  if (invoice.customer.email) {
    yPosition += 7;
    pdf.text(invoice.customer.email, margin, yPosition);
  }
  
  if (invoice.customer.phone) {
    yPosition += 7;
    pdf.text(invoice.customer.phone, margin, yPosition);
  }
  
  // Property Information
  if (invoice.property?.title) {
    yPosition += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROPERTY:', margin, yPosition);
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text(invoice.property.title, margin, yPosition);
  }
  
  // Milestone Information
  if (invoice.milestone_name) {
    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('MILESTONE:', margin, yPosition);
    yPosition += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.text(invoice.milestone_name, margin, yPosition);
  }
  
  // Invoice Items Table
  yPosition += 25;
  
  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 15, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', margin + 5, yPosition + 10);
  pdf.text('Qty', pageWidth - 80, yPosition + 10, { align: 'center' });
  pdf.text('Unit Price', pageWidth - 60, yPosition + 10, { align: 'center' });
  pdf.text('Amount', pageWidth - margin - 5, yPosition + 10, { align: 'right' });
  
  yPosition += 15;
  
  // Table content
  const items = invoice.items && typeof invoice.items === 'string' 
    ? JSON.parse(invoice.items) 
    : invoice.items || [];
  
  if (items.length === 0) {
    // Default item if no items specified
    items.push({
      description: `${invoice.milestone_name || 'Payment'} - ${invoice.property?.title || 'Property Purchase'}`,
      quantity: 1,
      unit_price: invoice.total_amount,
      amount: invoice.total_amount
    });
  }
  
  pdf.setFont('helvetica', 'normal');
  
  items.forEach((item: any) => {
    yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.text(item.description || '', margin + 5, yPosition);
    pdf.text((item.quantity || 1).toString(), pageWidth - 80, yPosition, { align: 'center' });
    pdf.text(`BD ${(item.unit_price || 0).toLocaleString()}`, pageWidth - 60, yPosition, { align: 'center' });
    pdf.text(`BD ${(item.amount || 0).toLocaleString()}`, pageWidth - margin - 5, yPosition, { align: 'right' });
  });
  
  // Total section
  yPosition += 20;
  
  // Line separator
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(200, 200, 200);
  pdf.line(pageWidth - 120, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL AMOUNT:', pageWidth - 120, yPosition);
  pdf.text(`BD ${invoice.total_amount.toLocaleString()}`, pageWidth - margin - 5, yPosition, { align: 'right' });
  
  // Status
  yPosition += 15;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const statusColor = invoice.status === 'paid' ? [34, 197, 94] : [239, 68, 68];
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - 120, yPosition);
  
  // Notes section
  if (invoice.notes) {
    yPosition += 20;
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOTES:', margin, yPosition);
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    
    // Split notes into lines to fit the page width
    const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    notesLines.forEach((line: string) => {
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });
  }
  
  // Payment Instructions
  yPosition += 20;
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('PAYMENT INSTRUCTIONS:', margin, yPosition);
  yPosition += 10;
  pdf.text('Please transfer the amount to our bank account:', margin, yPosition);
  yPosition += 7;
  pdf.text('Bank: National Bank of Bahrain', margin, yPosition);
  yPosition += 7;
  pdf.text('Account Number: 1234567890', margin, yPosition);
  yPosition += 7;
  pdf.text('IBAN: BH67NBOB00001234567890', margin, yPosition);
  yPosition += 7;
  pdf.text(`Reference: ${invoice.invoice_number}`, margin, yPosition);
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  const footerY = pageHeight - 15;
  pdf.text('Thank you for your business with Diyar Property Management', pageWidth / 2, footerY, { align: 'center' });
  
  return pdf;
};

export const downloadInvoicePDF = (invoice: Invoice) => {
  const pdf = generateInvoicePDF(invoice);
  pdf.save(`Invoice_${invoice.invoice_number}.pdf`);
};

export const previewInvoicePDF = (invoice: Invoice) => {
  const pdf = generateInvoicePDF(invoice);
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};