import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Calendar, Filter, X } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays } from 'date-fns'

interface DateRangeFilterProps {
  selectedPeriod: string
  selectedDateRange: string
  onPeriodChange: (period: string) => void
  onDateRangeChange: (range: string) => void
  onCustomDateChange?: (startDate: string, endDate: string) => void
  loading?: boolean
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedPeriod,
  selectedDateRange,
  onPeriodChange,
  onDateRangeChange,
  onCustomDateChange,
  loading = false
}) => {
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const handleDateRangeChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomRange(true)
    } else {
      setShowCustomRange(false)
      onDateRangeChange(value)
    }
  }

  const applyCustomRange = () => {
    if (customStartDate && customEndDate && onCustomDateChange) {
      onCustomDateChange(customStartDate, customEndDate)
      setShowCustomRange(false)
    }
  }

  const clearCustomRange = () => {
    setCustomStartDate('')
    setCustomEndDate('')
    setShowCustomRange(false)
    onDateRangeChange('current_month')
  }

  const getDateRangeDisplay = () => {
    const now = new Date()
    
    switch (selectedDateRange) {
      case 'current_month':
        return `${format(startOfMonth(now), 'MMM dd')} - ${format(endOfMonth(now), 'MMM dd, yyyy')}`
      case 'last_month':
        const lastMonth = subMonths(now, 1)
        return `${format(startOfMonth(lastMonth), 'MMM dd')} - ${format(endOfMonth(lastMonth), 'MMM dd, yyyy')}`
      case 'current_year':
        return `${format(startOfYear(now), 'MMM dd')} - ${format(endOfYear(now), 'MMM dd, yyyy')}`
      case 'last_7_days':
        return `${format(subDays(now, 7), 'MMM dd')} - ${format(now, 'MMM dd, yyyy')}`
      case 'last_30_days':
        return `${format(subDays(now, 30), 'MMM dd')} - ${format(now, 'MMM dd, yyyy')}`
      case 'last_90_days':
        return `${format(subDays(now, 90), 'MMM dd')} - ${format(now, 'MMM dd, yyyy')}`
      default:
        return 'Select date range'
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <Select value={selectedDateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">Current Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="current_year">Current Year</SelectItem>
            <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
            <SelectItem value="last_90_days">Last 90 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Date Range Display */}
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm">
          <Calendar className="h-4 w-4" />
          <span>{getDateRangeDisplay()}</span>
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span>Loading data...</span>
          </div>
        )}
      </div>

      {/* Custom Date Range */}
      {showCustomRange && (
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Custom Date Range</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCustomRange}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full"
                  min={customStartDate}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={applyCustomRange}
                  disabled={!customStartDate || !customEndDate}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Apply
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCustomRange}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DateRangeFilter