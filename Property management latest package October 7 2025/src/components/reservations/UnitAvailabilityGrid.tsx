import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calendar as CalendarIcon,
  Home,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  Wrench,
  XCircle
} from 'lucide-react'
import { format, addDays, isSameDay } from 'date-fns'
import { supabase, type PropertyUnit, type UnitAvailability, type Property } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface UnitAvailabilityGridProps {
  propertyId?: string
}

const STATUS_CONFIG = {
  available: {
    color: 'bg-green-500',
    textColor: 'text-green-800',
    bgColor: 'bg-green-100',
    label: 'Available',
    icon: CheckCircle
  },
  booked: {
    color: 'bg-red-500',
    textColor: 'text-red-800',
    bgColor: 'bg-red-100',
    label: 'Booked/Occupied',
    icon: XCircle
  },
  maintenance: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    label: 'Under Maintenance',
    icon: Wrench
  },
  out_of_service: {
    color: 'bg-gray-500',
    textColor: 'text-gray-800',
    bgColor: 'bg-gray-100',
    label: 'Out of Service',
    icon: AlertCircle
  },
  reserved: {
    color: 'bg-orange-500',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-100',
    label: 'Reserved/Hold',
    icon: Clock
  }
}

export const UnitAvailabilityGrid: React.FC<UnitAvailabilityGridProps> = ({ propertyId }) => {
  const [units, setUnits] = useState<PropertyUnit[]>([])
  const [availability, setAvailability] = useState<Record<string, UnitAvailability[]>>({})
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState(propertyId || '')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState(7) // Days to show
  const [filterStatus, setFilterStatus] = useState('all')
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [statusNotes, setStatusNotes] = useState('')

  useEffect(() => {
    if (!propertyId) {
      fetchProperties()
    }
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      fetchUnitsAndAvailability()
    }
  }, [selectedProperty, selectedDate, dateRange])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, total_units')
        .order('title')
      
      if (error) throw error
      setProperties(data || [])
      
      if (data && data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0].id)
      }
    } catch (error: any) {
      toast.error('Failed to fetch properties')
    }
  }

  const fetchUnitsAndAvailability = async () => {
    if (!selectedProperty) return
    
    setLoading(true)
    try {
      // Fetch units for the selected property
      const { data: unitsData, error: unitsError } = await supabase
        .from('property_units')
        .select('*')
        .eq('property_id', selectedProperty)
        .order('unit_number')
      
      if (unitsError) throw unitsError
      setUnits(unitsData || [])
      
      // Generate date range
      const dates = []
      for (let i = 0; i < dateRange; i++) {
        dates.push(format(addDays(selectedDate, i), 'yyyy-MM-dd'))
      }
      
      // Fetch availability for all units and date range
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('unit_availability')
        .select('*')
        .in('unit_id', (unitsData || []).map(unit => unit.id))
        .in('date', dates)
      
      if (availabilityError) throw availabilityError
      
      // Group availability by unit_id
      const availabilityByUnit: Record<string, UnitAvailability[]> = {}
      ;(availabilityData || []).forEach(avail => {
        if (!availabilityByUnit[avail.unit_id]) {
          availabilityByUnit[avail.unit_id] = []
        }
        availabilityByUnit[avail.unit_id].push(avail)
      })
      
      setAvailability(availabilityByUnit)
    } catch (error: any) {
      toast.error('Failed to fetch unit availability')
    } finally {
      setLoading(false)
    }
  }

  const getUnitStatusForDate = (unitId: string, date: string): string => {
    const unitAvailability = availability[unitId] || []
    const dayAvailability = unitAvailability.find(avail => avail.date === date)
    return dayAvailability?.status || 'available'
  }

  const updateUnitStatus = async () => {
    if (!selectedUnit || !newStatus) return
    
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      
      // Check if availability record exists for this unit and date
      const { data: existing, error: fetchError } = await supabase
        .from('unit_availability')
        .select('*')
        .eq('unit_id', selectedUnit.id)
        .eq('date', dateStr)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }
      
      const availabilityData = {
        unit_id: selectedUnit.id,
        date: dateStr,
        status: newStatus,
        notes: statusNotes,
        updated_by: 'current-user', // You would get this from auth context
      }
      
      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('unit_availability')
          .update({
            ...availabilityData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
        
        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('unit_availability')
          .insert(availabilityData)
        
        if (error) throw error
      }
      
      // Refresh data
      await fetchUnitsAndAvailability()
      
      setShowStatusUpdate(false)
      setSelectedUnit(null)
      setNewStatus('')
      setStatusNotes('')
      
      toast.success('Unit status updated successfully')
    } catch (error: any) {
      toast.error('Failed to update unit status')
    } finally {
      setLoading(false)
    }
  }

  const getDateHeaders = () => {
    const dates = []
    for (let i = 0; i < dateRange; i++) {
      dates.push(addDays(selectedDate, i))
    }
    return dates
  }

  const filteredUnits = units.filter(unit => {
    if (filterStatus === 'all') return true
    
    // Check if unit has the filtered status on the selected date
    const todayStatus = getUnitStatusForDate(unit.id, format(selectedDate, 'yyyy-MM-dd'))
    return todayStatus === filterStatus
  })

  const getAvailableUnitsCount = (date: string) => {
    return units.filter(unit => getUnitStatusForDate(unit.id, date) === 'available').length
  }

  const dates = getDateHeaders()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Unit Availability</h2>
          <p className="text-gray-600 mt-1">Real-time unit status and availability management</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchUnitsAndAvailability}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {!propertyId && (
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Property</label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title} ({property.total_units} units)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-48">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(selectedDate, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Days to Show</label>
          <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Filter Status</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const IconComponent = config.icon
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${config.color}`} />
                  <IconComponent className={`h-4 w-4 ${config.textColor}`} />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Availability Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {dates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const availableCount = getAvailableUnitsCount(dateStr)
          const totalUnits = units.length
          
          return (
            <Card key={dateStr}>
              <CardContent className="p-4 text-center">
                <h3 className="font-medium text-sm text-gray-600">
                  {format(date, 'MMM dd')}
                </h3>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-green-600">
                    {availableCount}
                  </div>
                  <div className="text-xs text-gray-500">
                    of {totalUnits} available
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Unit Availability Grid */}
      {selectedProperty && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Unit Availability Grid
            </CardTitle>
            <CardDescription>
              Click on any cell to update unit status for that date
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No units found for the selected filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-3 bg-gray-50 text-left font-medium text-gray-900">
                        Unit
                      </th>
                      {dates.map((date) => (
                        <th key={date.toISOString()} className="border p-3 bg-gray-50 text-center font-medium text-gray-900 min-w-[100px]">
                          <div>{format(date, 'MMM dd')}</div>
                          <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="border p-3 font-medium">
                          <div>
                            <div className="font-semibold">{unit.unit_number}</div>
                            {unit.unit_type && (
                              <div className="text-xs text-gray-500">{unit.unit_type}</div>
                            )}
                            {unit.bedrooms && (
                              <div className="text-xs text-gray-500">
                                {unit.bedrooms}BR / {unit.bathrooms}BA
                              </div>
                            )}
                          </div>
                        </td>
                        {dates.map((date) => {
                          const dateStr = format(date, 'yyyy-MM-dd')
                          const status = getUnitStatusForDate(unit.id, dateStr)
                          const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
                          const IconComponent = config.icon
                          
                          return (
                            <td
                              key={`${unit.id}-${dateStr}`}
                              className={`border p-3 text-center cursor-pointer hover:opacity-80 transition-opacity ${config.bgColor}`}
                              onClick={() => {
                                setSelectedUnit(unit)
                                setSelectedDate(date)
                                setNewStatus(status)
                                setShowStatusUpdate(true)
                              }}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <IconComponent className={`h-5 w-5 ${config.textColor}`} />
                                <span className={`text-xs font-medium ${config.textColor}`}>
                                  {config.label.split(' ')[0]}
                                </span>
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Update Dialog */}
      {showStatusUpdate && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Update Status - Unit {selectedUnit.unit_number}
            </h3>
            <p className="text-gray-600 mb-4">
              Date: {format(selectedDate, 'MMM dd, yyyy')}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes (Optional)</label>
                <Input
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Add notes about this status change"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusUpdate(false)
                    setSelectedUnit(null)
                    setNewStatus('')
                    setStatusNotes('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateUnitStatus}
                  disabled={loading || !newStatus}
                >
                  Update Status
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UnitAvailabilityGrid