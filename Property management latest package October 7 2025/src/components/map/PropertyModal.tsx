import React from 'react'
import { XMarkIcon, HomeIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { Property } from '../../lib/supabase'

interface PropertyModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onReserve?: (property: Property) => void
  onScheduleViewing?: (property: Property) => void
}

const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  onReserve,
  onScheduleViewing
}) => {
  if (!isOpen || !property) return null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'reserved':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'sold':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{property.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Images */}
          {property.images && property.images.length > 0 && (
            <div className="mb-6">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-64 object-cover rounded-lg"
              />
              {property.images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {property.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.title} ${index + 2}`}
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Property Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${
                    getStatusColor(property.status)
                  }`}>
                    {property.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{property.type.replace('_', ' ')}</span>
                </div>
                {property.bedrooms && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bedrooms:</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                )}
                {property.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{property.size} sqm</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Location & Availability</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                  <span className="text-gray-600">{property.location}</span>
                </div>
                <div className="flex items-start">
                  <HomeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                  <span className="text-gray-600">{property.project}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Units:</span>
                  <span className="font-medium">{property.total_units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-green-600">{property.available_units}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Features & Amenities */}
          {(property.features || property.amenities) && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4">Features & Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {property.features && property.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-1">
                      {property.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Amenities</h4>
                    <ul className="space-y-1">
                      {property.amenities.map((amenity, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {property.status === 'available' && (
            <div className="flex gap-3">
              <button
                onClick={() => onScheduleViewing && onScheduleViewing(property)}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CalendarIcon className="h-5 w-5" />
                <span>Schedule Viewing</span>
              </button>
              <button
                onClick={() => onReserve && onReserve(property)}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Make Reservation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PropertyModal