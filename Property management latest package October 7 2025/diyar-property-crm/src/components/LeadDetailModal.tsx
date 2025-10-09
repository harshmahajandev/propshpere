import React, { useState } from 'react';
import { formatCurrency, formatDateTime } from '../lib/utils';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  buyer_type: string;
  budget_min: number;
  budget_max: number;
  status: string;
  score: number;
  source: string;
  timeline: string;
  notes: string[];
  activities: any;
  ai_insights: any;
  created_at: string;
  property_interests: string[];
}

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (leadId: string, newStatus: string) => void;
}

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-800' },
  { value: 'viewing', label: 'Property Viewing', color: 'bg-purple-100 text-purple-800' },
  { value: 'negotiating', label: 'Negotiating', color: 'bg-orange-100 text-orange-800' },
  { value: 'converted', label: 'Closed Won', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'lost', label: 'Closed Lost', color: 'bg-red-100 text-red-800' }
];

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, isOpen, onClose, onStatusUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  
  if (!isOpen || !lead) return null;

  const handleStatusChange = (newStatus: string) => {
    onStatusUpdate(lead.id, newStatus);
  };

  const addNote = () => {
    if (newNote.trim()) {
      // In a real implementation, this would make an API call
      console.log('Adding note:', newNote);
      setNewNote('');
    }
  };

  const getBuyerTypeColor = (type: string) => {
    const colors = {
      'hni': 'bg-purple-100 text-purple-800',
      'investor': 'bg-blue-100 text-blue-800', 
      'retail': 'bg-green-100 text-green-800',
      'commercial': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{lead.first_name} {lead.last_name}</h2>
              <p className="text-blue-100">{lead.email} • {lead.phone}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-semibold">Score: {lead.score}</div>
                <div className="text-sm text-blue-100">Lead Quality</div>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-4 border-r">
            <div className="space-y-4">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={lead.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Quick Info */}
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Buyer Type:</span>
                  <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${getBuyerTypeColor(lead.buyer_type)}`}>
                    {lead.buyer_type.toUpperCase()}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Budget Range:</span>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatCurrency(lead.budget_min)} - {formatCurrency(lead.budget_max)}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Timeline:</span>
                  <div className="mt-1 text-sm text-gray-900">{lead.timeline.replace('_', '-')}</div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Source:</span>
                  <div className="mt-1 text-sm text-gray-900">{lead.source}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button className="w-full bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700">
                  Call Customer
                </button>
                <button className="w-full bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700">
                  Send Email
                </button>
                <button className="w-full bg-purple-600 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-700">
                  Schedule Meeting
                </button>
                <button className="w-full bg-orange-600 text-white px-3 py-2 rounded-md text-sm hover:bg-orange-700">
                  Generate Recommendations
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'activity', label: 'Activity' },
                  { id: 'recommendations', label: 'Recommendations' },
                  { id: 'notes', label: 'Notes' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="h-96 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Property Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {lead.property_interests?.map((interest, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {lead.ai_insights && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">AI Insights</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {lead.ai_insights.recommendations && (
                          <div className="mb-3">
                            <span className="font-medium text-gray-700">Recommended Properties:</span>
                            <ul className="mt-2 space-y-1">
                              {lead.ai_insights.recommendations.map((rec: string, index: number) => (
                                <li key={index} className="text-sm text-gray-600">• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Compatibility Score:</span>
                          <span className="ml-2 text-green-600 font-semibold">{lead.ai_insights.compatibility_score}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                  {lead.activities && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-700">Calls Made</span>
                        <span className="font-semibold text-blue-600">{lead.activities.calls || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">Emails Sent</span>
                        <span className="font-semibold text-green-600">{lead.activities.emails || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm text-gray-700">Meetings</span>
                        <span className="font-semibold text-purple-600">{lead.activities.meetings || 0}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Last Contact:</span>
                        <span className="ml-2 font-medium">{lead.activities.last_contact || 'Never'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">AI Property Recommendations</h3>
                  <div className="text-gray-600 text-center py-8">
                    Property recommendations will be displayed here based on customer profile and preferences.
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  
                  {/* Add Note */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this lead..."
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <button
                      onClick={addNote}
                      className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                      Add Note
                    </button>
                  </div>
                  
                  {/* Existing Notes */}
                  <div className="space-y-3">
                    {lead.notes && lead.notes.map((note, index) => (
                      <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-700">{note}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          Added on {formatDateTime(lead.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;