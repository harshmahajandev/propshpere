export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  nationality?: string;
  source: LeadSource;
  status: LeadStatus;
  stage: LeadStage;
  propertyInterest?: string;
  propertyType?: PropertyType;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  bedrooms?: number;
  notes?: string;
  assignedTo?: string;
  priority: Priority;
  score: number; // Lead scoring 0-100
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  conversionProbability?: number; // 0-100%
  tags?: string[];
  activities?: LeadActivity[];
  createdAt: Date;
  updatedAt?: Date;
  convertedToCustomerId?: string;
  companyId: string;
}

export enum LeadSource {
  Website = 'Website',
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Google = 'Google',
  Referral = 'Referral',
  WalkIn = 'Walk-In',
  Phone = 'Phone Call',
  Email = 'Email',
  WhatsApp = 'WhatsApp',
  Exhibition = 'Exhibition',
  Other = 'Other'
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Unqualified = 'Unqualified',
  Converted = 'Converted',
  Lost = 'Lost'
}

export enum LeadStage {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  ClosedWon = 'Closed Won',
  ClosedLost = 'Closed Lost'
}

export enum PropertyType {
  Apartment = 'Apartment',
  Villa = 'Villa',
  Townhouse = 'Townhouse',
  Penthouse = 'Penthouse',
  Office = 'Office',
  Retail = 'Retail',
  Warehouse = 'Warehouse',
  Land = 'Land',
  Building = 'Building'
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent'
}

export interface LeadActivity {
  id: string;
  type: ActivityType;
  description: string;
  date: Date;
  performedBy: string;
  notes?: string;
}

export enum ActivityType {
  Call = 'Call',
  Email = 'Email',
  Meeting = 'Meeting',
  PropertyViewing = 'Property Viewing',
  FollowUp = 'Follow Up',
  Note = 'Note',
  StatusChange = 'Status Change'
}

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  nationality?: string;
  source: string;
  propertyInterest?: string;
  propertyType?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  bedrooms?: number;
  notes?: string;
  priority: string;
  nextFollowUpDate?: Date;
  tags?: string[];
}

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageResponseTime: number; // in hours
  leadsThisMonth: number;
  leadsGrowth: number; // percentage
}

export interface PipelineStats {
  stage: LeadStage;
  count: number;
  value: number; // total potential value
  conversionRate: number;
}

