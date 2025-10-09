import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  UserPlus, 
  Users, 
  Search, 
  Plus, 
  Star, 
  TrendingUp, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Edit,
  CheckCircle2,
  XCircle,
  Clock,
  Eye
} from 'lucide-react'
import { format } from 'date-fns'
import { supabase, type Lead } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface LeadManagementProps {
  onLeadConverted?: (leadId: string, customerId: string) => void
}

export const LeadManagement: React.FC<LeadManagementProps> = ({ onLeadConverted }) => {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  
  const [leadForm, setLeadForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    preferred_language: 'en',
    buyer_type: 'retail',
    budget_min: '',
    budget_max: '',
    currency: 'BHD',
    property_interests: [] as string[],
    timeline: 'flexible',
    status: 'new',
    source: '',
    notes: [] as string[]
  })
  
  const [conversionForm, setConversionForm] = useState({
    full_name: '',
    phone: '',
    nationality: '',
    company: '',
    customer_preferences: {},
    customer_requirements: '',
    risk_level: 'low'
  })

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setLeads(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLead = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...leadForm,
          budget_min: leadForm.budget_min ? parseFloat(leadForm.budget_min) : null,
          budget_max: leadForm.budget_max ? parseFloat(leadForm.budget_max) : null,
          score: calculateLeadScore(leadForm)
        })
        .select()
        .single()
      
      if (error) throw error
      
      setLeads([data, ...leads])
      setShowCreateDialog(false)
      resetLeadForm()
      toast.success('Lead created successfully')
    } catch (error: any) {
      toast.error('Failed to create lead')
    } finally {
      setLoading(false)
    }
  }

  const handleConvertLead = async () => {
    if (!selectedLead) return
    
    setLoading(true)
    try {
      // Create customer profile
      const { data: customer, error: customerError } = await supabase
        .from('profiles')
        .insert({
          email: selectedLead.email,
          full_name: conversionForm.full_name,
          phone: conversionForm.phone,
          role: 'customer',
          nationality: conversionForm.nationality,
          company: conversionForm.company,
          customer_preferences: conversionForm.customer_preferences,
          customer_requirements: conversionForm.customer_requirements,
          risk_level: conversionForm.risk_level,
          conversion_date: new Date().toISOString()
        })
        .select()
        .single()
      
      if (customerError) throw customerError
      
      // Update lead status
      const { error: leadError } = await supabase
        .from('leads')
        .update({ 
          status: 'converted',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedLead.id)
      
      if (leadError) throw leadError
      
      // Update local state
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, status: 'converted' as const }
          : lead
      ))
      
      setShowConvertDialog(false)
      setSelectedLead(null)
      resetConversionForm()
      toast.success('Lead converted to customer successfully')
      
      if (onLeadConverted) {
        onLeadConverted(selectedLead.id, customer.id)
      }
    } catch (error: any) {
      toast.error('Failed to convert lead')
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
      
      if (error) throw error
      
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: status as any } : lead
      ))
      
      toast.success('Lead status updated')
    } catch (error: any) {
      toast.error('Failed to update lead status')
    }
  }

  const calculateLeadScore = (lead: any) => {
    let score = 50 // Base score
    
    // Budget scoring
    if (lead.budget_max) {
      const budget = parseFloat(lead.budget_max)
      if (budget > 500000) score += 30
      else if (budget > 200000) score += 20
      else if (budget > 100000) score += 10
    }
    
    // Timeline scoring
    if (lead.timeline === 'immediate') score += 25
    else if (lead.timeline === '1-3_months') score += 15
    else if (lead.timeline === '3-6_months') score += 10
    
    // Buyer type scoring
    if (lead.buyer_type === 'hni') score += 20
    else if (lead.buyer_type === 'investor') score += 15
    
    return Math.min(100, Math.max(0, score))
  }

  const resetLeadForm = () => {
    setLeadForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      preferred_language: 'en',
      buyer_type: 'retail',
      budget_min: '',
      budget_max: '',
      currency: 'BHD',
      property_interests: [],
      timeline: 'flexible',
      status: 'new',
      source: '',
      notes: []
    })
  }

  const resetConversionForm = () => {
    setConversionForm({
      full_name: '',
      phone: '',
      nationality: '',
      company: '',
      customer_preferences: {},
      customer_requirements: '',
      risk_level: 'low'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-purple-100 text-purple-800'
      case 'viewing': return 'bg-orange-100 text-orange-800'
      case 'negotiating': return 'bg-indigo-100 text-indigo-800'
      case 'converted': return 'bg-green-100 text-green-800'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Management</h2>
          <p className="text-gray-600 mt-1">Track and manage potential customers through the sales pipeline</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
              <DialogDescription>Add a new potential customer to the system</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    value={leadForm.first_name}
                    onChange={(e) => setLeadForm({ ...leadForm, first_name: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input
                    value={leadForm.last_name}
                    onChange={(e) => setLeadForm({ ...leadForm, last_name: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Buyer Type</label>
                  <Select
                    value={leadForm.buyer_type}
                    onValueChange={(value) => setLeadForm({ ...leadForm, buyer_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="hni">HNI</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Timeline</label>
                  <Select
                    value={leadForm.timeline}
                    onValueChange={(value) => setLeadForm({ ...leadForm, timeline: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="1-3_months">1-3 Months</SelectItem>
                      <SelectItem value="3-6_months">3-6 Months</SelectItem>
                      <SelectItem value="6-12_months">6-12 Months</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Budget Min (BHD)</label>
                  <Input
                    type="number"
                    value={leadForm.budget_min}
                    onChange={(e) => setLeadForm({ ...leadForm, budget_min: e.target.value })}
                    placeholder="Minimum budget"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Budget Max (BHD)</label>
                  <Input
                    type="number"
                    value={leadForm.budget_max}
                    onChange={(e) => setLeadForm({ ...leadForm, budget_max: e.target.value })}
                    placeholder="Maximum budget"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Lead Source</label>
                <Input
                  value={leadForm.source}
                  onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}
                  placeholder="e.g., Website, Referral, Social Media"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateLead} 
                  disabled={loading || !leadForm.first_name || !leadForm.last_name || !leadForm.email}
                >
                  Create Lead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="viewing">Viewing</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'No leads match your current filters'
                  : 'Start by adding your first lead to the system'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lead.first_name} {lead.last_name}
                      </h3>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className={`h-4 w-4 ${getScoreColor(lead.score)}`} />
                        <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                          {lead.score}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(lead.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {lead.buyer_type?.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {lead.timeline?.replace('_', ' ')}
                      </Badge>
                      {lead.budget_min && lead.budget_max && (
                        <Badge variant="outline">
                          BHD {lead.budget_min?.toLocaleString()} - {lead.budget_max?.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {lead.status !== 'converted' && lead.status !== 'lost' && (
                      <>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => updateLeadStatus(lead.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="viewing">Viewing</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead)
                            setConversionForm({
                              full_name: `${lead.first_name} ${lead.last_name}`,
                              phone: lead.phone || '',
                              nationality: '',
                              company: '',
                              customer_preferences: {},
                              customer_requirements: '',
                              risk_level: 'low'
                            })
                            setShowConvertDialog(true)
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Convert
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Convert Lead Dialog */}
      <Dialog open={showConvertDialog} onOpenChange={setShowConvertDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert Lead to Customer</DialogTitle>
            <DialogDescription>
              Convert {selectedLead?.first_name} {selectedLead?.last_name} to a customer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                value={conversionForm.full_name}
                onChange={(e) => setConversionForm({ ...conversionForm, full_name: e.target.value })}
                placeholder="Enter customer full name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={conversionForm.phone}
                onChange={(e) => setConversionForm({ ...conversionForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Nationality</label>
              <Input
                value={conversionForm.nationality}
                onChange={(e) => setConversionForm({ ...conversionForm, nationality: e.target.value })}
                placeholder="Enter nationality"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Risk Level</label>
              <Select
                value={conversionForm.risk_level}
                onValueChange={(value) => setConversionForm({ ...conversionForm, risk_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Requirements</label>
              <Textarea
                value={conversionForm.customer_requirements}
                onChange={(e) => setConversionForm({ ...conversionForm, customer_requirements: e.target.value })}
                placeholder="Enter customer requirements and preferences"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConvertDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConvertLead} 
                disabled={loading || !conversionForm.full_name}
                className="bg-green-600 hover:bg-green-700"
              >
                Convert to Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LeadManagement