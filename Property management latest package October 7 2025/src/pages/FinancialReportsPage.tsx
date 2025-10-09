import React, { useState, useEffect } from 'react'
import { useFinancialStore } from '@/stores/financial-store'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subDays } from 'date-fns'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts'
import toast from 'react-hot-toast'

// Import modular components
import FinancialSummaryCards from '@/components/financials/FinancialSummaryCards'
import RevenueChart from '@/components/financials/RevenueChart'
import OccupancyReport from '@/components/financials/OccupancyReport'
import InvoiceStatusChart from '@/components/financials/InvoiceStatusChart'
import RecentTransactions from '@/components/financials/RecentTransactions'
import PdfExportButton from '@/components/financials/PdfExportButton'
import DateRangeFilter from '@/components/financials/DateRangeFilter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, Home, CreditCard } from 'lucide-react'

const FinancialReportsPage: React.FC = () => {
  const {
    financialRecords,
    invoices,
    financialSummary,
    occupancyStats,
    customerStats,
    loading,
    fetchFinancialRecords,
    fetchInvoices,
    fetchFinancialSummary,
    fetchOccupancyStats,
    fetchCustomerStats,
    generateFinancialReport,
  } = useFinancialStore()

  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedDateRange, setSelectedDateRange] = useState('current_month')
  const [chartData, setChartData] = useState<any[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadReportData()
  }, [selectedPeriod, selectedDateRange])

  const loadReportData = async () => {
    await loadReportDataWithDates()
  }

  const getDateRange = (range: string) => {
    const now = new Date()
    
    switch (range) {
      case 'current_month':
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        }
      case 'last_month':
        const lastMonth = subMonths(now, 1)
        return {
          startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd'),
        }
      case 'current_year':
        return {
          startDate: format(startOfYear(now), 'yyyy-MM-dd'),
          endDate: format(endOfYear(now), 'yyyy-MM-dd'),
        }
      case 'last_7_days':
        return {
          startDate: format(subDays(now, 7), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        }
      case 'last_30_days':
        return {
          startDate: format(subDays(now, 30), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        }
      case 'last_90_days':
        return {
          startDate: format(subDays(now, 90), 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd'),
        }
      default:
        return {
          startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        }
    }
  }

  const handleCustomDateChange = (startDate: string, endDate: string) => {
    loadReportDataWithDates(startDate, endDate)
  }

  const loadReportDataWithDates = async (startDate?: string, endDate?: string) => {
    setIsRefreshing(true)
    
    try {
      const dateRange = startDate && endDate ? { startDate, endDate } : getDateRange(selectedDateRange)
      
      await Promise.all([
        fetchFinancialRecords(dateRange.startDate, dateRange.endDate),
        fetchInvoices(),
        fetchFinancialSummary(selectedPeriod),
        fetchOccupancyStats(selectedPeriod),
        fetchCustomerStats(selectedPeriod),
      ])
      
      generateChartData()
      toast.success('Data refreshed successfully')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const generateChartData = () => {
    // Generate monthly revenue/expense trend
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthStr = format(date, 'MMM yyyy')
      
      const monthlyRevenue = financialRecords
        .filter(r => r.type === 'revenue' && format(new Date(r.transaction_date), 'MMM yyyy') === monthStr)
        .reduce((sum, r) => sum + r.amount, 0)
      
      const monthlyExpenses = financialRecords
        .filter(r => r.type === 'expense' && format(new Date(r.transaction_date), 'MMM yyyy') === monthStr)
        .reduce((sum, r) => sum + r.amount, 0)
      
      monthlyData.push({
        month: monthStr,
        revenue: monthlyRevenue,
        expenses: monthlyExpenses,
        profit: monthlyRevenue - monthlyExpenses,
      })
    }
    
    setChartData(monthlyData)
  }



  const getRevenueByProperty = () => {
    const propertyData = financialRecords
      .filter(r => r.type === 'revenue' && r.property)
      .reduce((acc, record) => {
        const propertyName = record.property?.title || 'Unknown Property'
        acc[propertyName] = (acc[propertyName] || 0) + record.amount
        return acc
      }, {} as Record<string, number>)
    
    return Object.entries(propertyData).map(([property, amount]) => ({
      name: property,
      value: amount,
    }))
  }

  const getRevenueByCustomerType = () => {
    const customerTypeData = financialRecords
      .filter(r => r.type === 'revenue' && r.customer)
      .reduce((acc, record) => {
        // This would ideally come from customer data
        const customerType = 'Regular' // Placeholder - would need customer type from database
        acc[customerType] = (acc[customerType] || 0) + record.amount
        return acc
      }, {} as Record<string, number>)
    
    return Object.entries(customerTypeData).map(([type, amount]) => ({
      name: type,
      value: amount,
    }))
  }

  const getKPIMetrics = () => {
    const totalRevenue = financialSummary?.total_revenue || 0
    const totalUnits = occupancyStats?.total_units || 1
    const occupiedUnits = occupancyStats?.occupied_units || 0
    const totalCustomers = customerStats?.total_customers || 1
    
    return {
      revPAR: totalRevenue / totalUnits, // Revenue per Available Room
      adr: occupiedUnits > 0 ? totalRevenue / occupiedUnits : 0, // Average Daily Rate
      clv: customerStats?.average_customer_value || 0, // Customer Lifetime Value
      conversionRate: customerStats?.lead_conversion_rate || 0,
    }
  }

  const getMonthlyComparison = () => {
    const currentMonth = new Date()
    const lastMonth = subMonths(currentMonth, 1)
    
    const currentRevenue = financialRecords
      .filter(r => r.type === 'revenue' && 
        format(new Date(r.transaction_date), 'yyyy-MM') === format(currentMonth, 'yyyy-MM'))
      .reduce((sum, r) => sum + r.amount, 0)
    
    const lastRevenue = financialRecords
      .filter(r => r.type === 'revenue' && 
        format(new Date(r.transaction_date), 'yyyy-MM') === format(lastMonth, 'yyyy-MM'))
      .reduce((sum, r) => sum + r.amount, 0)
    
    const growth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0
    
    return {
      current: currentRevenue,
      previous: lastRevenue,
      growth,
      isPositive: growth >= 0
    }
  }

  const COLORS = ['#1B4DFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
  const kpiMetrics = getKPIMetrics()
  const monthlyComparison = getMonthlyComparison()
  const revenueByProperty = getRevenueByProperty()
  const revenueByCustomerType = getRevenueByCustomerType()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive financial analytics and reporting</p>
        </div>
        
        <div className="flex items-center gap-3">
          <PdfExportButton 
            reportTitle="Financial Reports"
            reportElementId="financial-report-content"
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        selectedPeriod={selectedPeriod}
        selectedDateRange={selectedDateRange}
        onPeriodChange={setSelectedPeriod}
        onDateRangeChange={setSelectedDateRange}
        onCustomDateChange={handleCustomDateChange}
        loading={loading || isRefreshing}
      />

      <div id="financial-report-content" className="space-y-6">
        {/* Summary Cards */}
        <FinancialSummaryCards
          financialSummary={financialSummary}
          occupancyStats={occupancyStats}
          loading={loading || isRefreshing}
        />

        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">RevPAR</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpiMetrics.revPAR.toLocaleString('en-BH', {
                      style: 'currency',
                      currency: 'BHD',
                      minimumFractionDigits: 0
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Revenue per Available Unit</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ADR</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpiMetrics.adr.toLocaleString('en-BH', {
                      style: 'currency',
                      currency: 'BHD',
                      minimumFractionDigits: 0
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Average Daily Rate</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">CLV</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpiMetrics.clv.toLocaleString('en-BH', {
                      style: 'currency',
                      currency: 'BHD',
                      minimumFractionDigits: 0
                    })}
                  </p>
                  <p className="text-xs text-gray-500">Customer Lifetime Value</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {kpiMetrics.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Lead to Customer</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Growth Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyComparison.current.toLocaleString('en-BH', {
                    style: 'currency',
                    currency: 'BHD'
                  })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Last Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {monthlyComparison.previous.toLocaleString('en-BH', {
                    style: 'currency',
                    currency: 'BHD'
                  })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Growth</p>
                <div className="flex items-center justify-center gap-2">
                  {monthlyComparison.isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  <p className={`text-2xl font-bold ${
                    monthlyComparison.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(monthlyComparison.growth).toFixed(1)}%
                  </p>
                </div>
                <Badge 
                  variant={monthlyComparison.isPositive ? 'default' : 'destructive'}
                  className="mt-1"
                >
                  {monthlyComparison.isPositive ? 'Growth' : 'Decline'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Expenses Trend */}
          <RevenueChart
            data={chartData}
            loading={loading || isRefreshing}
          />

          {/* Revenue by Property */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Property</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByProperty.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueByProperty}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueByProperty.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={([value]) => [
                        `${Number(value).toLocaleString('en-BH', {
                          style: 'currency',
                          currency: 'BHD'
                        })}`,
                        'Revenue'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No property revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Booking Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Volume Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={([value]) => [
                      `${Number(value).toLocaleString('en-BH', {
                        style: 'currency',
                        currency: 'BHD'
                      })}`,
                      'Revenue'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1B4DFF" 
                    fill="#1B4DFF" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Acquisition Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Acquisition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Customers</span>
                  <span className="text-lg font-bold text-gray-900">
                    {customerStats?.total_customers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">New This Period</span>
                  <span className="text-lg font-bold text-green-600">
                    +{customerStats?.new_customers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Active Customers</span>
                  <span className="text-lg font-bold text-blue-600">
                    {customerStats?.active_customers || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Lead Conversion</span>
                  <span className="text-lg font-bold text-purple-600">
                    {customerStats?.lead_conversion_rate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg. Customer Value</span>
                  <span className="text-lg font-bold text-orange-600">
                    {(customerStats?.average_customer_value || 0).toLocaleString('en-BH', {
                      style: 'currency',
                      currency: 'BHD',
                      minimumFractionDigits: 0
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Status and Customer Analytics */}
        <InvoiceStatusChart
          invoices={invoices}
          loading={loading || isRefreshing}
        />

        {/* Occupancy and Customer Reports */}
        <OccupancyReport
          occupancyStats={occupancyStats}
          customerStats={customerStats}
          loading={loading || isRefreshing}
        />

        {/* Recent Financial Records */}
        <RecentTransactions
          transactions={financialRecords}
          loading={loading || isRefreshing}
          maxItems={15}
          onViewAll={() => {
            // Navigate to full transactions page (to be implemented)
            toast('Full transactions view coming soon!', { icon: 'ℹ️' })
          }}
        />
      </div>
    </div>
  )
}

export default FinancialReportsPage
