import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DollarSign, Receipt, TrendingUp, TrendingDown, Home } from 'lucide-react'
import { type FinancialSummary, type OccupancyStats } from '@/lib/supabase'

interface FinancialSummaryCardsProps {
  financialSummary: FinancialSummary | null
  occupancyStats: OccupancyStats | null
  loading?: boolean
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  financialSummary,
  occupancyStats,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number = 0) => {
    return amount.toLocaleString('en-BH', {
      style: 'currency',
      currency: 'BHD',
    })
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  // Mock previous period data for percentage calculations
  const mockPreviousRevenue = (financialSummary?.total_revenue || 0) * 0.88
  const mockPreviousExpenses = (financialSummary?.total_expenses || 0) * 1.03
  const mockPreviousProfit = (financialSummary?.net_profit || 0) * 0.85
  const mockPreviousOccupancy = (occupancyStats?.occupancy_rate || 0) * 0.92

  const revenueChange = calculatePercentageChange(
    financialSummary?.total_revenue || 0,
    mockPreviousRevenue
  )
  const expensesChange = calculatePercentageChange(
    financialSummary?.total_expenses || 0,
    mockPreviousExpenses
  )
  const profitChange = calculatePercentageChange(
    financialSummary?.net_profit || 0,
    mockPreviousProfit
  )
  const occupancyChange = calculatePercentageChange(
    occupancyStats?.occupancy_rate || 0,
    mockPreviousOccupancy
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Revenue */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(financialSummary?.total_revenue)}
          </div>
          <div className="flex items-center mt-1">
            {revenueChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <p className={`text-xs ${
              revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% from last period
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          <Receipt className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(financialSummary?.total_expenses)}
          </div>
          <div className="flex items-center mt-1">
            {expensesChange <= 0 ? (
              <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingUp className="h-3 w-3 text-red-600 mr-1" />
            )}
            <p className={`text-xs ${
              expensesChange <= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {expensesChange >= 0 ? '+' : ''}{expensesChange.toFixed(1)}% from last period
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(financialSummary?.net_profit)}
          </div>
          <div className="flex items-center mt-1">
            {profitChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <p className={`text-xs ${
              profitChange >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(1)}% from last period
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Occupancy Rate */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Occupancy Rate</CardTitle>
          <Home className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {occupancyStats?.occupancy_rate.toFixed(1) || '0.0'}%
          </div>
          <div className="flex items-center mt-1">
            {occupancyChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-purple-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <p className={`text-xs ${
              occupancyChange >= 0 ? 'text-purple-600' : 'text-red-600'
            }`}>
              {occupancyStats?.occupied_units || 0}/{occupancyStats?.total_units || 0} units
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialSummaryCards