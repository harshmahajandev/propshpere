import React from 'react'
import { usePropertyStore } from '@/stores/property-store'
import { cn } from '@/lib/utils'

const PropertyFilters = () => {
  const { properties, filters, setFilters } = usePropertyStore()
  
  // Extract unique values for filter options
  const projects = [...new Set(properties.map(p => p.project))]
  const locations = [...new Set(properties.map(p => p.location))]
  const propertyTypes = ['villa', 'apartment', 'commercial_plot', 'office', 'retail', 'warehouse']
  const statuses = ['available', 'reserved', 'sold', 'maintenance']

  const handlePriceChange = (index: number, value: string) => {
    const newRange = [...filters.priceRange] as [number, number]
    newRange[index] = parseInt(value) || 0
    setFilters({ priceRange: newRange })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Project Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project
        </label>
        <select
          value={filters.project}
          onChange={(e) => setFilters({ project: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project} value={project}>
              {project}
            </option>
          ))}
        </select>
      </div>

      {/* Property Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Type
        </label>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Types</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <select
          value={filters.location}
          onChange={(e) => setFilters({ location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price Range (BHD)
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceRange[0] || ''}
            onChange={(e) => handlePriceChange(0, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceRange[1] === 1000000 ? '' : filters.priceRange[1] || ''}
            onChange={(e) => handlePriceChange(1, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[100000, 200000, 500000, 1000000].map((price) => (
            <button
              key={price}
              onClick={() => setFilters({ priceRange: [0, price] })}
              className={cn(
                'px-3 py-1 text-xs rounded-full border transition-colors',
                filters.priceRange[1] === price
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-600 border-gray-300 hover:border-blue-300'
              )}
            >
              Up to {price.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PropertyFilters