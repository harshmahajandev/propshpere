import React from 'react';
import { Search } from 'lucide-react';

interface MapSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  suggestions?: string[];
  totalResults?: number;
}

const MapSearch: React.FC<MapSearchProps> = ({ searchTerm, onSearchChange, suggestions }) => {
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search villas (unit number, project, etc.)"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {suggestions && suggestions.length > 0 && searchTerm && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10">
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSearchChange(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapSearch;