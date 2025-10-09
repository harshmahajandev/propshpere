import React, { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '../lib/utils';
import { recommendationsAPI, customersAPI, propertiesAPI } from '../lib/api';

interface Recommendation {
  id: string;
  customer_id: string;
  property_id: string;
  match_score: number;
  compatibility_factors: any;
  recommendation_reason: string;
  status: string;
  viewed_at?: string;
  favorited_at?: string;
  created_at: string;
}

interface RecommendationDashboardProps {
  selectedCustomerId?: string;
}

const RecommendationDashboard: React.FC<RecommendationDashboardProps> = ({ selectedCustomerId }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(selectedCustomerId || '');
  const [generatingRecs, setGeneratingRecs] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      fetchRecommendations(selectedCustomer);
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const data = await customersAPI.getAll();
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await propertiesAPI.getAll();
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchRecommendations = async (customerId: string) => {
    try {
      setLoading(true);
      const data = await recommendationsAPI.getForCustomer(customerId);
      setRecommendations(data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedCustomer) return;
    
    try {
      setGeneratingRecs(true);
      await recommendationsAPI.generateRecommendations(selectedCustomer);
      // Refresh recommendations after generation
      await fetchRecommendations(selectedCustomer);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGeneratingRecs(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-100';
    if (score >= 85) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'sent': 'bg-blue-100 text-blue-800',
      'clicked': 'bg-yellow-100 text-yellow-800',
      'viewed': 'bg-purple-100 text-purple-800',
      'interested': 'bg-green-100 text-green-800',
      'converted': 'bg-emerald-100 text-emerald-800',
      'ignored': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPropertyById = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
  };

  const getCustomerById = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };

  const selectedCustomerData = selectedCustomer ? getCustomerById(selectedCustomer) : null;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Recommendation Engine</h2>
          <p className="text-gray-600">Generate and manage personalized property recommendations</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.full_name}
              </option>
            ))}
          </select>
          <button
            onClick={generateRecommendations}
            disabled={!selectedCustomer || generatingRecs}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {generatingRecs ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Recommendations</span>
            )}
          </button>
        </div>
      </div>

      {/* Customer Profile Summary */}
      {selectedCustomerData && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedCustomerData.full_name}</h3>
              <p className="text-gray-600">{selectedCustomerData.email} • {selectedCustomerData.role}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Customer Segment</div>
              <div className="font-semibold text-purple-600">{selectedCustomerData.role?.toUpperCase()}</div>
            </div>
          </div>
          {selectedCustomerData.customer_preferences && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-600">Preferences:</span>
                <div className="text-sm font-medium">
                  {JSON.stringify(selectedCustomerData.customer_preferences).substring(0, 100)}...
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading recommendations...</span>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map(rec => {
            const property = getPropertyById(rec.property_id);
            if (!property) return null;
            
            return (
              <div key={rec.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                      <p className="text-gray-600">{property.project} • {property.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(rec.match_score)}`}>
                        {rec.match_score.toFixed(1)}%
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rec.status)}`}>
                        {rec.status}
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <div className="font-semibold text-lg text-blue-600">
                        {formatCurrency(parseFloat(property.price))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Size:</span>
                      <div className="font-medium">{parseFloat(property.size).toFixed(0)} sqm</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Bedrooms:</span>
                      <div className="font-medium">{property.bedrooms}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="font-medium">{property.status}</div>
                    </div>
                  </div>

                  {/* Compatibility Factors */}
                  {rec.compatibility_factors && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Compatibility Factors</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(rec.compatibility_factors).map(([factor, score]) => (
                          <div key={factor} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 capitalize">{factor.replace('_', ' ')}:</span>
                            <span className="font-medium">{Number(score)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation Reason */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Why This Property?</h4>
                    <p className="text-sm text-gray-600">{rec.recommendation_reason}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(rec.created_at)}
                      {rec.viewed_at && (
                        <> • Viewed: {formatDate(rec.viewed_at)}</>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Property
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                        Send to Customer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : selectedCustomer ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 mb-4">Generate AI-powered property recommendations for this customer</p>
          <button
            onClick={generateRecommendations}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Generate Recommendations
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Customer</h3>
          <p className="text-gray-600">Choose a customer to view and generate personalized property recommendations</p>
        </div>
      )}
    </div>
  );
};

export default RecommendationDashboard;