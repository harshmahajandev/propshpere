import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'

import { Receipt, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { type Invoice } from '@/lib/supabase'

interface InvoiceStatusChartProps {
  invoices: Invoice[]
  loading?: boolean
}

const COLORS = {
  paid: '#10B981',
  sent: '#1B4DFF', 
  overdue: '#EF4444',
  draft: '#F59E0B',
  viewed: '#8B5CF6',
  cancelled: '#6B7280'
}

const STATUS_ICONS = {
  paid: CheckCircle,
  sent: Clock,
  overdue: AlertCircle,
  draft: Receipt,
  viewed: Receipt,
  cancelled: Receipt
}

export const InvoiceStatusChart: React.FC<InvoiceStatusChartProps> = ({ invoices, loading = false }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Distribution</CardTitle>
          <CardDescription>Current status of all invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const getInvoiceStatusData = () => {
    const statusData = invoices.reduce((acc, invoice) => {
      const status = invoice.status
      acc[status] = acc[status] || { count: 0, amount: 0 }
      acc[status].count += 1
      acc[status].amount += invoice.total_amount || invoice.amount
      return acc
    }, {} as Record<string, { count: number; amount: number }>)
    
    return Object.entries(statusData).map(([status, data]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: data.count,
      amount: data.amount,
      color: COLORS[status as keyof typeof COLORS] || '#6B7280',
      status: status
    }))
  }

  const statusData = getInvoiceStatusData()
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || inv.amount), 0)
  const paidAmount = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total_amount || inv.amount), 0)
  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.total_amount || inv.amount), 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Invoice Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Invoice Status Distribution
          </CardTitle>
          <CardDescription>Current status of all invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="w-full space-y-3">
              {statusData.map((item, index) => {
                const maxValue = Math.max(...statusData.map(d => d.value))
                const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="font-semibold">{item.value} invoices</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {statusData.map((item, index) => {
              const IconComponent = STATUS_ICONS[item.status as keyof typeof STATUS_ICONS]
              return (
                <div key={index} className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <IconComponent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.value}</Badge>
                    <span className="text-xs text-gray-500">
                      {item.amount.toLocaleString('en-BH', {
                        style: 'currency',
                        currency: 'BHD',
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Invoice Summary
          </CardTitle>
          <CardDescription>Key invoice metrics and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalInvoices}</div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {totalAmount.toLocaleString('en-BH', {
                    style: 'currency',
                    currency: 'BHD',
                  })}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
            
            {/* Payment Status */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Paid Amount</span>
                </div>
                <div className="text-green-600 font-semibold">
                  {paidAmount.toLocaleString('en-BH', {
                    style: 'currency',
                    currency: 'BHD',
                  })}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Overdue Amount</span>
                </div>
                <div className="text-red-600 font-semibold">
                  {overdueAmount.toLocaleString('en-BH', {
                    style: 'currency',
                    currency: 'BHD',
                  })}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Outstanding</span>
                </div>
                <div className="text-yellow-600 font-semibold">
                  {(totalAmount - paidAmount).toLocaleString('en-BH', {
                    style: 'currency',
                    currency: 'BHD',
                  })}
                </div>
              </div>
            </div>
            
            {/* Collection Rate */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">Collection Performance</div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Collection Rate</span>
                <Badge 
                  variant="outline" 
                  className={`${
                    (paidAmount / totalAmount) * 100 > 80 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InvoiceStatusChart