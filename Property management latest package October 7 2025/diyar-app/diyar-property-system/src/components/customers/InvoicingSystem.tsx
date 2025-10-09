import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  FileText, 
  Send, 
  Eye, 
  Download, 
  Check, 
  AlertCircle, 
  Clock, 
  DollarSign,
  Calendar,
  X
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { supabase, type Invoice, type User } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface InvoicingSystemProps {
  customerId?: string
}

export const InvoicingSystem: React.FC<InvoicingSystemProps> = ({ customerId }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  
  const [invoiceForm, setInvoiceForm] = useState({
    customer_id: customerId || '',
    property_id: '',
    reservation_id: '',
    items: [{
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0
    }],
    currency: 'BHD',
    due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    discount_amount: 0,
    tax_amount: 0,
    notes: ''
  })

  useEffect(() => {
    fetchInvoices()
    fetchCustomers()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('invoices')
        .select('*, customer:profiles!customer_id(full_name), property:properties(title)')
        .order('created_at', { ascending: false })
      
      if (customerId) {
        query = query.eq('customer_id', customerId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setInvoices(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'customer')
        .order('full_name')
      
      if (error) throw error
      setCustomers(data || [])
    } catch (error: any) {
      toast.error('Failed to fetch customers')
    }
  }

  const calculateInvoiceTotal = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.amount, 0)
    const total = subtotal - invoiceForm.discount_amount + invoiceForm.tax_amount
    return { subtotal, total }
  }

  const updateItemAmount = (index: number, quantity: number, unitPrice: number) => {
    const newItems = [...invoiceForm.items]
    newItems[index].quantity = quantity
    newItems[index].unit_price = unitPrice
    newItems[index].amount = quantity * unitPrice
    setInvoiceForm({ ...invoiceForm, items: newItems })
  }

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, {
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0
      }]
    })
  }

  const removeInvoiceItem = (index: number) => {
    if (invoiceForm.items.length > 1) {
      const newItems = invoiceForm.items.filter((_, i) => i !== index)
      setInvoiceForm({ ...invoiceForm, items: newItems })
    }
  }

  const handleCreateInvoice = async () => {
    setLoading(true)
    try {
      const { subtotal, total } = calculateInvoiceTotal()
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          customer_id: invoiceForm.customer_id,
          property_id: invoiceForm.property_id || null,
          reservation_id: invoiceForm.reservation_id || null,
          amount: subtotal,
          currency: invoiceForm.currency,
          status: 'draft',
          due_date: invoiceForm.due_date,
          items: invoiceForm.items,
          discount_amount: invoiceForm.discount_amount,
          tax_amount: invoiceForm.tax_amount,
          total_amount: total,
          notes: invoiceForm.notes
        })
        .select('*, customer:profiles!customer_id(full_name)')
        .single()
      
      if (error) throw error
      
      setInvoices([data, ...invoices])
      setShowCreateDialog(false)
      resetInvoiceForm()
      toast.success('Invoice created successfully')
    } catch (error: any) {
      toast.error('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }
      
      if (status === 'paid') {
        updateData.payment_date = new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select('*, customer:profiles!customer_id(full_name)')
        .single()
      
      if (error) throw error
      
      setInvoices(invoices.map(invoice => 
        invoice.id === invoiceId ? data : invoice
      ))
      
      toast.success('Invoice status updated')
    } catch (error: any) {
      toast.error('Failed to update invoice status')
    }
  }

  const sendInvoice = async (invoice: Invoice) => {
    try {
      await updateInvoiceStatus(invoice.id, 'sent')
      
      // Here you would typically integrate with an email service
      // For now, we'll just update the status
      toast.success('Invoice sent successfully')
    } catch (error: any) {
      toast.error('Failed to send invoice')
    }
  }

  const resetInvoiceForm = () => {
    setInvoiceForm({
      customer_id: customerId || '',
      property_id: '',
      reservation_id: '',
      items: [{
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0
      }],
      currency: 'BHD',
      due_date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      discount_amount: 0,
      tax_amount: 0,
      notes: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'viewed': return 'bg-purple-100 text-purple-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <Check className="h-4 w-4" />
      case 'sent': return <Send className="h-4 w-4" />
      case 'viewed': return <Eye className="h-4 w-4" />
      case 'overdue': return <AlertCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      case 'draft': return <Clock className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const { subtotal, total } = calculateInvoiceTotal()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoicing System</h2>
          <p className="text-gray-600 mt-1">Create, manage, and track customer invoices</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>Generate a new invoice for a customer</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer *</label>
                  <Select
                    value={invoiceForm.customer_id}
                    onValueChange={(value) => setInvoiceForm({ ...invoiceForm, customer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.full_name || customer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Due Date *</label>
                  <Input
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Invoice Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInvoiceItem}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <label className="text-xs font-medium text-gray-600">Description</label>
                        <Input
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...invoiceForm.items]
                            newItems[index].description = e.target.value
                            setInvoiceForm({ ...invoiceForm, items: newItems })
                          }}
                          placeholder="Item description"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-600">Quantity</label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const quantity = parseFloat(e.target.value) || 0
                            updateItemAmount(index, quantity, item.unit_price)
                          }}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-600">Unit Price</label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => {
                            const unitPrice = parseFloat(e.target.value) || 0
                            updateItemAmount(index, item.quantity, unitPrice)
                          }}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-600">Amount</label>
                        <Input
                          type="number"
                          value={item.amount.toFixed(2)}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeInvoiceItem(index)}
                          disabled={invoiceForm.items.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Invoice Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Discount Amount</label>
                    <Input
                      type="number"
                      value={invoiceForm.discount_amount}
                      onChange={(e) => setInvoiceForm({ 
                        ...invoiceForm, 
                        discount_amount: parseFloat(e.target.value) || 0 
                      })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Tax Amount</label>
                    <Input
                      type="number"
                      value={invoiceForm.tax_amount}
                      onChange={(e) => setInvoiceForm({ 
                        ...invoiceForm, 
                        tax_amount: parseFloat(e.target.value) || 0 
                      })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={invoiceForm.notes}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                      placeholder="Additional notes or terms"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-4">Invoice Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{subtotal.toFixed(2)} BHD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-{invoiceForm.discount_amount.toFixed(2)} BHD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>+{invoiceForm.tax_amount.toFixed(2)} BHD</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>{total.toFixed(2)} BHD</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateInvoice} 
                  disabled={loading || !invoiceForm.customer_id || invoiceForm.items.length === 0}
                >
                  Create Invoice
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
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No invoices match your current filters'
                  : 'Start by creating your first invoice'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {invoice.invoice_number}
                      </h3>
                      <Badge className={getStatusColor(invoice.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(invoice.status)}
                          {invoice.status.toUpperCase()}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Customer:</span>
                        <span>{invoice.customer?.full_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">
                          {(invoice.total_amount || invoice.amount).toLocaleString('en-BH', {
                            style: 'currency',
                            currency: 'BHD'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    {invoice.notes && (
                      <p className="text-sm text-gray-600 mt-2">{invoice.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {invoice.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => sendInvoice(invoice)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                    )}
                    
                    {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
                      <Button
                        size="sm"
                        onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark Paid
                      </Button>
                    )}
                    
                    <Select
                      value={invoice.status}
                      onValueChange={(value) => updateInvoiceStatus(invoice.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="viewed">Viewed</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default InvoicingSystem