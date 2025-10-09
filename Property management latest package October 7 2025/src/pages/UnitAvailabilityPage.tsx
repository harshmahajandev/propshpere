import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/select'
import { Calendar } from '../components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/select'
import { Textarea } from '../components/ui/select'
import { 
  Home, 
  Calendar as CalendarIcon, 
  Filter, 
  Grid3x3, 
  List, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Eye,
  Plus
} from 'lucide-react'
import { useUnitAvailabilityStore } from '../stores/unit-availability-store'
import { usePropertyStore } from '../stores/property-store'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { cn } from '../lib/utils'
import toast from 'react-hot-toast'

const UnitAvailabilityPage: React.FC = () => {
  const {
    units,
    availability,
    availabilityMap,
    loading,
    fetchUnits,
    fetchAllUnitsAvailability,
    updateUnitStatus,
    bulkUpdateUnitStatus,
    getAvailableUnitsCount,
    getUnitStatusColor,
  } = useUnitAvailabilityStore()
  
  const { properties, fetchProperties } = usePropertyStore()

  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  })
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false)
  const [bulkUpdateForm, setBulkUpdateForm] = useState({
    status: 'available',
    notes: '',
    dates: [] as Date[],
  })

  useEffect(() => {
    fetchProperties()
    fetchUnits()
  }, [])

  useEffect(() => {
    if (selectedProperty !== 'all') {
      fetchUnits(selectedProperty)
    } else {
      fetchUnits()
    }
  }, [selectedProperty])

  useEffect(() => {
    const startDate = format(dateRange.from, 'yyyy-MM-dd')
    const endDate = format(dateRange.to, 'yyyy-MM-dd')
    fetchAllUnitsAvailability(startDate, endDate)
  }, [dateRange])

  const filteredUnits = selectedProperty === 'all' 
    ? units 
    : units.filter(unit => unit.property_id === selectedProperty)

  const weekDays = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to,
  })

  const getUnitAvailabilityForDate = (unitId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const unitAvailability = availabilityMap.get(unitId) || []
    return unitAvailability.find(a => a.date === dateStr)
  }

  const getUnitStatusForDate = (unitId: string, date: Date) => {
    const availability = getUnitAvailabilityForDate(unitId, date)
    return availability?.status || 'available'
  }

  const handleUnitStatusChange = async (unitId: string, date: Date, status: string) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    try {
      await updateUnitStatus(unitId, dateStr, status)
    } catch (error) {
      // Error handled in store
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedUnits.length === 0 || bulkUpdateForm.dates.length === 0) {
      toast.error('Please select units and dates')
      return
    }

    try {
      const dateStrings = bulkUpdateForm.dates.map(date => format(date, 'yyyy-MM-dd'))
      await bulkUpdateUnitStatus(
        selectedUnits,
        dateStrings,
        bulkUpdateForm.status,
        bulkUpdateForm.notes
      )
      
      setSelectedUnits([])
      setBulkUpdateForm({
        status: 'available',
        notes: '',
        dates: [],
      })
      setShowBulkUpdateDialog(false)
    } catch (error) {
      // Error handled in store
    }
  }

  const toggleUnitSelection = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  const selectAllUnits = () => {
    if (selectedUnits.length === filteredUnits.length) {
      setSelectedUnits([])
    } else {
      setSelectedUnits(filteredUnits.map(unit => unit.id))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'booked':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'out_of_service':
        return <XCircle className="h-4 w-4 text-gray-600" />
      case 'reserved':
        return <Eye className="h-4 w-4 text-orange-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available'
      case 'booked': return 'Booked'
      case 'maintenance': return 'Maintenance'
      case 'out_of_service': return 'Out of Service'
      case 'reserved': return 'Reserved'
      default: return 'Available'
    }
  }

  const availableCount = weekDays.reduce((count, date) => {
    return count + getAvailableUnitsCount(format(date, 'yyyy-MM-dd'))
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unit Availability</h1>
          <p className="text-gray-600 mt-1">Manage unit availability and booking status</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-l-none"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {selectedUnits.length > 0 && (
            <Dialog open={showBulkUpdateDialog} onOpenChange={setShowBulkUpdateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Update ({selectedUnits.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Bulk Update Unit Status</DialogTitle>
                  <DialogDescription>
                    Update status for {selectedUnits.length} selected units
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={bulkUpdateForm.status}
                      onValueChange={(value) => setBulkUpdateForm({ ...bulkUpdateForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out_of_service">Out of Service</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Select Dates</label>
                    <Calendar
                      mode="multiple"
                      selected={bulkUpdateForm.dates}
                      onSelect={(dates) => setBulkUpdateForm({ ...bulkUpdateForm, dates: dates || [] })}
                      className="rounded-md border"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Textarea
                      value={bulkUpdateForm.notes}
                      onChange={(e) => setBulkUpdateForm({ ...bulkUpdateForm, notes: e.target.value })}
                      placeholder="Add notes about this status change"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowBulkUpdateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleBulkUpdate} disabled={loading}>
                      Update Status
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-lg font-semibold">{availableCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="text-sm text-gray-600">Booked</p>
                <p className="text-lg font-semibold">
                  {availability.filter(a => a.status === 'booked').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-lg font-semibold">
                  {availability.filter(a => a.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <p className="text-sm text-gray-600">Reserved</p>
                <p className="text-lg font-semibold">
                  {availability.filter(a => a.status === 'reserved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <div>
                <p className="text-sm text-gray-600">Out of Service</p>
                <p className="text-lg font-semibold">
                  {availability.filter(a => a.status === 'out_of_service').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Unit Status Grid
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllUnits}
                >
                  {selectedUnits.length === filteredUnits.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to })
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <CardDescription>
              Click on units to select them for bulk operations. Click on status cells to change individual unit status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 text-left bg-gray-50">Unit</th>
                    {weekDays.map((date) => (
                      <th key={date.toString()} className="border p-2 text-center bg-gray-50 min-w-24">
                        <div className="text-xs font-medium">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-xs text-gray-600">
                          {format(date, 'MMM dd')}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className={cn(
                      'hover:bg-gray-50',
                      selectedUnits.includes(unit.id) && 'bg-blue-50'
                    )}>
                      <td className="border p-2">
                        <div 
                          className="flex items-center space-x-2 cursor-pointer"
                          onClick={() => toggleUnitSelection(unit.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedUnits.includes(unit.id)}
                            onChange={() => {}}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium text-sm">{unit.unit_number}</div>
                            <div className="text-xs text-gray-600">
                              {(unit as any).property?.title || 'Property'}
                            </div>
                          </div>
                        </div>
                      </td>
                      {weekDays.map((date) => {
                        const status = getUnitStatusForDate(unit.id, date)
                        const availability = getUnitAvailabilityForDate(unit.id, date)
                        
                        return (
                          <td key={date.toString()} className="border p-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <div
                                  className="w-full h-8 rounded cursor-pointer flex items-center justify-center transition-opacity hover:opacity-80"
                                  style={{ backgroundColor: getUnitStatusColor(status) }}
                                  title={`${getStatusLabel(status)}${availability?.notes ? ` - ${availability.notes}` : ''}`}
                                >
                                  {getStatusIcon(status)}
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-64">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="font-medium text-sm">Update Status</h4>
                                    <p className="text-xs text-gray-600">
                                      {unit.unit_number} - {format(date, 'MMM dd, yyyy')}
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    {['available', 'booked', 'maintenance', 'out_of_service', 'reserved'].map((statusOption) => (
                                      <Button
                                        key={statusOption}
                                        variant={status === statusOption ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleUnitStatusChange(unit.id, date, statusOption)}
                                        className="text-xs"
                                      >
                                        {getStatusLabel(statusOption)}
                                      </Button>
                                    ))}
                                  </div>
                                  
                                  {availability?.notes && (
                                    <div>
                                      <p className="text-xs font-medium">Notes:</p>
                                      <p className="text-xs text-gray-600">{availability.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
            <CardDescription>
              Monthly calendar view of unit availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-12">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Calendar View</p>
              <p>Calendar view implementation coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default UnitAvailabilityPage
