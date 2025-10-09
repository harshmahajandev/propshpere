import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { useLeadStore } from '../store/leadStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { toast } from '../components/ui/Toaster'

interface LeadCardProps {
  lead: any
  onEdit: (lead: any) => void
  onView: (lead: any) => void
  onUpdateStatus: (id: string, status: string) => void
}

function LeadCard({ lead, onEdit, onView, onUpdateStatus }: LeadCardProps) {
  const statusColors = {
    prospect: 'bg-gray-100 text-gray-800',
    contacted: 'bg-blue-100 text-blue-800',
    viewing: 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    closed: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }

  const buyerTypeIcons = {
    hni: '💎',
    investor: '💼',
    retail: '🏠',
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-diyar-blue rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-lg">
              {lead.firstName[0]}{lead.lastName[0]}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xl">{buyerTypeIcons[lead.buyerType]}</span>
              <span className="text-sm text-gray-600 capitalize">
                {lead.buyerType} buyer
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
            {lead.score}%
          </span>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <EnvelopeIcon className="h-4 w-4 mr-2" />
          {lead.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="h-4 w-4 mr-2" />
          {lead.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 h-4 mr-2 text-center">💰</span>
          {lead.budget.min.toLocaleString()} - {lead.budget.max.toLocaleString()} {lead.budget.currency}
        </div>
      </div>
      
      {/* AI Insights */}
      {lead.aiInsights && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start">
            <SparklesIcon className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-800">AI Insight</p>
              <p className="text-xs text-blue-700 mt-1">
                {lead.aiInsights.purchaseProbability}% purchase probability
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Best contact time: {lead.aiInsights.optimalContactTime}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Activity */}
      {lead.activities && lead.activities.length > 0 && (
        <div className="mt-4 text-xs text-gray-500">
          Last activity: {lead.activities[0].type} - {new Date(lead.activities[0].createdAt).toLocaleDateString()}
        </div>
      )}
      
      {/* Actions */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onView(lead)}
          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 flex items-center justify-center"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View
        </button>
        <button
          onClick={() => onEdit(lead)}
          className="flex-1 bg-diyar-blue text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center"
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Edit
        </button>
        <div className="relative">
          <select
            onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
            value={lead.status}
            className="bg-diyar-gold text-white px-3 py-2 rounded-md text-sm font-medium appearance-none cursor-pointer"
          >
            <option value="prospect">Prospect</option>
            <option value="contacted">Contacted</option>
            <option value="viewing">Viewing</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>
    </motion.div>
  )
}

function LeadsPipeline({ leads, onUpdateStatus }: any) {
  const stages = [
    { id: 'prospect', label: 'Prospects', color: 'bg-gray-100' },
    { id: 'contacted', label: 'Contacted', color: 'bg-blue-100' },
    { id: 'viewing', label: 'Viewing', color: 'bg-yellow-100' },
    { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
    { id: 'closed', label: 'Closed', color: 'bg-green-100' },
  ]

  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead: any) => lead.status === status)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Lead Pipeline</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-6">
        {stages.map((stage) => {
          const stageLeads = getLeadsByStatus(stage.id)
          return (
            <div key={stage.id} className="space-y-3">
              <div className={`p-3 rounded-lg ${stage.color}`}>
                <h4 className="font-medium text-gray-900">{stage.label}</h4>
                <p className="text-sm text-gray-600">{stageLeads.length} leads</p>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {stageLeads.map((lead: any) => (
                  <motion.div
                    key={lead.id}
                    layout
                    className="bg-gray-50 p-3 rounded border cursor-move hover:shadow-sm"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {lead.firstName} {lead.lastName}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Score: {lead.score}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {lead.budget.min.toLocaleString()} - {lead.budget.max.toLocaleString()} {lead.budget.currency}
                    </div>
                    <div className="mt-2 flex space-x-1">
                      <button
                        onClick={() => console.log('Call lead')}
                        className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        <PhoneIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => console.log('Email lead')}
                        className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                      >
                        <EnvelopeIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => console.log('Schedule meeting')}
                        className="p-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                      >
                        <CalendarIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FilterPanel({ filters, onFilterChange }: any) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="prospect">Prospect</option>
            <option value="contacted">Contacted</option>
            <option value="viewing">Viewing</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buyer Type
          </label>
          <select
            value={filters.buyerType || ''}
            onChange={(e) => onFilterChange({ buyerType: e.target.value || undefined })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="hni">HNI</option>
            <option value="investor">Investor</option>
            <option value="retail">Retail</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score Range
          </label>
          <select
            onChange={(e) => {
              const range = e.target.value
              if (range) {
                const [min, max] = range.split('-').map(Number)
                onFilterChange({ scoreRange: [min, max] })
              } else {
                onFilterChange({ scoreRange: undefined })
              }
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Scores</option>
            <option value="80-100">High (80-100%)</option>
            <option value="60-79">Medium (60-79%)</option>
            <option value="0-59">Low (0-59%)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <select
            value={filters.assignedTo || ''}
            onChange={(e) => onFilterChange({ assignedTo: e.target.value || undefined })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Agents</option>
            <option value="me">Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default function Leads() {
  const [viewMode, setViewMode] = useState<'cards' | 'pipeline'>('cards')
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { 
    leads, 
    filters, 
    isLoading, 
    fetchLeads, 
    setFilters, 
    updateLeadStatus 
  } = useLeadStore()

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads, filters])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters({ search: term || undefined })
  }

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateLeadStatus(id, status as any)
      toast({
        type: 'success',
        title: 'Status Updated',
        message: 'Lead status has been updated successfully'
      })
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error',
        message: 'Failed to update lead status'
      })
    }
  }

  const handleView = (lead: any) => {
    console.log('View lead:', lead)
  }

  const handleEdit = (lead: any) => {
    console.log('Edit lead:', lead)
  }

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead =>
    `${lead.firstName} ${lead.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  )

  // Calculate stats
  const totalLeads = leads.length
  const highScoreLeads = leads.filter(l => l.score >= 80).length
  const closedDeals = leads.filter(l => l.status === 'closed').length
  const conversionRate = totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads & CRM</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your leads and track sales pipeline
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm rounded-md ${
                viewMode === 'cards' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-2 text-sm rounded-md ${
                viewMode === 'pipeline' ? 'bg-white shadow' : 'text-gray-600'
              }`}
            >
              Pipeline
            </button>
          </div>
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-diyar-blue mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
              <div className="text-sm text-gray-600">Total Leads</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{highScoreLeads}</div>
              <div className="text-sm text-gray-600">High Score</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎯</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">{closedDeals}</div>
              <div className="text-sm text-gray-600">Closed Deals</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📈</span>
            <div>
              <div className="text-2xl font-bold text-gray-900">{conversionRate}%</div>
              <div className="text-sm text-gray-600">Conversion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {viewMode === 'cards' && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-diyar-blue focus:border-diyar-blue"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && viewMode === 'cards' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </motion.div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading leads..." />
        </div>
      ) : viewMode === 'pipeline' ? (
        <LeadsPipeline leads={filteredLeads} onUpdateStatus={handleUpdateStatus} />
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first lead'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onView={handleView}
              onEdit={handleEdit}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}