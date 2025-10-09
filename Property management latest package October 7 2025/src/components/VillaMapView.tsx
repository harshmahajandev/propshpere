import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapIcon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'
import LoadingSpinner from './ui/LoadingSpinner'
import { supabase } from '../lib/supabase'

interface PropertyUnit {
  id: string
  title: string
  status: 'available' | 'reserved' | 'sold' | 'maintenance'
  price: number
  size?: number
  bedrooms?: number
  bathrooms?: number
  project?: string
  description?: string
}

interface UnitDetailModalProps {
  isOpen: boolean
  onClose: () => void
  unit: PropertyUnit | null
}

function UnitDetailModal({ isOpen, onClose, unit }: UnitDetailModalProps) {
  if (!isOpen || !unit) return null
  
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'sold': return 'bg-red-100 text-red-800 border-red-200'
      case 'reserved': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0
    }).format(price)
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="professional-card max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: 'var(--primary-blue)' }}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <HomeIcon className="h-6 w-6 text-white" />
                <h3 className="text-xl font-bold text-white">{unit.title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusBadgeClass(unit.status)}`}>
                      {unit.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Size</span>
                  <p className="text-lg font-semibold text-gray-900">{unit.size ? `${unit.size} sqm` : 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Bedrooms</span>
                  <p className="text-lg font-semibold text-gray-900">{unit.bedrooms || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Price</span>
                  <p className="text-lg font-semibold" style={{ color: 'var(--primary-blue)' }}>{formatPrice(unit.price)}</p>
                </div>
              </div>
            </div>
            
            {unit.description && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <HomeIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Description</span>
                </div>
                <p className="text-sm text-gray-700">{unit.description}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function VillaMapView() {
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState<PropertyUnit[]>([])
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .limit(25) // Limit to 25 for grid display
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      setUnits(data || [])
    } catch (err) {
      console.error('Error fetching units:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch units')
    } finally {
      setLoading(false)
    }
  }
  
  const handleUnitClick = (unit: PropertyUnit) => {
    setSelectedUnit(unit)
    setShowModal(true)
  }
  
  const closeModal = () => {
    setShowModal(false)
    setSelectedUnit(null)
  }
  
  // Calculate status counts
  const statusCounts = units.reduce((counts, unit) => {
    const status = unit.status.toLowerCase()
    counts[status] = (counts[status] || 0) + 1
    return counts
  }, {} as Record<string, number>)
  
  const occupancyRate = units.length > 0 ? Math.round(((statusCounts.sold || 0) + (statusCounts.reserved || 0)) / units.length * 100) : 0
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading villa map..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Unable to load villa map</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchUnits}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="professional-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary-blue)' }}>
              <MapIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Villa Map - Amwaj Floating City</h1>
              <p className="text-gray-600">Interactive overview of all villa units</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: 'var(--primary-blue)' }}>{occupancyRate}%</div>
            <div className="text-sm text-gray-500">Occupancy Rate</div>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{statusCounts.available || 0}</div>
            <div className="text-sm text-green-600">Available</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{statusCounts.sold || 0}</div>
            <div className="text-sm text-red-600">Sold</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{statusCounts.reserved || 0}</div>
            <div className="text-sm text-orange-600">Reserved</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{statusCounts.maintenance || 0}</div>
            <div className="text-sm text-yellow-600">Maintenance</div>
          </div>
        </div>
      </div>
      
      {/* Villa Map Grid */}
      <div className="professional-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Unit Layout</h2>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Sold</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Reserved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </div>
        
        {/* Property Grid */}
        <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
          {units.map((unit) => (
            <motion.div
              key={unit.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleUnitClick(unit)}
              className={`villa-unit ${unit.status} cursor-pointer`}
              style={{
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
              }}
            >
              <div className="text-sm font-bold">{unit.title?.slice(0, 6) || unit.id.slice(-3)}</div>
              <div className="text-xs opacity-90 capitalize">{unit.status}</div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Click on any unit to view detailed information</p>
        </div>
      </div>
      
      {/* Unit Detail Modal */}
      <UnitDetailModal
        isOpen={showModal}
        onClose={closeModal}
        unit={selectedUnit}
      />
    </div>
  )
}