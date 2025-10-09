// Utility functions
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatCurrency(amount: number, currency = 'BHD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

interface UtilsType {
  cn: typeof cn
  formatDate: typeof formatDate
  formatCurrency: typeof formatCurrency
}

const utils: UtilsType = {
  cn,
  formatDate,
  formatCurrency
}

export default utils