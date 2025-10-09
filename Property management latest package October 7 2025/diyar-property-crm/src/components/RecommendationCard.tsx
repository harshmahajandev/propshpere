import React from 'react';
import { formatCurrency } from '../lib/utils';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    property_id: string;
    compatibility_score: number;
    recommendation_reason: string;
    property?: {
      unit_number: string;
      property_type: string;
      price: number;
      bedrooms: number;
      bathrooms: number;
      size_sqm: number;
      project_name?: string;
    };
  };
  onClick?: (recommendation: any) => void;
  className?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onClick, 
  className = '' 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const property = recommendation.property;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 ${className}`}
      onClick={() => onClick?.(recommendation)}
    >
      <div className="p-6">
        {/* Header with Compatibility Score */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {property ? `Unit ${property.unit_number}` : 'Property Recommendation'}
            </h3>
            {property?.project_name && (
              <p className="text-sm text-gray-600">{property.project_name}</p>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(recommendation.compatibility_score)}`}>
            {recommendation.compatibility_score}% Match
          </div>
        </div>
        
        {/* Property Details */}
        {property && (
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
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-blue-600">{formatCurrency(property.price)}</span>
            </div>
          </div>
        )}
        
        {/* Recommendation Reason */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Why this property?</h4>
          <p className="text-sm text-gray-600">{recommendation.recommendation_reason}</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;