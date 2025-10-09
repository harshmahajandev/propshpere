import React from 'react'
import { PropertyUnit } from '../lib/supabase'

interface UnitGridProps {
  units: PropertyUnit[]
  onUnitClick?: (unit: PropertyUnit) => void
  selectedUnitId?: string
}

const UnitGrid: React.FC<UnitGridProps> = ({ units, onUnitClick, selectedUnitId }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'reserved':
        return 'bg-amber-100 border-amber-300 text-amber-800'
      case 'sold':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
      {units.map((unit) => (
        <div
          key={unit.id}
          className={`
            border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md
            ${getStatusColor(unit.status)}
            ${selectedUnitId === unit.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          `}
          onClick={() => onUnitClick && onUnitClick(unit)}
        >
          <div className="text-center">
            <div className="font-bold text-sm mb-1">
              {unit.unit_number || `Unit ${unit.id.slice(-3)}`}
            </div>
            <div className="text-xs text-gray-600 mb-1">
              {unit.bedrooms && `${unit.bedrooms} BR`}
              {unit.size && ` • ${unit.size}m²`}
            </div>
            {unit.price && (
              <div className="text-xs font-medium">
                {formatPrice(unit.price)}
              </div>
            )}
            <div className="text-xs mt-1 capitalize font-medium">
              {unit.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UnitGrid