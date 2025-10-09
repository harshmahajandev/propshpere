import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import { usePropertyStore } from '../store/propertyStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { toast } from '../components/ui/Toaster'

interface PropertyCardProps {
  property: any
  onEdit: (property: any) => void
  onDelete: (id: string) => void
  onView: (property: any) => void
}

function PropertyCard({ property, onEdit, onDelete, onView }: PropertyCardProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-red-100 text-red-800',
    maintenance: 'bg-gray-100 text-gray-800',
  }

  const typeIcons = {
    villa: '🏡',
    plot: '🏞️',
    commercial_villa: '🏢',
    commercial_plot: '🏬',
    warehouse: '🏭',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden card-hover"
    >
      <div className="relative">
        <img
          src={property.images?.[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-lg">{typeIcons[property.type]}</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {property.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{property.project}</p>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {property.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <HomeIcon className="h-4 w-4 mr-2" />
                {property.size} sqm
                {property.bedrooms && ` • ${property.bedrooms} bed`}
                {property.bathrooms && ` • ${property.bathrooms} bath`}
              </div>
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-diyar-gold" />
                <span className="text-lg font-bold text-diyar-blue">
                  {property.price.toLocaleString()} {property.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lead Matches */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Lead Matches:</span>
              <span className="ml-1">
                {property.leadMatches?.total || 0} total
              </span>
            </div>
            <div className="text-sm">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-diyar-blue text-white">
                {property.interestScore || 0}% interest
              </span>
            </div>
          </div>
          <div className="flex space-x-2 mt-2">
            <span className="text-xs bg-gold-100 text-yellow-800 px-2 py-1 rounded">
              {property.leadMatches?.hni || 0} HNI
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {property.leadMatches?.investor || 0} Investors
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {property.leadMatches?.retail || 0} Retail
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => onView(property)}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(property)}
            className="flex-1 bg-diyar-blue text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(property.id)}
            className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function FilterPanel({ filters, onFilterChange }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={filters.project || ''}
            onChange={(e) => onFilterChange({ project: e.target.value || undefined })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Projects</option>
            <option value="Al Bareh">Al Bareh</option>
            <option value="Suhail">Suhail</option>
            <option value="Jeewan">Jeewan</option>
            <option value="Al Naseem">Al Naseem</option>
            <option value="Mozoon">Mozoon</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => onFilterChange({ type: e.target.value || undefined })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="villa">Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial_villa">Commercial Villa</option>
            <option value="commercial_plot">Commercial Plot</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <select
            onChange={(e) => {
              const range = e.target.value
              if (range) {
                const [min, max] = range.split('-').map(Number)
                onFilterChange({ priceRange: [min, max] })
              } else {
                onFilterChange({ priceRange: undefined })
              }
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Prices</option>
            <option value="0-100000">Under 100K BHD</option>
            <option value="100000-200000">100K - 200K BHD</option>
            <option value="200000-500000">200K - 500K BHD</option>
            <option value="500000-1000000">500K - 1M BHD</option>
            <option value="1000000-999999999">1M+ BHD</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default function Properties() {
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { 
    properties, 
    filters, 
    isLoading, 
    fetchProperties, 
    setFilters, 
    deleteProperty 
  } = usePropertyStore()

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties, filters])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ search: term || undefined })
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await deleteProperty(id)
        toast({
          type: 'success',
          title: 'Property deleted',
          message: 'Property has been successfully removed'
        })
      } catch (error) {
        toast({
          type: 'error',
          title: 'Error',
          message: 'Failed to delete property'
        })
      }
    }
  }

  const handleView = (property: any) => {
    // Navigate to property details page
    console.log('View property:', property)
  }

  const handleEdit = (property: any) => {
    // Navigate to property edit page
    console.log('Edit property:', property)
  }

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Portfolio</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your property listings and track performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Property
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-diyar-blue focus:border-diyar-blue"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </motion.div>
      )}

      {/* Properties Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading properties..." />
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first property'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-diyar-blue">
              {properties.filter(p => p.status === 'available').length}
            </div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {properties.filter(p => p.status === 'reserved').length}
            </div>
            <div className="text-sm text-gray-600">Reserved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {properties.filter(p => p.status === 'sold').length}
            </div>
            <div className="text-sm text-gray-600">Sold</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-diyar-gold">
              {properties.reduce((sum, p) => sum + (p.leadMatches?.total || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>
        </div>
      </div>
    </div>
  )
}