import React, { useState, useEffect } from 'react';
import { StatCard, LoadingSpinner, LeadKanban, LeadDetailModal, RecommendationDashboard, QuickReservation, BulkRecommendations } from '../components';
import { useLeads, useCustomers, useProperties, useRecommendations } from '../hooks/useData';
import { formatCurrency } from '../lib/utils';
import { leadsAPI } from '../lib/api';

const SalesCrm: React.FC = () => {
  const { leads, loading: leadsLoading, createLead, updateLeadStatus } = useLeads();
  const { customers, loading: customersLoading } = useCustomers();
  const { properties, loading: propertiesLoading } = useProperties();
  
  const [selectedView, setSelectedView] = useState<'pipeline' | 'customers' | 'recommendations' | 'analytics'>('pipeline');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [showQuickReservation, setShowQuickReservation] = useState(false);
  const [showBulkRecommendations, setShowBulkRecommendations] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [newLeadData, setNewLeadData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    buyer_type: 'retail',
    budget_min: 200000,
    budget_max: 300000,
    source: 'Website',
    timeline: '1-3_months',
    property_interests: ['Villa'],
    notes: ['Initial contact - interested in villa properties']
  });

  // Calculate sales metrics
  const totalLeads = leads.length;
  const activeLeads = leads.filter(lead => ['new', 'contacted', 'qualified', 'viewing', 'negotiating'].includes(lead.status)).length;
  const hotProspects = leads.filter(lead => lead.score >= 80 && ['qualified', 'viewing', 'negotiating'].includes(lead.status)).length;
  const closedWon = leads.filter(lead => lead.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((closedWon / totalLeads) * 100).toFixed(1) : '0';
  
  // Calculate revenue from closed deals
  const monthlyRevenue = leads
    .filter(lead => lead.status === 'converted')
    .reduce((sum, lead) => sum + ((lead.budget_min + lead.budget_max) / 2), 0);

  const handleLeadUpdate = async (leadId: string, newStatus: string) => {
    try {
      // Use the proper state management hook to update lead status
      await updateLeadStatus(leadId, newStatus);
      
      // Show success message
      const leadName = leads.find(l => l.id === leadId);
      if (leadName) {
        // Use a more professional notification instead of alert
        console.log(`${leadName.first_name} ${leadName.last_name}'s status updated to ${newStatus}`);
        
        // Create a temporary toast notification element
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = `${leadName.first_name} ${leadName.last_name}'s status updated to ${newStatus}`;
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
      
      // Create a temporary error toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Failed to update lead status. Please try again.';
      document.body.appendChild(toast);
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  };

  const handleLeadClick = (lead: any) => {
    setSelectedLead(lead);
    setModalOpen(true);
  };

  const handleNewLead = async () => {
    try {
      await createLead({
        ...newLeadData,
        status: 'new',
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        activities: {
          last_contact: new Date().toISOString().split('T')[0],
          meetings: 0,
          calls: 0,
          emails: 1
        },
        ai_insights: {
          compatibility_score: Math.floor(Math.random() * 30) + 70,
          recommendations: ['Property matching in progress']
        }
      });
      
      setShowNewLeadForm(false);
      setNewLeadData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        buyer_type: 'retail',
        budget_min: 200000,
        budget_max: 300000,
        source: 'Website',
        timeline: '1-3_months',
        property_interests: ['Villa'],
        notes: ['Initial contact - interested in villa properties']
      });
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleQuickReservation = () => {
    // For demo purposes, select the first available property
    if (properties.length > 0) {
      setSelectedProperty(properties.find(p => p.status === 'available') || properties[0]);
    }
    setShowQuickReservation(true);
  };

  const handleReservationComplete = (reservation: any) => {
    console.log('Reservation completed:', reservation);
    setShowQuickReservation(false);
    setSelectedProperty(null);
    // In a real app, you would save this reservation to the database
    alert(`Reservation ${reservation.reservationNumber} created successfully!`);
  };

  const handleBulkRecommendations = () => {
    setShowBulkRecommendations(true);
  };

  const handleBulkRecommendationsComplete = (recommendations: any) => {
    console.log('Bulk recommendations sent:', recommendations);
    setShowBulkRecommendations(false);
    // In a real app, you would save this to the database and track the campaign
    alert(`Recommendations sent to ${recommendations.recipients} customers successfully!`);
  };

  if (leadsLoading || customersLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales CRM</h1>
          <p className="text-gray-600">Manage leads, customers, and property recommendations</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('pipeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedView === 'pipeline'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sales Pipeline
          </button>
          <button
            onClick={() => setSelectedView('customers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedView === 'customers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Customer Profiles
          </button>
          <button
            onClick={() => setSelectedView('recommendations')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedView === 'recommendations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            AI Recommendations
          </button>
          <button
            onClick={() => setSelectedView('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedView === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          color="blue"
          change={{ value: "+12%", type: "increase" }}
        />
        <StatCard
          title="Active Leads"
          value={activeLeads}
          color="green"
          change={{ value: "+8%", type: "increase" }}
        />
        <StatCard
          title="Hot Prospects"
          value={hotProspects}
          color="red"
          change={{ value: "+15%", type: "increase" }}
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          color="purple"
          change={{ value: "+2.3%", type: "increase" }}
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(monthlyRevenue)}
          color="yellow"
          change={{ value: "+25%", type: "increase" }}
        />
      </div>

      {/* Main Content */}
      {selectedView === 'pipeline' && (
        <div className="space-y-6">
          {/* Pipeline Actions */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Sales Pipeline</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewLeadForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New Lead</span>
              </button>
              <button
                onClick={handleQuickReservation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Quick Reservation</span>
              </button>
              <button
                onClick={handleBulkRecommendations}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Generate Bulk Recommendations</span>
              </button>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <LeadKanban
              leads={leads}
              onLeadUpdate={handleLeadUpdate}
              onLeadClick={handleLeadClick}
            />
          </div>
        </div>
      )}

      {selectedView === 'customers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Customer Profiles</h2>
            <div className="text-sm text-gray-600">{customers.length} customers</div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {customers.slice(0, 12).map(customer => (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.full_name}</h3>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.role === 'hni' ? 'bg-purple-100 text-purple-800' :
                    customer.role === 'investor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {customer.role?.toUpperCase()}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{customer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{customer.company || 'Individual'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nationality:</span>
                    <span className="font-medium">{customer.nationality || 'Bahraini'}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700">
                    View Profile
                  </button>
                  <button className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700">
                    Generate Recs
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedView === 'recommendations' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <RecommendationDashboard />
        </div>
      )}

      {selectedView === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Sales Analytics</h2>
          
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries({
                  new: leads.filter(l => l.status === 'new').length,
                  contacted: leads.filter(l => l.status === 'contacted').length,
                  qualified: leads.filter(l => l.status === 'qualified').length,
                  viewing: leads.filter(l => l.status === 'viewing').length,
                  negotiating: leads.filter(l => l.status === 'negotiating').length,
                  converted: leads.filter(l => l.status === 'converted').length,
                  lost: leads.filter(l => l.status === 'lost').length
                }).map(([status, count]) => {
                  const percentage = totalLeads > 0 ? (count / totalLeads * 100).toFixed(1) : '0';
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className="capitalize text-sm text-gray-600">{status.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Buyer Type Breakdown</h3>
              <div className="space-y-3">
                {Object.entries({
                  retail: leads.filter(l => l.buyer_type === 'retail').length,
                  hni: leads.filter(l => l.buyer_type === 'hni').length,
                  investor: leads.filter(l => l.buyer_type === 'investor').length,
                  commercial: leads.filter(l => l.buyer_type === 'commercial').length
                }).map(([type, count]) => {
                  const percentage = totalLeads > 0 ? (count / totalLeads * 100).toFixed(1) : '0';
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="uppercase text-sm text-gray-600">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count} ({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusUpdate={handleLeadUpdate}
      />

      {/* New Lead Form Modal */}
      {showNewLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Lead</h2>
                <button 
                  onClick={() => setShowNewLeadForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newLeadData.first_name}
                    onChange={(e) => setNewLeadData({...newLeadData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newLeadData.last_name}
                    onChange={(e) => setNewLeadData({...newLeadData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newLeadData.email}
                    onChange={(e) => setNewLeadData({...newLeadData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newLeadData.phone}
                    onChange={(e) => setNewLeadData({...newLeadData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Type</label>
                  <select
                    value={newLeadData.buyer_type}
                    onChange={(e) => setNewLeadData({...newLeadData, buyer_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="retail">Retail</option>
                    <option value="hni">HNI</option>
                    <option value="investor">Investor</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select
                    value={newLeadData.source}
                    onChange={(e) => setNewLeadData({...newLeadData, source: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Direct Call">Direct Call</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowNewLeadForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNewLead}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reservation Modal */}
      {showQuickReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Reservation</h2>
                <button 
                  onClick={() => setShowQuickReservation(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <QuickReservation
                selectedProperty={selectedProperty}
                onClose={() => setShowQuickReservation(false)}
                onReservationComplete={handleReservationComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Recommendations Modal */}
      {showBulkRecommendations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Generate Bulk Recommendations</h2>
                <button 
                  onClick={() => setShowBulkRecommendations(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <BulkRecommendations
                onClose={() => setShowBulkRecommendations(false)}
                onComplete={handleBulkRecommendationsComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCrm;