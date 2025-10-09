export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  invoiceDate: Date;
  dueDate?: Date;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  companyId: string;
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled'
}

export interface InvoiceFormData {
  customerId: string;
  invoiceDate: string;
  dueDate?: string;
  amount: number;
  taxAmount: number;
  description?: string;
}

