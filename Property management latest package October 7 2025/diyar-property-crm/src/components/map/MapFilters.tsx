import React from 'react';
import { Filter } from 'lucide-react';

interface MapFiltersProps {
  filters?: any;
  activeFilters?: any;
  onFiltersChange: (filters: any) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({ filters, activeFilters, onFiltersChange }) => {
  const currentFilters = activeFilters || filters || {};
  const statusOptions = ['available', 'reserved', 'sold', 'under_construction'];
  const projectOptions = ['Diyar Al Muharraq', 'Amwaj Floating City', 'Diyar Islands'];

  const handleStatusChange = (status: string) => {
    const currentStatuses = currentFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s: string) => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...currentFilters, status: newStatuses });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5" />
        <h3 className="font-semibold">Filters</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <div className="space-y-1">
            {statusOptions.map(status => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(currentFilters.status || []).includes(status)}
                  onChange={() => handleStatusChange(status)}
                  className="mr-2"
                />
                <span className="capitalize">{status.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Price Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={currentFilters.min_price || ''}
              onChange={(e) => onFiltersChange({ ...currentFilters, min_price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              value={currentFilters.max_price || ''}
              onChange={(e) => onFiltersChange({ ...currentFilters, max_price: e.target.value })}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Bedrooms</label>
          <select
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            value={currentFilters.bedrooms || ''}
            onChange={(e) => onFiltersChange({ ...currentFilters, bedrooms: e.target.value })}
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;