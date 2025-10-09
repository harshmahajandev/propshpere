import React, { useState, useEffect, useCallback } from 'react';
import { villaUnitsAPI, villaInteractionsAPI } from '../../lib/propertyMapAPI';
import { LoadingSpinner } from '../index';
import VillaUnit from './VillaUnit';
import VillaDetailsModal from './VillaDetailsModal';
import QuickRegistrationModal from './QuickRegistrationModal';
import MapFilters from './MapFilters';
import MapSearch from './MapSearch';
import MapLegend from './MapLegend';

interface Villa {
  id: string;
  unit_number: string;
  property_type: string;
  floor_level: number;
  built_up_area: number;
  land_area: number;
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  base_price: number;
  current_price: number;
  status: string;
  position_x: number;
  position_y: number;
  floor_plan_url?: string;
  villa_images?: string[];
  amenities?: string[];
  specifications?: any;
  sales_person_id?: string;
  reserved_date?: string;
  sold_date?: string;
  is_featured: boolean;
}

interface InteractivePropertyMapProps {
  onRegistrationComplete?: (registration: any) => void;
}

const InteractivePropertyMap: React.FC<InteractivePropertyMapProps> = ({ onRegistrationComplete }) => {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [filteredVillas, setFilteredVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  const [showVillaDetails, setShowVillaDetails] = useState(false);
  const [showQuickRegistration, setShowQuickRegistration] = useState(false);
  const [hoveredVilla, setHoveredVilla] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [selectedVillas, setSelectedVillas] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadVillas();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [villas, searchTerm, activeFilters]);

  const loadVillas = async () => {
    try {
      setLoading(true);
      const data = await villaUnitsAPI.getAllVillas();
      setVillas(data || []);
    } catch (error) {
      console.error('Error loading villas:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...villas];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(villa => 
        villa.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        villa.property_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        villa.amenities?.some(amenity => amenity.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply filters
    if (activeFilters.status && activeFilters.status.length > 0) {
      filtered = filtered.filter(villa => activeFilters.status.includes(villa.status));
    }

    if (activeFilters.property_type && activeFilters.property_type.length > 0) {
      filtered = filtered.filter(villa => activeFilters.property_type.includes(villa.property_type));
    }

    if (activeFilters.min_price) {
      filtered = filtered.filter(villa => villa.current_price >= activeFilters.min_price);
    }

    if (activeFilters.max_price) {
      filtered = filtered.filter(villa => villa.current_price <= activeFilters.max_price);
    }

    if (activeFilters.min_bedrooms) {
      filtered = filtered.filter(villa => villa.bedrooms >= activeFilters.min_bedrooms);
    }

    if (activeFilters.max_bedrooms) {
      filtered = filtered.filter(villa => villa.bedrooms <= activeFilters.max_bedrooms);
    }

    if (activeFilters.min_area) {
      filtered = filtered.filter(villa => villa.built_up_area >= activeFilters.min_area);
    }

    if (activeFilters.max_area) {
      filtered = filtered.filter(villa => villa.built_up_area <= activeFilters.max_area);
    }

    setFilteredVillas(filtered);
  }, [villas, searchTerm, activeFilters]);

  const handleVillaClick = async (villa: Villa) => {
    try {
      setSelectedVilla(villa);
      
      // Log interaction
      await villaInteractionsAPI.logInteraction(
        villa.id, 
        'current-user', // In real app, get from auth context
        'select',
        { from: 'property_map' }
      );
      
      if (batchMode) {
        toggleVillaSelection(villa.id);
      } else {
        setShowVillaDetails(true);
      }
    } catch (error) {
      console.error('Error handling villa click:', error);
    }
  };

  const handleVillaHover = async (villa: Villa | null) => {
    if (villa) {
      setHoveredVilla(villa.id);
      // Log view interaction
      try {
        await villaInteractionsAPI.logInteraction(
          villa.id,
          'current-user',
          'view',
          { from: 'property_map' }
        );
      } catch (error) {
        console.error('Error logging view interaction:', error);
      }
    } else {
      setHoveredVilla(null);
    }
  };

  const handleQuickRegistration = (villa: Villa) => {
    setSelectedVilla(villa);
    setShowQuickRegistration(true);
    setShowVillaDetails(false);
  };

  const handleRegistrationComplete = (registration: any) => {
    setShowQuickRegistration(false);
    setSelectedVilla(null);
    if (onRegistrationComplete) {
      onRegistrationComplete(registration);
    }
    // Show success message
    alert(`Registration for ${selectedVilla?.unit_number} completed successfully!`);
  };

  const toggleVillaSelection = (villaId: string) => {
    setSelectedVillas(prev => 
      prev.includes(villaId) 
        ? prev.filter(id => id !== villaId)
        : [...prev, villaId]
    );
  };

  const handleStatusUpdate = async (villaId: string, newStatus: string) => {
    try {
      await villaUnitsAPI.updateVillaStatus(villaId, newStatus, 'current-user');
      await loadVillas(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating villa status:', error);
    }
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - mapPosition.x, y: e.clientY - mapPosition.y });
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setMapPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(2, mapScale + delta));
    setMapScale(newScale);
  };

  const resetMapView = () => {
    setMapScale(1);
    setMapPosition({ x: 0, y: 0 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981'; // Green
      case 'reserved': return '#F59E0B'; // Yellow
      case 'sold': return '#EF4444'; // Red
      case 'under_construction': return '#3B82F6'; // Blue
      default: return '#6B7280'; // Gray
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">Interactive Property Map</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                List View
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setBatchMode(!batchMode)}
              className={`px-3 py-2 rounded text-sm ${
                batchMode ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {batchMode ? `Batch Mode (${selectedVillas.length})` : 'Batch Select'}
            </button>
            
            {viewMode === 'grid' && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
                >
                  -
                </button>
                <span className="text-sm text-gray-600 min-w-12 text-center">
                  {Math.round(mapScale * 100)}%
                </span>
                <button
                  onClick={() => handleZoom(0.1)}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
                >
                  +
                </button>
                <button
                  onClick={resetMapView}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 ml-2"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <MapSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              totalResults={filteredVillas.length}
            />
          </div>
          <MapFilters 
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
          />
        </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 flex">
        {/* Main Map Area */}
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          {viewMode === 'grid' ? (
            <div 
              className="absolute inset-0 cursor-move"
              style={{
                transform: `translate(${mapPosition.x}px, ${mapPosition.y}px) scale(${mapScale})`,
                transformOrigin: '0 0'
              }}
              onMouseDown={handleMapMouseDown}
              onMouseMove={handleMapMouseMove}
              onMouseUp={handleMapMouseUp}
              onMouseLeave={handleMapMouseUp}
            >
              <div className="relative" style={{ width: '1200px', height: '600px' }}>
                {filteredVillas.map((villa) => (
                  <VillaUnit
                    key={villa.id}
                    villa={villa}
                    isSelected={selectedVillas.includes(villa.id)}
                    isHovered={hoveredVilla === villa.id}
                    batchMode={batchMode}
                    onClick={() => handleVillaClick(villa)}
                    onHover={() => handleVillaHover(villa)}
                    onHoverEnd={() => handleVillaHover(null)}
                    statusColor={getStatusColor(villa.status)}
                  />
                ))}
              </div>
            </div>
          ) : (
            // List View
            <div className="p-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVillas.map((villa) => (
                  <div
                    key={villa.id}
                    className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleVillaClick(villa)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{villa.unit_number}</h3>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getStatusColor(villa.status) }}
                      >
                        {villa.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{villa.bedrooms} bed, {villa.bathrooms} bath</div>
                      <div>{villa.built_up_area} sqm</div>
                      <div className="font-semibold text-gray-900">
                        BHD {villa.current_price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* No Results */}
          {filteredVillas.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3" />
                </svg>
                <p className="mt-2 text-sm">No villas found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilters({});
                  }}
                  className="mt-2 text-blue-600 text-sm hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Legend Sidebar */}
        <div className="w-64 bg-white border-l border-gray-200">
          <MapLegend 
            villas={villas}
            filteredCount={filteredVillas.length}
            selectedCount={selectedVillas.length}
            batchMode={batchMode}
          />
        </div>
      </div>

      {/* Villa Details Modal */}
      {showVillaDetails && selectedVilla && (
        <VillaDetailsModal
          villa={selectedVilla}
          isOpen={showVillaDetails}
          onClose={() => {
            setShowVillaDetails(false);
            setSelectedVilla(null);
          }}
          onQuickRegistration={() => handleQuickRegistration(selectedVilla)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Quick Registration Modal */}
      {showQuickRegistration && selectedVilla && (
        <QuickRegistrationModal
          villa={selectedVilla}
          isOpen={showQuickRegistration}
          onClose={() => {
            setShowQuickRegistration(false);
            setSelectedVilla(null);
          }}
          onRegistrationComplete={handleRegistrationComplete}
        />
      )}
    </div>
  );
};

export default InteractivePropertyMap;