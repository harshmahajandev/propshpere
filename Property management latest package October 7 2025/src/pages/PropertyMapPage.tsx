import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapIcon,
  Squares2X2Icon,
  ChartBarIcon,
  UsersIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import VillaGrid from '../components/map/VillaGrid'
import DevelopmentMap from '../components/map/DevelopmentMap'
import { Villa } from '../api/villas'
import { useAuthStore } from '../stores/auth-store'
import LoadingSpinner from '../components/ui/LoadingSpinner'

type ViewMode = 'grid' | 'map' | 'analytics'

const PropertyMapPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useAuthStore()

  const handleVillaSelect = (villa: Villa) => {
    setSelectedVilla(villa)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getViewModeConfig = (mode: ViewMode) => {
    switch (mode) {
      case 'grid':
        return {
          icon: Squares2X2Icon,
          label: 'Grid View',
          description: 'Interactive villa grid with quick registration'
        }
      case 'map':
        return {
          icon: MapIcon,
          label: 'Map View',
          description: 'Geographic map with villa locations'
        }
      case 'analytics':
        return {
          icon: ChartBarIcon,
          label: 'Analytics',
          description: 'Performance metrics and reports'
        }
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-blue-600">
                <MapIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Interactive Property Map</h1>
                <p className="text-sm text-gray-600">
                  Visual property selection with quick customer registration
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Selector */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {(['grid', 'map', 'analytics'] as ViewMode[]).map((mode) => {
                  const config = getViewModeConfig(mode)
                  const Icon = config.icon
                  
                  return (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                        viewMode === mode
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{config.label}</span>
                    </button>
                  )
                })}
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <ArrowPathIcon className="h-4 w-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current View Description */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  {getViewModeConfig(viewMode).label}
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {getViewModeConfig(viewMode).description}
                </p>
                {viewMode === 'grid' && (
                  <ul className="text-xs text-blue-600 mt-2 space-y-1">
                    <li>• Click on available villas (green) to start quick registration</li>
                    <li>• Use search and filters to find specific properties</li>
                    <li>• Real-time updates show current availability status</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Based on View Mode */}
        <motion.div
          key={`${viewMode}-${refreshKey}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'grid' && (
            <VillaGrid
              onVillaSelect={handleVillaSelect}
              key={refreshKey}
            />
          )}
          
          {viewMode === 'map' && (
            <div className="space-y-6">
              {/* Map Controls */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Geographic Map View</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapIcon className="h-4 w-4" />
                    <span>Interactive map with villa locations</span>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow"></div>
                    <span>Reserved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                    <span>Sold</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                    <span>Under Construction</span>
                  </div>
                </div>
              </div>
              
              {/* Map Component */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <DevelopmentMap
                  developmentId="diyar-main"
                  developmentName="Diyar Properties"
                  onUnitClick={handleVillaSelect}
                />
              </div>
            </div>
          )}
          
          {viewMode === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Dashboard */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Performance Analytics</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Analytics cards would go here */}
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">47</div>
                    <div className="text-sm text-gray-600">Registrations This Month</div>
                  </div>
                  
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">23</div>
                    <div className="text-sm text-gray-600">Conversions</div>
                  </div>
                  
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-2">8.2</div>
                    <div className="text-sm text-gray-600">Avg Response Time (min)</div>
                  </div>
                  
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">94%</div>
                    <div className="text-sm text-gray-600">Customer Satisfaction</div>
                  </div>
                </div>
                
                {/* Placeholder for more detailed analytics */}
                <div className="mt-8 p-8 bg-gray-50 rounded-lg text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Detailed analytics and reporting dashboard will be available here
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Including conversion rates, popular villas, sales performance, and customer insights
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Selected Villa Info Panel (if any) */}
        {selectedVilla && viewMode !== 'grid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Selected Villa</h4>
              <button
                onClick={() => setSelectedVilla(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">{selectedVilla.unit_number}</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`capitalize font-medium ${
                      selectedVilla.status === 'available' ? 'text-green-600' :
                      selectedVilla.status === 'reserved' ? 'text-orange-600' :
                      selectedVilla.status === 'sold' ? 'text-red-600' :
                      'text-blue-600'
                    }`}>
                      {selectedVilla.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">{formatPrice(selectedVilla.price)}</span>
                  </div>
                  {selectedVilla.size_sqft && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size:</span>
                      <span className="font-medium">{selectedVilla.size_sqft} sqft</span>
                    </div>
                  )}
                  {selectedVilla.project && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Project:</span>
                      <span className="font-medium">{selectedVilla.project}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedVilla.status === 'available' && (
                <div className="flex items-end">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>Quick Registration</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default PropertyMapPage