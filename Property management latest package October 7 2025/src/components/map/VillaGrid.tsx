import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  HomeIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { villaApi, Villa } from '../../api/villas'
import LoadingSpinner from '../ui/LoadingSpinner'
import QuickRegistrationModal from './QuickRegistrationModal'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

interface VillaGridProps {
  onVillaSelect?: (villa: Villa) => void
  initialFilters?: {
    status?: string
    project?: string
    min_price?: number
    max_price?: number
    min_size?: number
    max_size?: number
  }
}

interface FilterState {
  search: string
  status: string
  project: string
  min_price: string
  max_price: string
  min_size: string
  max_size: string
}

const VillaGrid: React.FC<VillaGridProps> = ({ onVillaSelect, initialFilters }) => {
  const [villas, setVillas] = useState<Villa[]>([])
  const [filteredVillas, setFilteredVillas] = useState<Villa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: initialFilters?.status || '',
    project: initialFilters?.project || '',
    min_price: initialFilters?.min_price?.toString() || '',
    max_price: initialFilters?.max_price?.toString() || '',
    min_size: initialFilters?.min_size?.toString() || '',
    max_size: initialFilters?.max_size?.toString() || ''
  })
  
  const [villaStats, setVillaStats] = useState({
    total: 0,
    available: 0,
    reserved: 0,
    sold: 0,
    under_construction: 0
  })

  // Load initial data
  useEffect(() => {
    loadVillas()
    loadVillaStats()
    
    // Set up real-time subscription for villa updates
    const subscription = supabase
      .channel('villas_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'villas'
      }, (payload) => {
        console.log('Real-time villa update:', payload)
        // Refresh villa data when changes occur
        loadVillas()
        loadVillaStats()
        toast.success('Villa data updated')
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Apply filters when filters change
  useEffect(() => {
    applyFilters()
  }, [villas, filters])

  const loadVillas = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await villaApi.getAllVillas()
      setVillas(data)
    } catch (err) {
      console.error('Error loading villas:', err)
      setError(err instanceof Error ? err.message : 'Failed to load villas')
    } finally {
      setLoading(false)
    }
  }

  const loadVillaStats = async () => {
    try {
      const stats = await villaApi.getVillaStats()
      setVillaStats(stats)
    } catch (err) {
      console.error('Error loading villa stats:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...villas]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(villa =>
        villa.unit_number.toLowerCase().includes(searchTerm) ||
        villa.project?.toLowerCase().includes(searchTerm) ||
        villa.title?.toLowerCase().includes(searchTerm)
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(villa => villa.status === filters.status)
    }

    // Project filter
    if (filters.project) {
      filtered = filtered.filter(villa => villa.project === filters.project)
    }

    // Price filters
    if (filters.min_price) {
      filtered = filtered.filter(villa => villa.price >= parseFloat(filters.min_price))
    }
    if (filters.max_price) {
      filtered = filtered.filter(villa => villa.price <= parseFloat(filters.max_price))
    }

    // Size filters
    if (filters.min_size) {
      filtered = filtered.filter(villa => villa.size_sqft && villa.size_sqft >= parseFloat(filters.min_size))
    }
    if (filters.max_size) {
      filtered = filtered.filter(villa => villa.size_sqft && villa.size_sqft <= parseFloat(filters.max_size))
    }

    setFilteredVillas(filtered)
  }

  const handleVillaClick = (villa: Villa) => {
    setSelectedVilla(villa)
    
    if (villa.status === 'available') {
      setShowRegistrationModal(true)
    } else {
      if (onVillaSelect) {
        onVillaSelect(villa)
      }
    }
  }

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      project: '',
      min_price: '',
      max_price: '',
      min_size: '',
      max_size: ''
    })
  }

  const getStatusColor = (status: Villa['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 border-green-600 text-white'
      case 'reserved':
        return 'bg-orange-500 border-orange-600 text-white'
      case 'sold':
        return 'bg-red-500 border-red-600 text-white'
      case 'under_construction':
        return 'bg-blue-500 border-blue-600 text-white'
      default:
        return 'bg-gray-500 border-gray-600 text-white'
    }
  }

  const getStatusLabel = (status: Villa['status']) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'reserved':
        return 'Reserved'
      case 'sold':
        return 'Sold'
      case 'under_construction':
        return 'Construction'
      default:
        return 'Unknown'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleRegistrationSuccess = (leadId: string) => {
    toast.success(`Lead created successfully! Lead ID: ${leadId}`)
    // Refresh villa data to show updated status
    loadVillas()
    setShowRegistrationModal(false)
  }

  // Get unique projects for filter dropdown
  const uniqueProjects = [...new Set(villas.map(v => v.project).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading villas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Failed to load villas</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={loadVillas}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <HomeIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Property Map</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {villaStats.total > 0 ? Math.round(((villaStats.sold + villaStats.reserved) / villaStats.total) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500">Occupancy Rate</div>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-700">{villaStats.total}</div>
            <div className="text-sm text-gray-600">Total Units</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{villaStats.available}</div>
            <div className="text-sm text-green-600">Available</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">{villaStats.reserved}</div>
            <div className="text-sm text-orange-600">Reserved</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{villaStats.sold}</div>
            <div className="text-sm text-red-600">Sold</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{villaStats.under_construction}</div>
            <div className="text-sm text-blue-600">Construction</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by unit number, project, or title..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Filter Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {filteredVillas.length} of {villas.length} units
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
            {(filters.status || filters.project || filters.min_price || filters.max_price || filters.min_size || filters.max_size) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 border-t border-gray-200 pt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="under_construction">Under Construction</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={filters.project}
                    onChange={(e) => handleFilterChange('project', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Projects</option>
                    {uniqueProjects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (BHD)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price}
                    onChange={(e) => handleFilterChange('min_price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (BHD)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Size (sqft)</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_size}
                    onChange={(e) => handleFilterChange('min_size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Size (sqft)</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_size}
                    onChange={(e) => handleFilterChange('max_size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Villa Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Villa Layout</h3>
          <p className="text-gray-600 text-sm">
            Click on any available villa to start quick registration. Other statuses show detailed information.
          </p>
        </div>
        
        {filteredVillas.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No villas match your filters</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Clear filters to see all villas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {filteredVillas.map((villa) => (
              <motion.div
                key={villa.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVillaClick(villa)}
                className={`relative cursor-pointer rounded-lg border-2 p-3 transition-all duration-200 ${
                  getStatusColor(villa.status)
                } hover:shadow-lg`}
                style={{ minHeight: '80px' }}
              >
                <div className="text-center">
                  <div className="text-sm font-bold mb-1">
                    {villa.unit_number || villa.title?.slice(0, 6) || `V${villa.id.slice(-3)}`}
                  </div>
                  <div className="text-xs opacity-90 mb-1">
                    {getStatusLabel(villa.status)}
                  </div>
                  <div className="text-xs opacity-75">
                    {formatPrice(villa.price)}
                  </div>
                </div>
                
                {/* Status indicator dot */}
                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  villa.status === 'available' ? 'bg-green-200' :
                  villa.status === 'reserved' ? 'bg-orange-200' :
                  villa.status === 'sold' ? 'bg-red-200' :
                  'bg-blue-200'
                }`} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Registration Modal */}
      <QuickRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        villa={selectedVilla}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  )
}

export default VillaGrid