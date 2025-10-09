import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { useIslands, useProjects, useProperties } from '../hooks/useData';

interface UnitMapProps {
  onUnitSelect?: (unit: any) => void;
}

const InteractiveMap: React.FC<UnitMapProps> = ({ onUnitSelect }) => {
  const { islands, loading: islandsLoading } = useIslands();
  const { projects, loading: projectsLoading } = useProjects();
  const { properties, loading: propertiesLoading } = useProperties();
  
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 0, max: 1000000});
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // Calculate island statistics
  const getIslandStats = (islandId: string) => {
    const islandProjects = projects.filter(p => p.island_id === islandId);
    const islandProperties = properties.filter(p => 
      islandProjects.some(proj => p.project === proj.display_name)
    );
    
    return {
      totalUnits: islandProperties.length,
      available: islandProperties.filter(p => p.status === 'Available').length,
      sold: islandProperties.filter(p => p.status === 'Sold').length,
      reserved: islandProperties.filter(p => p.status === 'Reserved').length,
      avgPrice: islandProperties.length > 0 ? 
        islandProperties.reduce((sum, p) => sum + parseFloat(p.price), 0) / islandProperties.length : 0
    };
  };

  // Get filtered properties for selected island/project
  const getFilteredProperties = () => {
    let filtered = properties;
    
    if (selectedIsland) {
      const islandProjects = projects.filter(p => p.island_id === selectedIsland);
      filtered = filtered.filter(p => 
        islandProjects.some(proj => p.project === proj.display_name)
      );
    }
    
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      if (project) {
        filtered = filtered.filter(p => p.project === project.display_name);
      }
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }
    
    filtered = filtered.filter(p => {
      const price = parseFloat(p.price);
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    return filtered;
  };

  const handleUnitClick = (unit: any) => {
    setSelectedUnit(unit);
    setShowUnitModal(true);
    if (onUnitSelect) {
      onUnitSelect(unit);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500 hover:bg-green-600';
      case 'Reserved': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'Sold': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (islandsLoading || projectsLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Loading interactive map...</span>
      </div>
    );
  }

  const filteredProperties = getFilteredProperties();

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Interactive Property Map</h2>
          <div className="flex items-center space-x-4">
            {/* Status Legend */}
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Sold</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Island</label>
            <select
              value={selectedIsland || ''}
              onChange={(e) => {
                setSelectedIsland(e.target.value || null);
                setSelectedProject(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Islands</option>
              {islands.map(island => (
                <option key={island.id} value={island.id}>{island.display_name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedIsland}
            >
              <option value="">All Projects</option>
              {selectedIsland && projects
                .filter(p => p.island_id === selectedIsland)
                .map(project => (
                  <option key={project.id} value={project.id}>{project.display_name}</option>
                ))
              }
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <select
              onChange={(e) => {
                const [min, max] = e.target.value.split('-').map(Number);
                setPriceRange({min, max});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0-1000000">All Prices</option>
              <option value="0-200000">Under BD 200K</option>
              <option value="200000-400000">BD 200K - 400K</option>
              <option value="400000-600000">BD 400K - 600K</option>
              <option value="600000-1000000">Above BD 600K</option>
            </select>
          </div>
        </div>
      </div>

      {/* Islands Overview */}
      {!selectedIsland && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Diyar Islands Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {islands.map(island => {
              const stats = getIslandStats(island.id);
              const availabilityRate = stats.totalUnits > 0 ? (stats.available / stats.totalUnits * 100).toFixed(1) : '0';
              
              return (
                <div 
                  key={island.id}
                  onClick={() => setSelectedIsland(island.id)}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200 cursor-pointer hover:shadow-md transition-all duration-200 hover:from-blue-100 hover:to-blue-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{island.display_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      island.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {island.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{island.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalUnits}</div>
                      <div className="text-xs text-gray-600">Total Units</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{availabilityRate}%</div>
                      <div className="text-xs text-gray-600">Available</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600 mb-3">
                    <span>Available: {stats.available}</span>
                    <span>Reserved: {stats.reserved}</span>
                    <span>Sold: {stats.sold}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{width: `${stats.totalUnits > 0 ? (stats.available / stats.totalUnits * 100) : 0}%`}}
                      ></div>
                      <div 
                        className="bg-yellow-500" 
                        style={{width: `${stats.totalUnits > 0 ? (stats.reserved / stats.totalUnits * 100) : 0}%`}}
                      ></div>
                      <div 
                        className="bg-red-500" 
                        style={{width: `${stats.totalUnits > 0 ? (stats.sold / stats.totalUnits * 100) : 0}%`}}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      Avg. Price: {formatCurrency(stats.avgPrice)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Property Grid View */}
      {(selectedIsland || selectedProject) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedProject 
                  ? projects.find(p => p.id === selectedProject)?.display_name
                  : islands.find(i => i.id === selectedIsland)?.display_name
                } Units
              </h3>
              <p className="text-sm text-gray-600">{filteredProperties.length} properties found</p>
            </div>
            <button
              onClick={() => {
                setSelectedIsland(null);
                setSelectedProject(null);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Overview
            </button>
          </div>
          
          {/* Unit Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
            {filteredProperties.map((property, index) => {
              const unitNumber = property.title.split(' ').pop() || (index + 1).toString();
              
              return (
                <div
                  key={property.id}
                  onClick={() => handleUnitClick(property)}
                  className={`aspect-square rounded-lg flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-all duration-200 ${getStatusColor(property.status)} relative group`}
                  title={`${property.title} - ${property.status} - ${formatCurrency(parseFloat(property.price))}`}
                >
                  <span className="text-center">
                    {unitNumber}
                  </span>
                  
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {property.title}<br/>
                    {property.status} - {formatCurrency(parseFloat(property.price))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m14 0V9a2 2 0 00-2-2M9 7h6m-6 4h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Properties Found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      )}

      {/* Unit Detail Modal */}
      {showUnitModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selectedUnit.title}</h2>
                <button 
                  onClick={() => setShowUnitModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium">{selectedUnit.project}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedUnit.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{parseFloat(selectedUnit.size).toFixed(0)} sqm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="font-medium">{selectedUnit.bedrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-medium">{selectedUnit.bathrooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        selectedUnit.status === 'Available' ? 'text-green-600' :
                        selectedUnit.status === 'Reserved' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {selectedUnit.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Pricing & Availability</h3>
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(parseFloat(selectedUnit.price))}
                      </div>
                      <div className="text-sm text-gray-600">Total Price</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(parseFloat(selectedUnit.price) / parseFloat(selectedUnit.size))}/sqm
                      </div>
                      <div className="text-sm text-gray-600">Price per sqm</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedUnit.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 text-sm">{selectedUnit.description}</p>
                </div>
              )}
              
              {selectedUnit.amenities && selectedUnit.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUnit.amenities.map((amenity: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowUnitModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedUnit.status === 'Available' && (
                  <>
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Schedule Viewing
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                      Reserve Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;