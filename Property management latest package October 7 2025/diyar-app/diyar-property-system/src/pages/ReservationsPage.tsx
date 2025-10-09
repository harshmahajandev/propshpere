import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { useReservationStore } from '@/stores/reservation-store'
import { usePropertyStore } from '@/stores/property-store'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

const ReservationsPage = () => {
  const { user } = useAuthStore()
  const { reservations, loading, fetchReservations, updateReservationStatus, filters, setFilters } = useReservationStore()
  const { properties, fetchProperties } = usePropertyStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  
  const isAdmin = user && ['admin', 'sales_manager', 'sales_rep'].includes(user.role)
  const isCustomer = user?.role === 'customer'

  useEffect(() => {
    fetchReservations()
    fetchProperties()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setFilters({ customer_name: searchTerm })
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm])

  useEffect(() => {
    setFilters({ status: selectedStatus })
  }, [selectedStatus])

  const handleStatusUpdate = async (reservationId: string, newStatus: any) => {
    try {
      await updateReservationStatus(reservationId, newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getPropertyById = (id: string) => {
    return properties.find(p => p.id === id)
  }

  const filteredReservations = isCustomer 
    ? reservations.filter(r => r.customer_id === user.id || r.customer_email === user.email)
    : reservations

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    expired: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    cancelled: XCircle,
    completed: CheckCircle,
    expired: XCircle,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading reservations..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isCustomer ? 'My Reservations' : 'Reservations'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isCustomer 
              ? 'Track and manage your property reservations' 
              : 'Manage customer property reservations'
            }
          </p>
        </div>
        
        {isCustomer && (
          <Link to="/properties">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Make New Reservation
            </Button>
          </Link>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={isAdmin ? "Search by customer name..." : "Search your reservations..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="md:w-48">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reservations List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {filteredReservations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reservations found
              </h3>
              <p className="text-gray-600 mb-6">
                {isCustomer 
                  ? "You haven't made any reservations yet."
                  : "No reservations match your current filters."
                }
              </p>
              {isCustomer && (
                <Link to="/properties">
                  <Button>
                    Browse Properties
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredReservations.map((reservation, index) => {
              const property = getPropertyById(reservation.property_id)
              const StatusIcon = statusIcons[reservation.status as keyof typeof statusIcons]
              
              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Property Image */}
                        <div className="lg:w-1/4">
                          <img
                            src={property?.images?.[0] || '/placeholder-property.jpg'}
                            alt={property?.title || 'Property'}
                            className="w-full h-48 lg:h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder-property.jpg'
                            }}
                          />
                        </div>
                        
                        {/* Reservation Details */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h3 className="text-xl font-semibold text-gray-900 mr-3">
                                  {property?.title || 'Unknown Property'}
                                </h3>
                                <span className={cn(
                                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                                  statusColors[reservation.status as keyof typeof statusColors]
                                )}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  <span>{property?.project} - {property?.location}</span>
                                </div>
                                
                                {isAdmin && (
                                  <>
                                    <div className="flex items-center">
                                      <Phone className="h-4 w-4 mr-2" />
                                      <span>{reservation.customer_phone}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <Mail className="h-4 w-4 mr-2" />
                                      <span>{reservation.customer_email}</span>
                                    </div>
                                  </>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                  <div>
                                    <span className="font-medium text-gray-700">Reserved:</span>
                                    <span className="ml-1">{formatDate(reservation.reservation_date)}</span>
                                  </div>
                                  {reservation.viewing_date && (
                                    <div>
                                      <span className="font-medium text-gray-700">Viewing:</span>
                                      <span className="ml-1">{formatDate(reservation.viewing_date)}</span>
                                    </div>
                                  )}
                                  {property && (
                                    <div>
                                      <span className="font-medium text-gray-700">Price:</span>
                                      <span className="ml-1">{formatCurrency(property.price, property.currency)}</span>
                                    </div>
                                  )}
                                  {reservation.preferred_contact_time && (
                                    <div>
                                      <span className="font-medium text-gray-700">Contact Time:</span>
                                      <span className="ml-1 capitalize">{reservation.preferred_contact_time}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                              {isAdmin && (
                                <Link to={`/admin/reservations/${reservation.id}`}>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Details
                                  </Button>
                                </Link>
                              )}
                              
                              {isAdmin && reservation.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              )}
                              
                              {isCustomer && reservation.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                                >
                                  Cancel Reservation
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Special Requirements */}
                          {reservation.special_requirements && (
                            <div className="bg-gray-50 rounded-lg p-3 mt-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Special Requirements:</h4>
                              <p className="text-sm text-gray-600">{reservation.special_requirements}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ReservationsPage