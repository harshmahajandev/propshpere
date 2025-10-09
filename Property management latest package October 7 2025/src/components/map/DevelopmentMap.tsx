import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'

// Custom unit marker
const createUnitIcon = (status: string) => {
  const iconColors = {
    available: '#10B981',
    reserved: '#F59E0B', 
    sold: '#EF4444',
    maintenance: '#6B7280'
  }
  
  const color = iconColors[status as keyof typeof iconColors] || iconColors.available
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'unit-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
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

interface DevelopmentMapProps {
  developmentId: string
  developmentName: string
  onUnitClick?: (unit: PropertyUnit) => void
}

const DevelopmentMap: React.FC<DevelopmentMapProps> = ({ 
  developmentId, 
  developmentName, 
  onUnitClick 
}) => {
  const [units, setUnits] = useState<PropertyUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<LatLngTuple>([26.2785, 50.6647])

  useEffect(() => {
    fetchDevelopmentUnits()
  }, [developmentId])

  const fetchDevelopmentUnits = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select('*')
        .eq('project', developmentName)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      const propertyUnits: PropertyUnit[] = data?.map(property => ({
        id: property.id,
        title: property.title,
        status: property.status,
        latitude: property.latitude,
        longitude: property.longitude,
        price: property.price,
        bedrooms: property.bedrooms,
        size: property.size,
        description: property.description
      })) || []
      
      setUnits(propertyUnits)
      
      // Set map center to the average of all unit positions
      if (propertyUnits.length > 0) {
        const avgLat = propertyUnits.reduce((sum, unit) => sum + unit.latitude, 0) / propertyUnits.length
        const avgLng = propertyUnits.reduce((sum, unit) => sum + unit.longitude, 0) / propertyUnits.length
        setMapCenter([avgLat, avgLng])
      }
      
    } catch (err) {
      console.error('Error fetching development units:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch units')
    } finally {
      setLoading(false)
    }
  }

  const handleUnitClick = (unit: PropertyUnit) => {
    if (onUnitClick) {
      onUnitClick(unit)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading development units...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600">
        <p>Error loading development map: {error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-50 p-3 border-b">
        <h3 className="font-semibold text-lg">{developmentName}</h3>
        <p className="text-sm text-gray-600">
          {units.length} units • 
          {units.filter(u => u.status === 'available').length} available
        </p>
      </div>
      
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: 'calc(100% - 60px)', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {units.map((unit) => (
          <Marker
            key={unit.id}
            position={[unit.latitude, unit.longitude]}
            icon={createUnitIcon(unit.status)}
            eventHandlers={{
              click: () => handleUnitClick(unit)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <h4 className="font-bold text-base mb-1">{unit.title}</h4>
                <p className="text-lg font-semibold text-blue-600 mb-2">
                  {formatPrice(unit.price)}
                </p>
                
                <div className="space-y-1 text-xs mb-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`capitalize font-medium ${
                      unit.status === 'available' ? 'text-green-600' :
                      unit.status === 'reserved' ? 'text-amber-600' :
                      unit.status === 'sold' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {unit.status}
                    </span>
                  </div>
                  {unit.bedrooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bedrooms:</span>
                      <span className="font-medium">{unit.bedrooms}</span>
                    </div>
                  )}
                  {unit.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size:</span>
                      <span className="font-medium">{unit.size} sqm</span>
                    </div>
                  )}
                </div>
                
                {unit.status === 'available' && (
                  <button 
                    className="w-full bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 transition-colors"
                    onClick={() => handleUnitClick(unit)}
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default DevelopmentMap