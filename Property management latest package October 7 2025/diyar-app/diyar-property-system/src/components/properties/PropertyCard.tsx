import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Square, Calendar, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Property } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/Card'
import { formatCurrency, cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  viewMode?: 'grid' | 'list'
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, viewMode = 'grid' }) => {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    reserved: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-red-100 text-red-800',
    maintenance: 'bg-gray-100 text-gray-800',
  }

  if (viewMode === 'list') {
    return (
      <Card hover className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-1/3">
            <img
              src={property.images?.[0] || '/placeholder-property.jpg'}
              alt={property.title}
              className="w-full h-48 md:h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = '/placeholder-property.jpg'
              }}
            />
            <div className="absolute top-4 left-4">
              <span className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                statusColors[property.status]
              )}>
                {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
              </span>
            </div>
          </div>
          
          <CardContent className="flex-1 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{property.title}</h3>
                <p className="text-blue-600 font-medium">{property.project}</p>
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(property.price, property.currency)}
                </div>
                <div className="text-sm text-gray-500">
                  {property.available_units}/{property.total_units} available
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-600 mb-4">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
                </div>
              )}
              {property.size && (
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  <span>{property.size} sqm</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">
              {property.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {property.amenities?.slice(0, 3).map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities && property.amenities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>
              
              <Link
                to={`/properties/${property.id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  return (
    <Card hover className="overflow-hidden h-full">
      <div className="relative">
        <img
          src={property.images?.[0] || '/placeholder-property.jpg'}
          alt={property.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-property.jpg'
          }}
        />
        <div className="absolute top-4 left-4">
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            statusColors[property.status]
          )}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-bold">
            {formatCurrency(property.price, property.currency)}
          </div>
        </div>
      </div>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
          <p className="text-sm text-blue-600 font-medium">{property.project}</p>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {property.location}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.bedrooms}
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.bathrooms}
            </div>
          )}
          {property.size && (
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              {property.size}m²
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          {property.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Availability:</span>
            <span className="font-medium">
              {property.available_units}/{property.total_units} units
            </span>
          </div>
          
          <Link
            to={`/properties/${property.id}`}
            className="w-full inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            View Details & Reserve
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default PropertyCard