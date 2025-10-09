import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserPlusIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { useLeadStore } from '../store/leadStore'
import { usePropertyStore } from '../store/propertyStore'
import { useFinancialStore } from '../stores/financial-store'
import { useCustomerStore } from '../stores/customer-store'
import { useReservationStore } from '../stores/reservation-store'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import { format, subMonths } from 'date-fns'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ComponentType<any>
  color: string
  link?: string
}

function StatCard({ title, value, change, icon: Icon, color, link }: StatCardProps) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white overflow-hidden shadow rounded-lg card-hover h-full"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change.type === 'increase' ? (
                      <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                    ) : (
                      <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                    )}
                    <span className="ml-1">{Math.abs(change.value)}%</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return link ? <Link to={link}>{content}</Link> : content
}

export default function BusinessDashboard() {
  const { leads, fetchLeads, isLoading: leadsLoading } = useLeadStore()
  const { properties, fetchProperties, isLoading: propertiesLoading } = usePropertyStore()
  const { 
    financialSummary, 
    occupancyStats, 
    customerStats, 
    financialRecords,
    invoices,
    loading: financialLoading, 
    fetchFinancialSummary,
    fetchOccupancyStats,
    fetchCustomerStats,
    fetchFinancialRecords,
    fetchInvoices
  } = useFinancialStore()
  const { customers, fetchCustomers, loading: customersLoading } = useCustomerStore()
  const { reservations, fetchReservations, loading: reservationsLoading } = useReservationStore()
  
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      await Promise.all([
        fetchLeads(),
        fetchProperties(),
        fetchFinancialSummary('monthly'),
        fetchOccupancyStats('monthly'),
        fetchCustomerStats('monthly'),
        fetchFinancialRecords(),
        fetchInvoices(),
        fetchCustomers(),
        fetchReservations()
      ])
    }
    
    loadDashboardData()
  }, [])

  useEffect(() => {
    generateChartData()
  }, [financialRecords, reservations, leads])

  const generateChartData = () => {
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthStr = format(date, 'MMM yyyy')
      
      // Real revenue data from financial records
      const monthlyRevenue = financialRecords
        .filter(r => r.type === 'revenue' && format(new Date(r.transaction_date), 'MMM yyyy') === monthStr)
        .reduce((sum, r) => sum + r.amount, 0)
      
      // Real expense data
      const monthlyExpenses = financialRecords
        .filter(r => r.type === 'expense' && format(new Date(r.transaction_date), 'MMM yyyy') === monthStr)
        .reduce((sum, r) => sum + r.amount, 0)
      
      // Real reservation/booking data
      const monthlyBookings = reservations
        .filter(r => format(new Date(r.created_at), 'MMM yyyy') === monthStr)
        .length
      
      // Real leads data
      const monthlyLeads = leads
        .filter(l => format(new Date(l.created_at), 'MMM yyyy') === monthStr)
        .length
      
      monthlyData.push({
        month: monthStr,
        revenue: monthlyRevenue,
        expenses: monthlyExpenses,
        leads: monthlyLeads,
        bookings: monthlyBookings,
      })
    }
    
    setChartData(monthlyData)
  }

  // Calculate real business metrics from store data
  const totalLeads = leads.length
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
  const convertedLeads = leads.filter(l => l.status === 'converted').length
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
  
  const totalProperties = properties.length
  const availableProperties = properties.filter(p => p.status === 'available').length
  const occupancyRate = occupancyStats?.occupancy_rate || 0
  
  // Real financial metrics from financial store
  const totalRevenue = financialSummary?.total_revenue || 0
  const totalExpenses = financialSummary?.total_expenses || 0
  const netProfit = financialSummary?.net_profit || 0
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
  
  // Real customer metrics
  const totalCustomers = customers.length
  const newCustomersThisMonth = customerStats?.new_customers || 0
  const customerGrowth = customerStats?.lead_conversion_rate || 0

  // Real reservations data
  const totalReservations = reservations.length
  const pendingReservations = reservations.filter(r => r.status === 'pending').length
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length
  
  // Recent activities with real data
  const recentActivities = [
    // Recent customers
    ...customers.slice(0, 2).map(customer => ({
      type: 'customer',
      title: 'New Customer Added',
      description: `${customer.full_name || customer.email} joined the system`,
      time: format(new Date(customer.created_at), 'MMM dd, yyyy'),
      priority: 'high',
      amount: ''
    })),
    
    // Recent leads
    ...leads.slice(0, 2).map(lead => ({
      type: 'lead',
      title: `${lead.status === 'qualified' ? 'Lead Qualified' : 'New Lead'}`,
      description: `${lead.first_name} ${lead.last_name} - ${lead.buyer_type || 'General'} buyer`,
      time: format(new Date(lead.created_at), 'MMM dd, yyyy'),
      priority: lead.status === 'qualified' ? 'high' : 'medium',
      amount: lead.budget_max ? `Up to ${lead.currency} ${lead.budget_max.toLocaleString()}` : ''
    })),
    
    // Recent reservations
    ...reservations.slice(0, 2).map(reservation => ({
      type: 'booking',
      title: 'New Reservation',
      description: `${reservation.customer_name} - Property booking`,
      time: format(new Date(reservation.created_at), 'MMM dd, yyyy'),
      priority: 'medium',
      amount: reservation.budget_max ? `BHD ${reservation.budget_max.toLocaleString()}` : ''
    })),
    
    // Recent invoices
    ...invoices.filter(i => i.status === 'paid').slice(0, 1).map(invoice => ({
      type: 'invoice',
      title: 'Payment Received',
      description: `Invoice ${invoice.invoice_number} paid`,
      time: format(new Date(invoice.payment_date || invoice.created_at), 'MMM dd, yyyy'),
      priority: 'low',
      amount: `BHD ${invoice.total_amount.toLocaleString()}`
    }))
  ].slice(0, 4) // Limit to 4 most recent

  if (leadsLoading || propertiesLoading || financialLoading || customersLoading || reservationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading business dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Executive Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-diyar-blue to-blue-600 rounded-2xl shadow-xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Executive Business Dashboard 📊
            </h1>
            <p className="text-blue-100 text-lg mb-4">
              Real-time business intelligence and performance overview
            </p>
            <div className="flex items-center gap-4">
              <Link to="/financial-reports" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5" />
                Financial Reports
              </Link>
              <Link to="/customer-management" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <UserPlusIcon className="h-5 w-5" />
                CRM System
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-16 w-16 text-white/80" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={totalRevenue > 0 ? `${(totalRevenue / 1000).toFixed(0)}K BHD` : 'No Data'}
          change={totalRevenue > 0 ? { value: Math.abs(profitMargin), type: profitMargin >= 0 ? 'increase' : 'decrease' } : undefined}
          icon={CurrencyDollarIcon}
          color="bg-green-500"
          link="/financial-reports"
        />
        <StatCard
          title="Active Customers"
          value={totalCustomers}
          change={customerGrowth > 0 ? { value: Math.abs(customerGrowth), type: customerGrowth >= 0 ? 'increase' : 'decrease' } : undefined}
          icon={UserGroupIcon}
          color="bg-blue-500"
          link="/customer-management"
        />
        <StatCard
          title="Property Portfolio"
          value={`${totalProperties} Units`}
          change={occupancyRate > 0 ? { value: occupancyRate, type: 'increase' } : undefined}
          icon={BuildingOfficeIcon}
          color="bg-purple-500"
          link="/properties"
        />
        <StatCard
          title="Lead Conversion"
          value={`${conversionRate.toFixed(1)}%`}
          change={conversionRate > 0 ? { value: Math.abs(conversionRate - 20), type: conversionRate > 20 ? 'increase' : 'decrease' } : undefined}
          icon={ChartBarIcon}
          color="bg-orange-500"
          link="/customer-management"
        />
      </div>

      {/* Business Intelligence Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue & Expense Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Revenue vs Expenses</h3>
            <Link to="/financial-reports" className="text-gray-400 hover:text-diyar-blue">
              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`BHD ${Number(value).toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1B4DFF" fill="#1B4DFF" fillOpacity={0.8} />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Leads & Bookings Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Leads & Bookings Activity</h3>
            <Link to="/customer-management" className="text-gray-400 hover:text-diyar-blue">
              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="leads" fill="#10B981" name="New Leads" />
              <Bar dataKey="bookings" fill="#8B5CF6" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Business Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white shadow rounded-lg"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Business Activity
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
                const typeColors = {
                  customer: 'bg-green-100 text-green-600',
                  lead: 'bg-blue-100 text-blue-600',
                  booking: 'bg-purple-100 text-purple-600',
                  invoice: 'bg-yellow-100 text-yellow-600',
                }
                
                const priorityColors = {
                  high: 'border-l-red-500',
                  medium: 'border-l-yellow-500',
                  low: 'border-l-green-500',
                }

                return (
                  <div key={index} className={`border-l-4 ${priorityColors[activity.priority as keyof typeof priorityColors]} p-4 hover:bg-gray-50 transition-colors`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeColors[activity.type as keyof typeof typeColors]}`}>
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </span>
                          <span className="text-sm text-gray-500">{activity.time}</span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                      </div>
                      {activity.amount && (
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">{activity.amount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No recent activity to display</p>
                  <p className="text-sm mt-1">Data will appear as the system is used</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions & Insights */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white shadow rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/customer-management" className="w-full bg-diyar-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block">
                📝 Add New Lead
              </Link>
              <Link to="/reservations" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center block">
                🏠 New Booking
              </Link>
              <Link to="/financial-reports" className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-center block">
                📊 Generate Report
              </Link>
            </div>
          </motion.div>

          {/* Business Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white shadow rounded-lg p-6"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              🤖 Business Insights
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-sm font-medium text-green-800">
                  Revenue: BHD {totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {profitMargin >= 0 ? `+${profitMargin.toFixed(1)}%` : `${profitMargin.toFixed(1)}%`} profit margin
                </p>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm font-medium text-blue-800">
                  {qualifiedLeads} qualified leads ready
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {conversionRate.toFixed(1)}% conversion rate
                </p>
              </div>
              
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                <p className="text-sm font-medium text-purple-800">
                  Occupancy rate: {occupancyRate.toFixed(1)}%
                </p>
                <p className="text-sm text-purple-700 mt-1">
                  {availableProperties} units available
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
