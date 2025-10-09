import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'

import { Home, Users, TrendingUp } from 'lucide-react'
import { type OccupancyStats, type CustomerStats } from '@/lib/supabase'

interface OccupancyReportProps {
  occupancyStats: OccupancyStats | null
  customerStats: CustomerStats | null
  loading?: boolean
}

const COLORS = ['#1B4DFF', '#10B981', '#F59E0B', '#EF4444']

export const OccupancyReport: React.FC<OccupancyReportProps> = ({ 
  occupancyStats, 
  customerStats, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Occupancy & Customer Analytics</CardTitle>
          <CardDescription>Current occupancy metrics and customer insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const occupancyData = occupancyStats ? [
    { name: 'Available', value: occupancyStats.available_units, color: '#10B981' },
    { name: 'Occupied', value: occupancyStats.occupied_units, color: '#1B4DFF' },
    { name: 'Maintenance', value: occupancyStats.maintenance_units, color: '#F59E0B' },
  ] : []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Occupancy Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Unit Occupancy Distribution
          </CardTitle>
          <CardDescription>Current status of all property units</CardDescription>
        </CardHeader>
        <CardContent>
          {occupancyStats ? (
            <>
              <div className="mb-4">
                <div className="text-3xl font-bold text-purple-600">
                  {occupancyStats.occupancy_rate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">
                  {occupancyStats.occupied_units} of {occupancyStats.total_units} units occupied
                </p>
              </div>
              
              <div className="h-[200px] flex items-center justify-center">
                <div className="w-full space-y-3">
                  {occupancyData.map((item, index) => {
                    const totalUnits = occupancyData.reduce((sum, d) => sum + d.value, 0)
                    const percentage = totalUnits > 0 ? (item.value / totalUnits) * 100 : 0
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="font-semibold">{item.value} units ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(item.value / Math.max(...occupancyData.map(d => d.value))) * 100}%`,
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
                {occupancyData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <Badge variant="secondary">{item.value} units</Badge>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">No occupancy data available</div>
          )}
        </CardContent>
      </Card>

      {/* Customer Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Analytics
          </CardTitle>
          <CardDescription>Key customer metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          {customerStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {customerStats.total_customers}
                  </div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {customerStats.new_customers}
                  </div>
                  <div className="text-sm text-gray-600">New This Period</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Customers</span>
                  <Badge variant="default">{customerStats.active_customers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Lead Conversion Rate</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {customerStats.lead_conversion_rate}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg Customer Value</span>
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
                    {customerStats.average_customer_value.toLocaleString('en-BH', {
                      style: 'currency',
                      currency: 'BHD',
                    })}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Performance Indicators</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Conversion: {customerStats.lead_conversion_rate > 15 ? 'Good' : 'Needs Improvement'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Growth: {customerStats.new_customers > 5 ? 'Growing' : 'Stable'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No customer data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default OccupancyReport