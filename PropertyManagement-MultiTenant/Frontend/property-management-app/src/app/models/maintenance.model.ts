export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description?: string;
  priority: Priority;
  status: TicketStatus;
  category?: string;
  customerId?: string;
  customerName?: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt?: Date;
  companyId: string;
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent'
}

export enum TicketStatus {
  Open = 'Open',
  InProgress = 'In Progress',
  OnHold = 'On Hold',
  Resolved = 'Resolved',
  Closed = 'Closed'
}

export interface TicketFormData {
  subject: string;
  description?: string;
  priority: string;
  status: string;
  category?: string;
  customerId?: string;
}

