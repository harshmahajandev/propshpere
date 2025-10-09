import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility functions for Diyar Property Management
export const formatCurrency = (amount: number, currency: string = 'BHD'): string => {
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-BH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-BH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getPropertyStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Available': 'bg-green-100 text-green-800',
    'Reserved': 'bg-yellow-100 text-yellow-800', 
    'Sold': 'bg-red-100 text-red-800',
    'under_construction': 'bg-orange-100 text-orange-800',
    'completed': 'bg-blue-100 text-blue-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getLeadStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'new': 'bg-blue-100 text-blue-800',
    'contacted': 'bg-yellow-100 text-yellow-800',
    'qualified': 'bg-green-100 text-green-800',
    'proposal': 'bg-purple-100 text-purple-800',
    'negotiation': 'bg-orange-100 text-orange-800',
    'closed_won': 'bg-green-100 text-green-800',
    'closed_lost': 'bg-red-100 text-red-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const calculateCompatibilityScore = (customer: any, property: any): number => {
  // Simple compatibility scoring algorithm
  let score = 0;
  
  // Budget compatibility (40% weight)
  const budgetRange = customer.budget_range || '';
  const propertyPrice = property.price || 0;
  
  if (budgetRange.includes('high') && propertyPrice > 200000) score += 40;
  else if (budgetRange.includes('medium') && propertyPrice >= 100000 && propertyPrice <= 200000) score += 40;
  else if (budgetRange.includes('low') && propertyPrice < 100000) score += 40;
  
  // Bedroom preference (30% weight)
  const preferredBedrooms = customer.preferred_bedrooms || 0;
  const propertyBedrooms = property.bedrooms || 0;
  
  if (preferredBedrooms === propertyBedrooms) score += 30;
  else if (Math.abs(preferredBedrooms - propertyBedrooms) === 1) score += 15;
  
  // Location preference (30% weight)
  const preferredLocation = customer.preferred_location || '';
  const propertyLocation = property.project_name || '';
  
  if (preferredLocation.toLowerCase().includes(propertyLocation.toLowerCase())) score += 30;
  
  return Math.min(score, 100); // Cap at 100%
};