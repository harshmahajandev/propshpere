import React from 'react';
import { formatDate, getLeadStatusColor } from '../lib/utils';

interface LeadCardProps {
  lead: {
    id: string;
    status: string;
    lead_source: string;
    interest_level: string;
    budget_range: string;
    created_at: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  };
  onClick?: (lead: any) => void;
  className?: string;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onClick, className = '' }) => {
  const statusColor = getLeadStatusColor(lead.status);
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 ${className}`}
      onClick={() => onClick?.(lead)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {lead.customer_name || 'New Lead'}
            </h3>
            <p className="text-sm text-gray-600">{lead.customer_email}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {lead.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        {/* Lead Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Source:</span>
            <span className="font-medium">{lead.lead_source}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Interest Level:</span>
            <span className="font-medium">{lead.interest_level}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget Range:</span>
            <span className="font-medium">{lead.budget_range}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Created:</span>
            <span className="font-medium">{formatDate(lead.created_at)}</span>
          </div>
        </div>
        
        {/* Contact Info */}
        {lead.customer_phone && (
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600">
              Phone: <span className="font-medium text-gray-900">{lead.customer_phone}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCard;