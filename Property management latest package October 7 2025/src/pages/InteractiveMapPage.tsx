import React, { useState } from 'react'
import IslandMap from '../components/map/IslandMap'
import DevelopmentMap from '../components/map/DevelopmentMap'
import { ArrowLeftIcon, MapIcon, GridIcon } from '@heroicons/react/24/outline'

interface Island {
  id: string
  name: string
  status: 'active' | 'developing' | 'planned' | 'completed'
  latitude: number
  longitude: number
  description: string
  total_area?: number
  development_progress?: number
  properties_count?: number
  available_units?: number
}

interface PropertyUnit {
  id: string
  title: string
  status: 'available' | 'reserved' | 'sold' | 'maintenance'
  latitude: number
  longitude: number
  price: number
  bedrooms?: number
  size?: number
  description?: string
}

const InteractiveMapPage: React.FC = () => {
  const [selectedIsland, setSelectedIsland] = useState<Island | null>(null)
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'development' | 'unit'>('overview')

  const handleIslandClick = (island: Island) => {
    setSelectedIsland(island)
    setViewMode('development')
  }

  const handleUnitClick = (unit: PropertyUnit) => {
    setSelectedUnit(unit)
    setViewMode('unit')
  }

  const handleBackToOverview = () => {
    setSelectedIsland(null)
    setSelectedUnit(null)
    setViewMode('overview')
  }

  const handleBackToDevelopment = () => {
    setSelectedUnit(null)
    setViewMode('development')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {viewMode !== 'overview' && (
                <button
                  onClick={viewMode === 'unit' ? handleBackToDevelopment : handleBackToOverview}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>Back</span>
                </button>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {viewMode === 'overview' && 'Diyar Islands Overview'}
                  {viewMode === 'development' && selectedIsland?.name}
                  {viewMode === 'unit' && selectedUnit?.title}
                </h1>
                <p className="text-sm text-gray-600">
                  {viewMode === 'overview' && 'Interactive map of all 7 Diyar development islands'}
                  {viewMode === 'development' && selectedIsland?.description}
                  {viewMode === 'unit' && `${selectedUnit?.bedrooms} bedroom property in ${selectedIsland?.name}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MapIcon className="h-4 w-4" />
                <span>
                  {viewMode === 'overview' && 'Island View'}
                  {viewMode === 'development' && 'Development View'}
                  {viewMode === 'unit' && 'Unit Details'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Legend */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Map Legend</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                  <span>Active Development</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow"></div>
                  <span>Under Development</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-500 rounded-full border-2 border-white shadow"></div>
                  <span>Planned</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
            
            {/* Map */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <IslandMap onIslandClick={handleIslandClick} />
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-blue-600">7</div>
                <div className="text-sm text-gray-600">Total Islands</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-green-600">504</div>
                <div className="text-sm text-gray-600">Total Properties</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-amber-600">223</div>
                <div className="text-sm text-gray-600">Available Units</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-purple-600">BD 125M</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'development' && selectedIsland && (
          <div className="space-y-6">
            {/* Development Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Development Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedIsland.status === 'active' ? 'bg-green-100 text-green-800' :
                    selectedIsland.status === 'developing' ? 'bg-amber-100 text-amber-800' :
                    selectedIsland.status === 'planned' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedIsland.status.charAt(0).toUpperCase() + selectedIsland.status.slice(1)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Properties</h3>
                  <p className="text-2xl font-bold text-gray-900">{selectedIsland.properties_count || 0}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Available Units</h3>
                  <p className="text-2xl font-bold text-green-600">{selectedIsland.available_units || 0}</p>
                </div>
              </div>
            </div>
            
            {/* Development Map */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <DevelopmentMap 
                developmentId={selectedIsland.id}
                developmentName={selectedIsland.name}
                onUnitClick={handleUnitClick}
              />
            </div>
          </div>
        )}

        {viewMode === 'unit' && selectedUnit && (
          <div className="space-y-6">
            {/* Unit Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">{selectedUnit.title}</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(selectedUnit.price)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`capitalize font-medium ${
                        selectedUnit.status === 'available' ? 'text-green-600' :
                        selectedUnit.status === 'reserved' ? 'text-amber-600' :
                        selectedUnit.status === 'sold' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {selectedUnit.status}
                      </span>
                    </div>
                    {selectedUnit.bedrooms && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bedrooms:</span>
                        <span className="font-medium">{selectedUnit.bedrooms}</span>
                      </div>
                    )}
                    {selectedUnit.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{selectedUnit.size} sqm</span>
                      </div>
                    )}
                    {selectedUnit.description && (
                      <div>
                        <span className="text-gray-600 block mb-2">Description:</span>
                        <p className="text-gray-800">{selectedUnit.description}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedUnit.status === 'available' && (
                    <div className="mt-6 space-y-2">
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Schedule Viewing
                      </button>
                      <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                        Make Reservation
                      </button>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4">Location</h3>
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-600 mb-2">Coordinates:</p>
                    <p className="font-mono text-sm">
                      {selectedUnit.latitude.toFixed(6)}, {selectedUnit.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InteractiveMapPage