export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  nationality?: string;
  address?: string;
  customerType: CustomerType;
  riskLevel: RiskLevel;
  requirements?: string;
  linkedUserId?: string;
  totalPurchaseValue: number;
  propertiesPurchased: number;
  createdAt: Date;
  updatedAt?: Date;
  companyId: string;
}

export enum CustomerType {
  Individual = 'Individual',
  Corporate = 'Corporate',
  Investor = 'Investor'
}

export enum RiskLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High'
}

export interface CustomerFormData {
  fullName: string;
  email: string;
  phone?: string;
  nationality?: string;
  address?: string;
  customerType: string;
  riskLevel: string;
  requirements?: string;
}

