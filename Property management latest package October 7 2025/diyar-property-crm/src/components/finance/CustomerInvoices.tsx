import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { invoiceAPI } from '../../lib/invoiceAPI';
import { downloadInvoicePDF, previewInvoicePDF } from '../../lib/pdfGenerator';

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  milestone_name?: string;
  notes?: string;
  created_at: string;
  items?: any[];
  customer?: {
    full_name: string;
    email: string;
    phone?: string;
  };
  property?: {
    title: string;
  };
}

interface CustomerInvoicesProps {
  customerId?: string;
}

const CustomerInvoices: React.FC<CustomerInvoicesProps> = ({ customerId }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    loadInvoices();
  }, [customerId]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const result = await invoiceAPI.getInvoices();
      if (result.success) {
        // Filter invoices by customer if customerId is provided
        let customerInvoices = result.data;
        if (customerId) {
          customerInvoices = result.data.filter((invoice: any) => invoice.customer_id === customerId);
        }
        setInvoices(customerInvoices);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'all') return true;
    if (filter === 'pending') return invoice.status === 'sent';
    return invoice.status === filter;
  });

  const totalOutstanding = invoices
    .filter(invoice => invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadInvoice = (invoice: Invoice) => {
    try {
      if (!invoice.customer) {
        console.warn('Customer data missing from invoice:', invoice);
        alert('Invoice customer data is incomplete. Cannot generate PDF.');
        return;
      }
      downloadInvoicePDF(invoice as any);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const previewInvoice = (invoice: Invoice) => {
    try {
      if (!invoice.customer) {
        console.warn('Customer data missing from invoice:', invoice);
        alert('Invoice customer data is incomplete. Cannot preview PDF.');
        return;
      }
      previewInvoicePDF(invoice as any);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      alert('Failed to preview PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-lg font-semibold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
              <p className="text-lg font-semibold text-gray-900">BD {totalOutstanding.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
              <p className="text-lg font-semibold text-gray-900">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 py-3">
            {['all', 'pending', 'paid', 'overdue'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`capitalize py-2 px-1 border-b-2 text-sm font-medium ${
                  filter === filterOption
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {filterOption} ({filterOption === 'all' ? invoices.length : 
                 filterOption === 'pending' ? invoices.filter(inv => inv.status === 'sent').length :
                 invoices.filter(inv => inv.status === filterOption).length})
              </button>
            ))}
          </nav>
        </div>

        {/* Invoice List */}
        <div className="divide-y divide-gray-200">
          {filteredInvoices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p>No invoices found</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {invoice.invoice_number}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {invoice.milestone_name && (
                          <span className="mr-4">{invoice.milestone_name}</span>
                        )}
                        {invoice.property?.title && (
                          <span>{invoice.property.title}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      BD {invoice.total_amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due: {formatDate(invoice.due_date)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => previewInvoice(invoice)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="Preview PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadInvoice(invoice)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Details - {selectedInvoice.invoice_number}
              </h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <span className="sr-only">Close</span>
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Invoice Information</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="font-medium">Invoice Number:</span> {selectedInvoice.invoice_number}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(selectedInvoice.created_at)}</p>
                    <p><span className="font-medium">Due Date:</span> {formatDate(selectedInvoice.due_date)}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedInvoice.status)}`}>
                        {selectedInvoice.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Property Information</h3>
                  <div className="mt-2 space-y-1">
                    <p><span className="font-medium">Property:</span> {selectedInvoice.property?.title || 'N/A'}</p>
                    {selectedInvoice.milestone_name && (
                      <p><span className="font-medium">Milestone:</span> {selectedInvoice.milestone_name}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Invoice Items */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Invoice Items</h3>
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.items && (typeof selectedInvoice.items === 'string' ? JSON.parse(selectedInvoice.items) : selectedInvoice.items).map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">BD {item.unit_price?.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">BD {item.amount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Total */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-base font-medium text-gray-900">Total Amount:</span>
                    <span className="text-base font-bold text-gray-900">BD {selectedInvoice.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => previewInvoice(selectedInvoice)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview PDF
                </button>
                <button
                  onClick={() => downloadInvoice(selectedInvoice)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerInvoices;