export interface Property {
  id: string;
  title: string;
  description?: string;
  propertyType: string;
  status: PropertyStatus;
  price: number;
  currency: string;
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  project?: string;
  island?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  images?: string[];
  floorPlans?: string[];
  videos?: string[];
  interestScore: number;
  viewCount: number;
  inquiryCount: number;
  createdById: string;
  createdAt: Date;
  updatedAt?: Date;
  companyId: string;
}

export enum PropertyStatus {
  Available = 'Available',
  Reserved = 'Reserved',
  Sold = 'Sold',
  UnderMaintenance = 'Under Maintenance',
  Rented = 'Rented'
}

export enum PropertyType {
  Villa = 'Villa',
  Apartment = 'Apartment',
  Townhouse = 'Townhouse',
  Land = 'Land',
  Commercial = 'Commercial',
  Office = 'Office'
}

export interface PropertyFormData {
  title: string;
  description?: string;
  propertyType: string;
  status: string;
  price: number;
  currency: string;
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  project?: string;
  island?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
