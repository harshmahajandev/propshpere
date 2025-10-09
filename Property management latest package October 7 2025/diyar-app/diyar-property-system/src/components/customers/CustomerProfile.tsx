import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Edit
} from 'lucide-react'
import { format } from 'date-fns'
import { supabase, type User as CustomerType, type CustomerCommunication, type Invoice } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface CustomerProfileProps {
  customer: CustomerType
  onCustomerUpdated?: (customer: CustomerType) => void
}

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer, onCustomerUpdated }) => {
  const [communications, setCommunications] = useState<CustomerCommunication[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCommunicationDialog, setShowCommunicationDialog] = useState(false)
  
  const [profileForm, setProfileForm] = useState({
    full_name: customer.full_name || '',
    phone: customer.phone || '',
    nationality: customer.nationality || '',
    company: customer.company || '',
    customer_requirements: customer.customer_requirements || '',
    risk_level: customer.risk_level || 'low'
  })
  
  const [communicationForm, setCommunicationForm] = useState({
    communication_type: 'phone',
    direction: 'outbound',
    subject: '',
    content: '',
    follow_up_required: false
  })

  useEffect(() => {
    fetchCustomerData()
  }, [customer.id])

  const fetchCustomerData = async () => {
    setLoading(true)
    try {
      // Fetch communications
      const { data: commsData, error: commsError } = await supabase
        .from('customer_communications')
        .select('*, staff:profiles!staff_id(full_name)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (commsError) throw commsError
      setCommunications(commsData || [])
      
      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (invoicesError) throw invoicesError
      setInvoices(invoicesData || [])
    } catch (error: any) {
      toast.error('Failed to fetch customer data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id)
        .select()
        .single()
      
      if (error) throw error
      
      setShowEditDialog(false)
      toast.success('Profile updated successfully')
      
      if (onCustomerUpdated) {
        onCustomerUpdated(data)
      }
    } catch (error: any) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCommunication = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customer_communications')
        .insert({
          ...communicationForm,
          customer_id: customer.id,
          status: 'completed',
          completed_date: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      
      setCommunications([data, ...communications])
      setShowCommunicationDialog(false)
      setCommunicationForm({
        communication_type: 'phone',
        direction: 'outbound',
        subject: '',
        content: '',
        follow_up_required: false
      })
      toast.success('Communication recorded')
    } catch (error: any) {
      toast.error('Failed to record communication')
    } finally {
      setLoading(false)
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

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCommunicationTypeIcon = (type: string) => {
    switch (type) {
      case 'phone': return <Phone className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'in_person': return <User className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || invoice.amount), 0)
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue')

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{customer.full_name || 'No Name'}</h2>
                <p className="text-gray-600">{customer.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Phone className="h-4 w-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.nationality && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{customer.nationality}</span>
                    </div>
                  )}
                  <Badge className={getRiskLevelColor(customer.risk_level || 'low')}>
                    {customer.risk_level?.toUpperCase() || 'LOW'} RISK
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Customer Profile</DialogTitle>
                    <DialogDescription>Update customer information</DialogDescription>
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
                      <label className="text-sm font-medium">Company</label>
                      <Input
                        value={profileForm.company}
                        onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Risk Level</label>
                      <Select
                        value={profileForm.risk_level}
                        onValueChange={(value: "low" | "medium" | "high") => setProfileForm({ ...profileForm, risk_level: value })}
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
                      <Button variant="outline" onClick={() => setShowEditDialog(false)}>
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
                  <Button size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Add Communication
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Record Communication</DialogTitle>
                    <DialogDescription>Log communication with {customer.full_name}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={communicationForm.communication_type}
                          onValueChange={(value) => setCommunicationForm({ ...communicationForm, communication_type: value })}
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
                          onValueChange={(value) => setCommunicationForm({ ...communicationForm, direction: value })}
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
                      <Button onClick={handleAddCommunication} disabled={loading}>
                        Save Communication
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">
                  {totalInvoiceAmount.toLocaleString('en-BH', {
                    style: 'currency',
                    currency: 'BHD'
                  })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-600">{paidInvoices.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueInvoices.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Details Tabs */}
      <Tabs defaultValue="communications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="communications">
          <Card>
            <CardHeader>
              <CardTitle>Recent Communications</CardTitle>
              <CardDescription>Latest communication history with this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {communications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No communications recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.map((comm) => (
                    <div key={comm.id} className="border-l-4 border-blue-200 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          {getCommunicationTypeIcon(comm.communication_type)}
                          <span className="font-medium capitalize">
                            {comm.communication_type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {comm.direction}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {format(new Date(comm.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      {comm.subject && (
                        <h4 className="font-medium text-gray-900 mb-1">{comm.subject}</h4>
                      )}
                      <p className="text-gray-600 text-sm">{comm.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>All invoices for this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No invoices found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{invoice.invoice_number}</h4>
                          <p className="text-sm text-gray-600">
                            Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {(invoice.total_amount || invoice.amount).toLocaleString('en-BH', {
                              style: 'currency',
                              currency: 'BHD'
                            })}
                          </p>
                          <Badge className={getInvoiceStatusColor(invoice.status)}>
                            {invoice.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      {invoice.notes && (
                        <p className="text-sm text-gray-600">{invoice.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Complete customer information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Name:</span>
                        <span>{customer.full_name || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{customer.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nationality:</span>
                        <span>{customer.nationality || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span>{customer.company || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member Since:</span>
                        <span>{format(new Date(customer.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Risk Level:</span>
                        <Badge className={getRiskLevelColor(customer.risk_level || 'low')}>
                          {customer.risk_level?.toUpperCase() || 'LOW'}
                        </Badge>
                      </div>
                      {customer.credit_score && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Credit Score:</span>
                          <span>{customer.credit_score}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Requirements & Preferences</h4>
                  <div className="text-sm text-gray-600">
                    {customer.customer_requirements ? (
                      <p>{customer.customer_requirements}</p>
                    ) : (
                      <p className="italic">No specific requirements recorded</p>
                    )}
                  </div>
                  
                  {customer.customer_preferences && Object.keys(customer.customer_preferences).length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Preferences</h5>
                      <div className="text-sm text-gray-600">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(customer.customer_preferences, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CustomerProfile