import React, { useState } from 'react';
import { formatCurrency, formatDate } from '../lib/utils';

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
}

interface LeadKanbanProps {
  leads: Lead[];
  onLeadUpdate: (leadId: string, newStatus: string) => void;
  onLeadClick: (lead: Lead) => void;
}

const statusColumns = {
  new: { title: 'New Leads', color: 'bg-blue-100 border-blue-200' },
  contacted: { title: 'Contacted', color: 'bg-yellow-100 border-yellow-200' },
  qualified: { title: 'Qualified', color: 'bg-green-100 border-green-200' },
  viewing: { title: 'Property Viewing', color: 'bg-purple-100 border-purple-200' },
  negotiating: { title: 'Negotiating', color: 'bg-orange-100 border-orange-200' },
  converted: { title: 'Closed Won', color: 'bg-emerald-100 border-emerald-200' },
  lost: { title: 'Closed Lost', color: 'bg-red-100 border-red-200' }
};

const LeadKanban: React.FC<LeadKanbanProps> = ({ leads, onLeadUpdate, onLeadClick }) => {
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);

  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDraggedOver(status);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId && draggedLead) {
      const lead = leads.find(l => l.id === leadId);
      if (lead && lead.status !== newStatus) {
        onLeadUpdate(leadId, newStatus);
      }
    }
    setDraggedLead(null);
    setDraggedOver(null);
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {Object.entries(statusColumns).map(([status, config]) => {
        const columnLeads = getLeadsByStatus(status);
        const isDraggedOver = draggedOver === status;
        
        return (
          <div key={status} className="flex-shrink-0 w-80">
            <div 
              className={`rounded-lg border-2 ${config.color} p-4 transition-all duration-200 ${
                isDraggedOver ? 'bg-opacity-75 scale-105' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{config.title}</h3>
                <span className="bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-600">
                  {columnLeads.length}
                </span>
              </div>
              
              <div className="space-y-3 min-h-[200px]">
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                      draggedLead === lead.id ? 'opacity-50 rotate-2' : ''
                    }`}
                    onClick={() => onLeadClick(lead)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {lead.first_name} {lead.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBuyerTypeColor(lead.buyer_type)}`}>
                        {lead.buyer_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{lead.source}</span>
                    </div>
                    
                    <div className="text-sm text-gray-700 mb-2">
                      <div className="font-medium">
                        {formatCurrency(lead.budget_min)} - {formatCurrency(lead.budget_max)}
                      </div>
                      <div className="text-xs text-gray-500">Timeline: {lead.timeline.replace('_', '-')}</div>
                    </div>
                    
                    {lead.notes && lead.notes.length > 0 && (
                      <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 mt-2">
                        {lead.notes[0].substring(0, 80)}...
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>Created: {formatDate(lead.created_at)}</span>
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-blue-400 rounded-full" title="Calls"></span>
                        <span className="w-2 h-2 bg-green-400 rounded-full" title="Emails"></span>
                        <span className="w-2 h-2 bg-purple-400 rounded-full" title="Meetings"></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadKanban;