import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom island marker icons
const createIslandIcon = (status: string) => {
  const iconColors = {
    active: '#10B981', // green
    developing: '#F59E0B', // amber
    planned: '#6B7280', // gray
    completed: '#3B82F6' // blue
  }
  
  const color = iconColors[status as keyof typeof iconColors] || iconColors.active
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        🏝️
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
}

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

interface IslandMapProps {
  onIslandClick?: (island: Island) => void
  selectedIslandId?: string
}

const IslandMap: React.FC<IslandMapProps> = ({ onIslandClick, selectedIslandId }) => {
  const [islands, setIslands] = useState<Island[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Bahrain coordinates - centered on the country
  const bahrainCenter: LatLngTuple = [26.0667, 50.5577]
  
  useEffect(() => {
    fetchIslands()
  }, [])

  const fetchIslands = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch islands data from Supabase
      const { data, error: supabaseError } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          location,
          status,
          latitude,
          longitude,
          description,
          size,
          total_units,
          available_units,
          project
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      // Transform property data to island format
      // Group by project to represent islands/developments
      const islandMap = new Map<string, Island>()
      
      data?.forEach(property => {
        const projectKey = property.project || property.location
        if (!islandMap.has(projectKey)) {
          islandMap.set(projectKey, {
            id: property.id,
            name: projectKey,
            status: property.status as Island['status'],
            latitude: property.latitude,
            longitude: property.longitude,
            description: property.description || `Development in ${property.location}`,
            total_area: property.size,
            properties_count: 1,
            available_units: property.available_units || 0
          })
        } else {
          const existing = islandMap.get(projectKey)!
          existing.properties_count! += 1
          existing.available_units! += property.available_units || 0
        }
      })
      
      setIslands(Array.from(islandMap.values()))
    } catch (err) {
      console.error('Error fetching islands:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch islands')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkerClick = (island: Island) => {
    if (onIslandClick) {
      onIslandClick(island)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
        <span className="ml-2">Loading islands...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600">
        <p>Error loading map: {error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={bahrainCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {islands.map((island) => (
          <Marker
            key={island.id}
            position={[island.latitude, island.longitude]}
            icon={createIslandIcon(island.status)}
            eventHandlers={{
              click: () => handleMarkerClick(island)
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {island.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {island.description}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`capitalize font-medium ${
                      island.status === 'active' ? 'text-green-600' :
                      island.status === 'developing' ? 'text-amber-600' :
                      island.status === 'planned' ? 'text-gray-600' :
                      'text-blue-600'
                    }`}>
                      {island.status}
                    </span>
                  </div>
                  {island.properties_count && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Properties:</span>
                      <span className="font-medium">{island.properties_count}</span>
                    </div>
                  )}
                  {island.available_units !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Available:</span>
                      <span className="font-medium text-green-600">
                        {island.available_units} units
                      </span>
                    </div>
                  )}
                </div>
                <button 
                  className="mt-3 w-full bg-blue-600 text-white py-1 px-3 rounded text-xs hover:bg-blue-700 transition-colors"
                  onClick={() => handleMarkerClick(island)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default IslandMap