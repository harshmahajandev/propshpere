import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/select'
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Star,
  CreditCard,
  Calendar,
  FileText,
  UserPlus,
  TrendingUp
} from 'lucide-react'
import { useCustomerStore } from '../stores/customer-store'
import { useAuthStore } from '../stores/auth-store'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
// import LeadManagement from '@/components/customers/LeadManagement'
// import { InvoicingSystem } from '@/components/customers/InvoicingSystem'

const CustomerManagementPage: React.FC = () => {
  const { user } = useAuthStore()
  const {
    customers,
    communications,
    tickets,
    loading,
    fetchCustomers,
    fetchCustomerCommunications,
    fetchCustomerTickets,
    createCommunication,
    createTicket,
    updateCustomerProfile,
    updateTicketStatus,
  } = useCustomerStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [activeMainTab, setActiveMainTab] = useState('leads')
  const [activeCustomerTab, setActiveCustomerTab] = useState('overview')
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  
  // Form states
  const [communicationForm, setCommunicationForm] = useState({
    communication_type: 'phone' as 'phone' | 'email' | 'sms' | 'in_person' | 'video_call' | 'whatsapp',
    direction: 'outbound' as 'inbound' | 'outbound',
    subject: '',
    content: '',
    follow_up_required: false,
  })
  
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'general',
  })
  
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    nationality: '',
    customer_requirements: '',
    risk_level: 'low' as 'low' | 'medium' | 'high',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerCommunications(selectedCustomer.id)
      fetchCustomerTickets(selectedCustomer.id)
      setProfileForm({
        full_name: selectedCustomer.full_name || '',
        phone: selectedCustomer.phone || '',
        nationality: selectedCustomer.nationality || '',
        customer_requirements: selectedCustomer.customer_requirements || '',
        risk_level: selectedCustomer.risk_level || 'low',
      })
    }
  }, [selectedCustomer])

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCommunication = async () => {
    if (!selectedCustomer) return
    
    try {
      await createCommunication({
        ...communicationForm,
        customer_id: selectedCustomer.id,
        staff_id: user?.id,
      })
      
      setCommunicationForm({
        communication_type: 'phone',
        direction: 'outbound',
        subject: '',
        content: '',
        follow_up_required: false,
      })
      
      setShowCommunicationDialog(false)
    } catch (error) {
      // Error handled in store
    }
  }

  const handleCreateTicket = async () => {
    if (!selectedCustomer) return
    
    try {
      await createTicket({
        ...ticketForm,
        customer_id: selectedCustomer.id,
        created_by: user?.id,
        assigned_to: user?.id,
      })
      
      setTicketForm({
        subject: '',
        description: '',
        priority: 'medium',
        category: 'general',
      })
      
      setShowTicketDialog(false)
    } catch (error) {
      // Error handled in store
    }
  }

  const handleUpdateProfile = async () => {
    if (!selectedCustomer) return
    
    try {
      await updateCustomerProfile(selectedCustomer.id, profileForm)
      setSelectedCustomer({ ...selectedCustomer, ...profileForm })
      setShowProfileDialog(false)
    } catch (error) {
      // Error handled in store
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTicketPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'open': return 'bg-gray-100 text-gray-800'
      case 'closed': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Relationship Management</h1>
          <p className="text-gray-600 mt-1">Complete customer lifecycle management from leads to loyal customers</p>
        </div>
      </div>

      {/* Main CRM Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Lead Management
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customer Management
          </TabsTrigger>
          <TabsTrigger value="invoicing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Invoicing System
          </TabsTrigger>
        </TabsList>

        {/* Lead Management Tab */}
        <TabsContent value="leads" className="space-y-6">
          {/* <LeadManagement 
            onLeadConverted={(leadId, customerId) => {
              toast.success('Lead converted to customer successfully!')
              fetchCustomers() // Refresh customer list
              setActiveMainTab('customers') // Switch to customer tab
            }}
          /> */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Lead Management</h3>
            <p className="text-gray-600">Lead management functionality will be available soon.</p>
          </div>
        </TabsContent>

        {/* Customer Management Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Customer Management</h2>
              <p className="text-gray-600 mt-1">Manage existing customer relationships, communications, and support</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customers ({filteredCustomers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedCustomer?.id === customer.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{customer.full_name || 'No Name'}</h4>
                            <p className="text-xs text-gray-600 mt-1">{customer.email}</p>
                            {customer.phone && (
                              <p className="text-xs text-gray-500 mt-1">{customer.phone}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge
                              variant="secondary"
                              className={getRiskLevelColor(customer.risk_level || 'low')}
                            >
                              {customer.risk_level?.toUpperCase() || 'LOW'}
                            </Badge>
                            {customer.credit_score && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Star className="h-3 w-3 mr-1" />
                                {customer.credit_score}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Details */}
            <div className="lg:col-span-2">
              {selectedCustomer ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {selectedCustomer.full_name || 'No Name'}
                        </CardTitle>
                        <CardDescription>{selectedCustomer.email}</CardDescription>
                      </div>
                  
                  <div className="flex items-center space-x-2">
                    <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-1" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Customer Profile</DialogTitle>
                          <DialogDescription>
                            Update customer information and settings
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                              value={profileForm.full_name}
                              onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Nationality</label>
                            <Input
                              value={profileForm.nationality}
                              onChange={(e) => setProfileForm({ ...profileForm, nationality: e.target.value })}
                              placeholder="Enter nationality"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Risk Level</label>
                            <Select
                              value={profileForm.risk_level}
                              onValueChange={(value: 'low' | 'medium' | 'high') => setProfileForm({ ...profileForm, risk_level: value })}
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
                              value={profileForm.customer_requirements}
                              onChange={(e) => setProfileForm({ ...profileForm, customer_requirements: e.target.value })}
                              placeholder="Enter customer requirements"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleUpdateProfile} disabled={loading}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showCommunicationDialog} onOpenChange={setShowCommunicationDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Add Communication
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Record Communication</DialogTitle>
                          <DialogDescription>
                            Log a communication with {selectedCustomer.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Type</label>
                              <Select
                                value={communicationForm.communication_type}
                                onValueChange={(value: 'phone' | 'email' | 'sms' | 'in_person' | 'video_call' | 'whatsapp') => setCommunicationForm({ ...communicationForm, communication_type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="phone">Phone</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="sms">SMS</SelectItem>
                                  <SelectItem value="in_person">In Person</SelectItem>
                                  <SelectItem value="video_call">Video Call</SelectItem>
                                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Direction</label>
                              <Select
                                value={communicationForm.direction}
                                onValueChange={(value: 'inbound' | 'outbound') => setCommunicationForm({ ...communicationForm, direction: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="outbound">Outbound</SelectItem>
                                  <SelectItem value="inbound">Inbound</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Subject</label>
                            <Input
                              value={communicationForm.subject}
                              onChange={(e) => setCommunicationForm({ ...communicationForm, subject: e.target.value })}
                              placeholder="Communication subject"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Content</label>
                            <Textarea
                              value={communicationForm.content}
                              onChange={(e) => setCommunicationForm({ ...communicationForm, content: e.target.value })}
                              placeholder="Describe the communication"
                              rows={4}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowCommunicationDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateCommunication} disabled={loading}>
                              Save Communication
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Create Ticket
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create Support Ticket</DialogTitle>
                          <DialogDescription>
                            Create a new support ticket for {selectedCustomer.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Subject</label>
                            <Input
                              value={ticketForm.subject}
                              onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                              placeholder="Ticket subject"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Priority</label>
                              <Select
                                value={ticketForm.priority}
                                onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setTicketForm({ ...ticketForm, priority: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Category</label>
                              <Select
                                value={ticketForm.category}
                                onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="maintenance">Maintenance</SelectItem>
                                  <SelectItem value="billing">Billing</SelectItem>
                                  <SelectItem value="technical">Technical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              value={ticketForm.description}
                              onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                              placeholder="Describe the issue or request"
                              rows={4}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateTicket} disabled={loading}>
                              Create Ticket
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              
                  <CardContent>
                    <Tabs value={activeCustomerTab} onValueChange={setActiveCustomerTab}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="communications">Communications</TabsTrigger>
                        <TabsTrigger value="tickets">Tickets</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                      </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {selectedCustomer.email}
                            </div>
                            {selectedCustomer.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                {selectedCustomer.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Risk Assessment</h4>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Risk Level</span>
                              <Badge className={getRiskLevelColor(selectedCustomer.risk_level || 'low')}>
                                {selectedCustomer.risk_level?.toUpperCase() || 'LOW'}
                              </Badge>
                            </div>
                            {selectedCustomer.credit_score && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Credit Score</span>
                                <div className="flex items-center">
                                  <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                                  <span className="text-sm font-medium">{selectedCustomer.credit_score}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Customer Details</h4>
                          <div className="mt-2 space-y-2">
                            {selectedCustomer.nationality && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Nationality</span>
                                <span className="text-sm font-medium">{selectedCustomer.nationality}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Member Since</span>
                              <span className="text-sm font-medium">
                                {format(new Date(selectedCustomer.created_at), 'MMM yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedCustomer.customer_requirements && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Requirements</h4>
                            <p className="text-sm text-gray-700 mt-1">
                              {selectedCustomer.customer_requirements}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="communications" className="space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {communications.map((comm) => (
                        <div key={comm.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">
                                  {comm.communication_type.toUpperCase()}
                                </Badge>
                                <Badge variant={comm.direction === 'inbound' ? 'default' : 'secondary'}>
                                  {comm.direction.toUpperCase()}
                                </Badge>
                                {comm.follow_up_required && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                    Follow-up Required
                                  </Badge>
                                )}
                              </div>
                              {comm.subject && (
                                <h5 className="font-medium text-sm">{comm.subject}</h5>
                              )}
                              <p className="text-sm text-gray-600 mt-1">{comm.content}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {format(new Date(comm.completed_date || comm.created_at), 'MMM dd, HH:mm')}
                            </div>
                          </div>
                        </div>
                      ))}
                      {communications.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No communications recorded yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tickets" className="space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getTicketPriorityColor(ticket.priority)}>
                                  {ticket.priority.toUpperCase()}
                                </Badge>
                                <Badge className={getTicketStatusColor(ticket.status)}>
                                  {ticket.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <span className="text-xs text-gray-500">#{ticket.ticket_number}</span>
                              </div>
                              <h5 className="font-medium text-sm">{ticket.subject}</h5>
                              <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                              {ticket.resolution && (
                                <div className="mt-2 p-2 bg-green-50 rounded">
                                  <p className="text-sm text-green-800">
                                    <strong>Resolution:</strong> {ticket.resolution}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              {format(new Date(ticket.created_at), 'MMM dd, HH:mm')}
                              {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateTicketStatus(ticket.id, 'resolved', 'Issue resolved')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolve
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {tickets.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No tickets created yet</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-4">
                    <div className="text-center text-gray-500 py-8">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>Customer history and timeline will be displayed here</p>
                    </div>
                  </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">Select a Customer</h3>
                      <p>Choose a customer from the list to view their details and manage their account</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Invoicing System Tab */}
        <TabsContent value="invoicing" className="space-y-6">
          {/* <InvoicingSystem /> */}
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">Invoicing System</h3>
            <p className="text-gray-600">Invoicing system functionality will be available soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CustomerManagementPage
