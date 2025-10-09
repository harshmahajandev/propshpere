import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ArrowUpRight, ArrowDownLeft, Eye, Download } from 'lucide-react'
import { format } from 'date-fns'
import { type FinancialRecord } from '@/lib/supabase'

interface RecentTransactionsProps {
  transactions: FinancialRecord[]
  loading?: boolean
  onViewAll?: () => void
  maxItems?: number
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  loading = false,
  onViewAll,
  maxItems = 10
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Financial Records</CardTitle>
          <CardDescription>Latest financial transactions and records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayTransactions = transactions.slice(0, maxItems)

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-BH', {
      style: 'currency',
      currency: 'BHD',
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'revenue':
      case 'payment':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'expense':
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'revenue':
      case 'payment':
        return 'text-green-600'
      case 'expense':
      case 'refund':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'revenue':
      case 'payment':
        return 'bg-green-100 text-green-800'
      case 'expense':
      case 'refund':
        return 'bg-red-100 text-red-800'
      case 'commission':
        return 'bg-blue-100 text-blue-800'
      case 'fee':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Financial Records
            </CardTitle>
            <CardDescription>Latest financial transactions and records</CardDescription>
          </div>
          <div className="flex gap-2">
            {onViewAll && (
              <Button variant="outline" size="sm" onClick={onViewAll}>
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            )}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-600">Date</th>
                    <th className="text-left p-3 font-medium text-gray-600">Type</th>
                    <th className="text-left p-3 font-medium text-gray-600">Category</th>
                    <th className="text-left p-3 font-medium text-gray-600">Description</th>
                    <th className="text-right p-3 font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTransactions.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(record.type)}
                          <span className="text-sm font-medium">
                            {format(new Date(record.transaction_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 ml-6">
                          {format(new Date(record.transaction_date), 'HH:mm')}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          className={getBadgeVariant(record.type)}
                        >
                          {record.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="capitalize text-gray-700">
                          {record.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs">
                          <p className="text-gray-900 truncate">{record.description}</p>
                          {record.reference_number && (
                            <p className="text-xs text-gray-500 mt-1">
                              Ref: {record.reference_number}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className={`font-semibold ${getTransactionColor(record.type)}`}>
                          {['revenue', 'payment'].includes(record.type) ? '+' : '-'}
                          {formatCurrency(record.amount)}
                        </div>
                        {record.payment_method && (
                          <div className="text-xs text-gray-500 capitalize">
                            {record.payment_method}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {displayTransactions.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(record.type)}
                      <Badge className={getBadgeVariant(record.type)}>
                        {record.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className={`font-semibold ${getTransactionColor(record.type)}`}>
                      {['revenue', 'payment'].includes(record.type) ? '+' : '-'}
                      {formatCurrency(record.amount)}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{record.description}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {record.category.replace('_', ' ')}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{format(new Date(record.transaction_date), 'MMM dd, yyyy HH:mm')}</span>
                      {record.reference_number && (
                        <span>Ref: {record.reference_number}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {transactions.length > maxItems && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing {maxItems} of {transactions.length} transactions
                </p>
                {onViewAll && (
                  <Button variant="link" size="sm" onClick={onViewAll} className="mt-2">
                    View all {transactions.length} transactions
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentTransactions