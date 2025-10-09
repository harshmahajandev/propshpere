import React from 'react';

interface MapLegendProps {
  totalVillas?: number;
  villas?: any[];
  filteredCount?: number;
  selectedCount?: number;
  batchMode?: boolean;
  stats?: {
    available: number;
    reserved: number;
    sold: number;
    under_construction: number;
  };
}

const MapLegend: React.FC<MapLegendProps> = ({ totalVillas = 0, villas = [], filteredCount, selectedCount, batchMode, stats }) => {
  // Calculate stats from villas if not provided
  const calculatedStats = stats || {
    available: villas.filter(v => v.status === 'available').length,
    reserved: villas.filter(v => v.status === 'reserved').length,
    sold: villas.filter(v => v.status === 'sold').length,
    under_construction: villas.filter(v => v.status === 'under_construction').length
  };

  const total = totalVillas || villas.length;

  const legendItems = [
    { status: 'available', color: 'bg-green-500', label: 'Available', count: calculatedStats.available },
    { status: 'reserved', color: 'bg-yellow-500', label: 'Reserved', count: calculatedStats.reserved },
    { status: 'sold', color: 'bg-red-500', label: 'Sold', count: calculatedStats.sold },
    { status: 'under_construction', color: 'bg-blue-500', label: 'Under Construction', count: calculatedStats.under_construction }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-semibold mb-3">Property Status Legend</h3>
      
      <div className="space-y-2">
        {legendItems.map(item => (
          <div key={item.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${item.color}`}></div>
              <span className="text-sm">{item.label}</span>
            </div>
            <span className="text-sm font-medium">{item.count}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Villas:</span>
          <span className="text-sm font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;