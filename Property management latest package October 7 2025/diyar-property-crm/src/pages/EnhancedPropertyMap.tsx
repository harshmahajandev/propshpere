import React, { useState, useEffect } from 'react';
import { MapPin, Home, Eye, Calendar, Phone, Mail, CheckCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import EnhancedQuickReservation from '../components/EnhancedQuickReservation';

const supabaseUrl = "https://jnilfkgeojjydbywktol.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EnhancedPropertyMap: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [islands, setIslands] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedIsland, setSelectedIsland] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<{ min: number; max: number }>({ min: 0, max: 1000000 });
  const [showPropertyDetails, setShowPropertyDetails] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!propertiesError) {
        setProperties(propertiesData || []);
      }

      // Load islands
      const { data: islandsData, error: islandsError } = await supabase
        .from('islands')
        .select('*')
        .order('name');
      
      if (!islandsError) {
        setIslands(islandsData || []);
      }

      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      
      if (!projectsError) {
        setProjects(projectsData || []);
      }

      // Load quick reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('quick_reservations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!reservationsError) {
        setReservations(reservationsData || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    let filtered = properties;

    if (selectedIsland) {
      const islandProjects = projects.filter(p => p.island_id === selectedIsland);
      filtered = filtered.filter(p => 
        islandProjects.some(proj => p.project === proj.name)
      );
    }

    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      if (project) {
        filtered = filtered.filter(p => p.project === project.name);
      }
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }

    filtered = filtered.filter(p => {
      const price = parseFloat(p.price || '0');
      return price >= priceFilter.min && price <= priceFilter.max;
    });

    return filtered;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'available': return 'bg-green-500 hover:bg-green-600 border-green-600';
      case 'reserved': return 'bg-yellow-500 hover:bg-yellow-600 border-yellow-600';
      case 'provisional': return 'bg-orange-500 hover:bg-orange-600 border-orange-600';
      case 'sold': return 'bg-red-500 hover:bg-red-600 border-red-600';
      case 'maintenance': return 'bg-gray-500 hover:bg-gray-600 border-gray-600';
      default: return 'bg-blue-500 hover:bg-blue-600 border-blue-600';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      case 'provisional': return <Clock className="w-4 h-4" />;
      case 'sold': return <Home className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BH', {
      style: 'currency',
      currency: 'BHD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePropertyClick = (property: any) => {
    if (property.status.toLowerCase() === 'available') {
      setSelectedProperty(property);
      setShowReservationModal(true);
    } else {
      setShowPropertyDetails(property);
    }
  };

  const handleReservationSuccess = (reservation: any) => {
    console.log('Reservation created:', reservation);
    // Refresh data to show updated status
    loadData();
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    successDiv.textContent = `Reservation created successfully! Hold until: ${new Date(reservation.holdUntil).toLocaleDateString()}`;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 5000);
  };

  const filteredProperties = getFilteredProperties();
  const availableCount = filteredProperties.filter(p => p.status.toLowerCase() === 'available').length;
  const reservedCount = filteredProperties.filter(p => p.status.toLowerCase() === 'reserved').length;
  const soldCount = filteredProperties.filter(p => p.status.toLowerCase() === 'sold').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Loading property map...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interactive Property Map</h1>
            <p className="text-gray-600">Click on any available property to make a quick reservation</p>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Available Properties
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">{reservedCount}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Reserved Properties
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{soldCount}</div>
            <div className="text-sm text-gray-600 flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Sold Properties
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{filteredProperties.length}</div>
            <div className="text-sm text-gray-600">Total Filtered</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Island</label>
              <select
                value={selectedIsland}
                onChange={(e) => {
                  setSelectedIsland(e.target.value);
                  setSelectedProject('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Islands</option>
                {islands.map(island => (
                  <option key={island.id} value={island.id}>{island.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedIsland}
              >
                <option value="">All Projects</option>
                {selectedIsland && projects
                  .filter(p => p.island_id === selectedIsland)
                  .map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))
                }
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <select
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-').map(Number);
                  setPriceFilter({ min, max });
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

        {/* Legend */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Property Status Legend</h4>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-600"></div>
                <span>Available (Click to Reserve)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded border-2 border-yellow-600"></div>
                <span>Reserved</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-600"></div>
                <span>Sold</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded border-2 border-gray-600"></div>
                <span>Maintenance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Grid Map */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Property Grid View</h3>
            <div className="text-sm text-gray-600">
              Showing {filteredProperties.length} properties
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {filteredProperties.map((property, index) => {
              const isReservable = property.status.toLowerCase() === 'available';
              return (
                <div
                  key={property.id}
                  onClick={() => handlePropertyClick(property)}
                  className={`
                    relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg
                    ${getStatusColor(property.status)}
                    ${isReservable ? 'ring-2 ring-green-300 ring-opacity-50' : ''}
                  `}
                  title={`${property.property_name || property.type} - ${formatCurrency(parseFloat(property.price || '0'))} - ${property.status}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs font-medium p-1">
                    <div className="mb-1">
                      {getStatusIcon(property.status)}
                    </div>
                    <div className="text-center leading-tight">
                      <div className="font-semibold">{property.property_name || `${property.type.slice(0, 4)}`}</div>
                      <div className="opacity-90">{formatCurrency(parseFloat(property.price || '0')).replace('BHD', 'BD').replace(',', 'K').replace('000', '')}</div>
                    </div>
                  </div>
                  
                  {isReservable && (
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  {/* Property index for reference */}
                  <div className="absolute bottom-1 left-1 text-xs opacity-75">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h4>
              <p className="text-gray-600">Try adjusting your filters to see more properties.</p>
            </div>
          )}
        </div>

        {/* Recent Reservations */}
        {reservations.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reservations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hold Until</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.slice(0, 5).map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{reservation.customer_name}</div>
                          <div className="text-sm text-gray-500">{reservation.customer_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.property_id?.slice(0, 8) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reservation.reservation_type === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reservation.reservation_type === 'provisional' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {reservation.reservation_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.hold_until ? new Date(reservation.hold_until).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reservation.deposit_paid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {reservation.deposit_paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reservation.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Reservation Modal */}
        {selectedProperty && (
          <EnhancedQuickReservation
            property={selectedProperty}
            isOpen={showReservationModal}
            onClose={() => {
              setShowReservationModal(false);
              setSelectedProperty(null);
            }}
            onSuccess={handleReservationSuccess}
          />
        )}

        {/* Property Details Modal */}
        {showPropertyDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                  <button
                    onClick={() => setShowPropertyDetails(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{showPropertyDetails.property_name || showPropertyDetails.type}</h4>
                    <p className="text-sm text-gray-600">{showPropertyDetails.project}, {showPropertyDetails.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Price:</span>
                      <div>{formatCurrency(parseFloat(showPropertyDetails.price || '0'))}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <div className="flex items-center space-x-1 mt-1">
                        {getStatusIcon(showPropertyDetails.status)}
                        <span className="capitalize">{showPropertyDetails.status}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Bedrooms:</span>
                      <div>{showPropertyDetails.bedrooms || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Bathrooms:</span>
                      <div>{showPropertyDetails.bathrooms || 'N/A'}</div>
                    </div>
                  </div>
                  
                  {showPropertyDetails.status.toLowerCase() !== 'available' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        This property is currently {showPropertyDetails.status.toLowerCase()} and not available for reservation.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowPropertyDetails(null)}
                    className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPropertyMap;