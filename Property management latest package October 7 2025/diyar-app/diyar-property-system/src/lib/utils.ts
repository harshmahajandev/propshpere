import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'BHD'): string {
  return new Intl.NumberFormat('en-BH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateConfirmationNumber(reservationId: string): string {
  return `RES-${reservationId.split('-')[0].toUpperCase()}`
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function calculatePropertyScore(property: any, reservationsCount: number = 0): number {
  let score = 50 // Base score
  
  // Status factor
  if (property.status === 'available') score += 20
  else if (property.status === 'reserved') score += 10
  
  // Availability factor
  const availabilityRatio = property.available_units / property.total_units
  score += availabilityRatio * 20
  
  // Demand factor (based on reservations)
  score += Math.min(reservationsCount * 2, 30)
  
  // Features factor
  if (property.amenities && property.amenities.length > 0) {
    score += Math.min(property.amenities.length * 2, 10)
  }
  
  return Math.min(Math.round(score), 100)
}