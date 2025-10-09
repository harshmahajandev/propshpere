import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building, 
  Calendar, 
  Users, 
  TrendingUp, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  FileText,
  Home,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { usePropertyStore } from '@/stores/property-store'
import { useReservationStore } from '@/stores/reservation-store'
import { useFinancialStore } from '@/stores/financial-store'
import { useCustomerStore } from '@/stores/customer-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, BarChart, Bar } from 'recharts'
import { Link } from 'react-router-dom'
import { format, subMonths } from 'date-fns'

const DashboardPage = () => {
  const { properties, loading: propertiesLoading, fetchProperties } = usePropertyStore()
  const { reservations, loading: reservationsLoading, fetchReservations } = useReservationStore()
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
  const { customers, loading: customersLoading, fetchCustomers } = useCustomerStore()
  
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      await Promise.all([
        fetchProperties(),
        fetchReservations(),
        fetchFinancialSummary('monthly'),
        fetchOccupancyStats('monthly'),
        fetchCustomerStats('monthly'),
        fetchFinancialRecords(),
        fetchInvoices(),
        fetchCustomers()
      ])
    }
    
    loadDashboardData()
  }, [])

  useEffect(() => {
    generateChartData()
  }, [financialRecords])

  const generateChartData = () => {
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthStr = format(date, 'MMM yyyy')
      
      const monthlyRevenue = financialRecords
        .filter(r => r.type === 'revenue' && format(new Date(r.transaction_date), 'MMM yyyy') === monthStr)
        .reduce((sum, r) => sum + r.amount, 0)
      
      const monthlyBookings = reservations
        .filter(r => format(new Date(r.created_at), 'MMM yyyy') === monthStr)
        .length
      
      monthlyData.push({
        month: monthStr,
        revenue: monthlyRevenue,
        bookings: monthlyBookings,
      })
    }
    
    setChartData(monthlyData)
  }

  // Calculate comprehensive statistics
  const totalProperties = properties.length
  const availableProperties = properties.filter(p => p.status === 'available').length
  const totalReservations = reservations.length
  const pendingReservations = reservations.filter(r => r.status === 'pending').length
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length
  const totalValue = properties.reduce((sum, p) => sum + p.price, 0)
  
  // Financial metrics
  const totalRevenue = financialSummary?.total_revenue || 0
  const totalExpenses = financialSummary?.total_expenses || 0
  const netProfit = financialSummary?.net_profit || 0
  const occupancyRate = occupancyStats?.occupancy_rate || 0
  
  // Customer metrics
  const totalCustomers = customerStats?.total_customers || 0
  const newCustomers = customerStats?.new_customers || 0
  const conversionRate = customerStats?.lead_conversion_rate || 0
  
  // Invoice metrics
  const paidInvoices = invoices.filter(i => i.status === 'paid').length
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length
  const totalInvoiceValue = invoices.reduce((sum, i) => sum + (i.total_amount || i.amount), 0)
  
  const recentReservations = reservations
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const topProperties = properties
    .filter(p => p.status === 'available')
    .sort((a, b) => b.price - a.price)
    .slice(0, 5)

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue, 'BHD'),
      icon: DollarSign,
      color: 'green',
      trend: `${netProfit >= 0 ? '+' : ''}${((netProfit / (totalRevenue || 1)) * 100).toFixed(1)}% profit margin`,
      link: '/financial-reports'
    },
    {
      title: 'Total Properties',
      value: totalProperties.toString(),
      icon: Building,
      color: 'blue',
      trend: `${availableProperties} available (${Math.round((availableProperties / (totalProperties || 1)) * 100)}%)`,
      link: '/properties'
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate.toFixed(1)}%`,
      icon: Home,
      color: 'purple',
      trend: `${occupancyStats?.occupied_units || 0}/${occupancyStats?.total_units || 0} units occupied`,
      link: '/unit-availability'
    },
    {
      title: 'Active Customers',
      value: totalCustomers.toString(),
      icon: Users,
      color: 'orange',
      trend: `+${newCustomers} new this month (${conversionRate.toFixed(1)}% conversion)`,
      link: '/customer-management'
    }
  ]

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  if (propertiesLoading || reservationsLoading || financialLoading || customersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Executive Dashboard</h1>
            <p className="text-gray-600">Comprehensive business intelligence and performance overview</p>
          </div>
          <div className="flex items-center gap-3 mt-4 lg:mt-0">
            <Link to="/financial-reports">
              <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">
                <FileText className="h-4 w-4 mr-1" />
                Financial Reports
              </Badge>
            </Link>
            <Link to="/customer-management">
              <Badge variant="outline" className="cursor-pointer hover:bg-green-50">
                <UserPlus className="h-4 w-4 mr-1" />
                CRM System
              </Badge>
            </Link>
            <Link to="/unit-availability">
              <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">
                <Calendar className="h-4 w-4 mr-1" />
                Unit Availability
              </Badge>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Link to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
                    </div>
                    <div className={cn(
                      'p-3 rounded-lg',
                      colorClasses[stat.color as keyof typeof colorClasses]
                    )}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Business Intelligence Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue & Booking Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Revenue & Booking Trends</span>
                <Link to="/financial-reports">
                  <ArrowUpRight className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={([value, name]) => [
                      name === 'revenue' 
                        ? `${Number(value).toLocaleString('en-BH', { style: 'currency', currency: 'BHD' })}`
                        : value,
                      name === 'revenue' ? 'Revenue' : 'Bookings'
                    ]}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#1B4DFF" 
                    fill="#1B4DFF" 
                    fillOpacity={0.1}
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Alerts & KPIs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Business Alerts & Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Occupancy Alert */}
                <div className={`p-3 rounded-lg ${
                  occupancyRate < 70 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {occupancyRate < 70 ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      occupancyRate < 70 ? 'text-red-800' : 'text-green-800'
                    }`}>
                      Occupancy Rate: {occupancyRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    occupancyRate < 70 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {occupancyRate < 70 
                      ? 'Below target. Consider marketing campaigns.' 
                      : 'Above target. Excellent performance!'}
                  </p>
                </div>

                {/* Invoice Alert */}
                <div className={`p-3 rounded-lg ${
                  overdueInvoices > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {overdueInvoices > 0 ? (
                      <Clock className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      overdueInvoices > 0 ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      Overdue Invoices: {overdueInvoices}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    overdueInvoices > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {overdueInvoices > 0 
                      ? 'Follow up required for payment collection.' 
                      : 'All invoices are up to date!'}
                  </p>
                </div>

                {/* Lead Conversion */}
                <div className={`p-3 rounded-lg ${
                  conversionRate < 20 ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Lead Conversion: {conversionRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-blue-600">
                    {conversionRate < 20 
                      ? 'Below industry average. Review lead quality.' 
                      : 'Good conversion rate. Keep up the momentum!'}
                  </p>
                </div>

                {/* Revenue Performance */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Monthly Revenue</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalRevenue, 'BHD')}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Net Profit</p>
                    <p className={`text-lg font-bold ${
                      netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(netProfit, 'BHD')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
        {/* Recent Reservations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reservations</h3>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    pendingReservations > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  )}>
                    <Clock className="h-3 w-3 mr-1" />
                    {pendingReservations} pending
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentReservations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No reservations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReservations.map((reservation) => {
                    const property = properties.find(p => p.id === reservation.property_id)
                    return (
                      <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{reservation.customer_name}</p>
                          <p className="text-sm text-gray-600">{property?.title || 'Unknown Property'}</p>
                          <p className="text-xs text-gray-500">{formatDate(reservation.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          )}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Properties */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Premium Properties</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {topProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No properties available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProperties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img
                          src={property.images?.[0] || '/placeholder-property.jpg'}
                          alt={property.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder-property.jpg'
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{property.title}</p>
                          <p className="text-sm text-gray-600">{property.project}</p>
                          <p className="text-xs text-gray-500">{property.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(property.price, property.currency)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {property.available_units}/{property.total_units} available
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reservation Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Reservation Status Overview</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingReservations}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{confirmedReservations}</div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reservations.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {reservations.filter(r => r.status === 'cancelled').length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default DashboardPage