import React from 'react';
import { formatCurrency, getPropertyStatusColor } from '../lib/utils';

interface PropertyCardProps {
  property: {
    id: string;
    unit_number: string;
    property_type: string;
    size_sqm: number;
    price: number;
    status: string;
    bedrooms: number;
    bathrooms: number;
    project_name?: string;
  };
  onClick?: (property: any) => void;
  className?: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, className = '' }) => {
  const statusColor = getPropertyStatusColor(property.status);
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 ${className}`}
      onClick={() => onClick?.(property)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Unit {property.unit_number}
            </h3>
            {property.project_name && (
              <p className="text-sm text-gray-600">{property.project_name}</p>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {property.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        {/* Property Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{property.property_type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">{property.size_sqm} sqm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Bedrooms:</span>
            <span className="font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Bathrooms:</span>
            <span className="font-medium">{property.bathrooms}</span>
          </div>
        </div>
        
        {/* Price */}
        <div className="border-t pt-4">
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(property.price)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;