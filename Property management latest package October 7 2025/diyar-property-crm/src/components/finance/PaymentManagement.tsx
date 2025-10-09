import React, { useState, useEffect } from 'react';
import InvoiceGenerationModal from './InvoiceGenerationModal';
import { invoiceAPI } from '../../lib/invoiceAPI';
// @ts-ignore
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Invoice {
  id: string;
  invoice_number: string;
  customer: {
    full_name: string;
    email: string;
  };
  property?: {
    title: string;
  };
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
  milestone_name?: string;
  created_at: string;
}

interface Payment {
  id: number;
  invoiceNumber: string;
  client: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  project: string;
}

interface PaymentMetrics {
  totalOutstanding: number;
  collectedThisMonth: number;
  overduePayments: number;
  collectionRate: number;
}

interface PaymentManagementProps {}

const PaymentManagement: React.FC<PaymentManagementProps> = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    totalOutstanding: 0,
    collectedThisMonth: 0,
    overduePayments: 0,
    collectionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [agingData, setAgingData] = useState<any[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load real data only
  useEffect(() => {
    setLoading(true);
    loadInvoiceData().finally(() => {
      setLoading(false);
    });
  }, [refreshTrigger]);

  const loadInvoiceData = async () => {
    try {
      const result = await invoiceAPI.getInvoices();
      if (result.success) {
        const invoicesData = result.data;
        setInvoices(invoicesData);
        
        // Calculate real metrics from invoice data
        calculateMetrics(invoicesData);
        generatePaymentHistory(invoicesData);
        generateAgingData(invoicesData);
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
    }
  };

  const calculateMetrics = (invoicesData: Invoice[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const totalOutstanding = invoicesData
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    
    const collectedThisMonth = invoicesData
      .filter(inv => {
        const invoiceDate = new Date(inv.created_at);
        return inv.status === 'paid' && 
               invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    
    const overduePayments = invoicesData
      .filter(inv => {
        const dueDate = new Date(inv.due_date);
        return inv.status !== 'paid' && dueDate < currentDate;
      })
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    
    const totalInvoiced = invoicesData.reduce((sum, inv) => sum + inv.total_amount, 0);
    const totalPaid = invoicesData
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total_amount, 0);
    
    const collectionRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;
    
    setMetrics({
      totalOutstanding,
      collectedThisMonth,
      overduePayments,
      collectionRate
    });
  };

  const generatePaymentHistory = (invoicesData: Invoice[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const historyData = [];
    
    for (let i = 8; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = monthNames[month.getMonth()];
      
      const collected = invoicesData
        .filter(inv => {
          const invoiceDate = new Date(inv.created_at);
          return inv.status === 'paid' && 
                 invoiceDate.getMonth() === month.getMonth() && 
                 invoiceDate.getFullYear() === month.getFullYear();
        })
        .reduce((sum, inv) => sum + inv.total_amount, 0) / 1000000; // Convert to millions
      
      const outstanding = invoicesData
        .filter(inv => {
          const invoiceDate = new Date(inv.created_at);
          return inv.status !== 'paid' && 
                 invoiceDate.getMonth() === month.getMonth() && 
                 invoiceDate.getFullYear() === month.getFullYear();
        })
        .reduce((sum, inv) => sum + inv.total_amount, 0) / 1000000; // Convert to millions
      
      historyData.push({ month: monthName, collected, outstanding });
    }
    
    setPaymentHistory(historyData);
  };

  const generateAgingData = (invoicesData: Invoice[]) => {
    const currentDate = new Date();
    const overdueInvoices = invoicesData.filter(inv => {
      const dueDate = new Date(inv.due_date);
      return inv.status !== 'paid' && dueDate < currentDate;
    });
    
    const aging = {
      '0-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0
    };
    
    overdueInvoices.forEach(inv => {
      const dueDate = new Date(inv.due_date);
      const daysDiff = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 30) aging['0-30']++;
      else if (daysDiff <= 60) aging['31-60']++;
      else if (daysDiff <= 90) aging['61-90']++;
      else aging['90+']++;
    });
    
    const total = Object.values(aging).reduce((sum, count) => sum + count, 0);
    
    if (total > 0) {
      setAgingData([
        { name: '0-30 days', value: Math.round((aging['0-30'] / total) * 100), color: '#10B981' },
        { name: '31-60 days', value: Math.round((aging['31-60'] / total) * 100), color: '#F59E0B' },
        { name: '61-90 days', value: Math.round((aging['61-90'] / total) * 100), color: '#EF4444' },
        { name: '90+ days', value: Math.round((aging['90+'] / total) * 100), color: '#7C2D12' }
      ]);
    } else {
      setAgingData([
        { name: '0-30 days', value: 100, color: '#10B981' },
        { name: '31-60 days', value: 0, color: '#F59E0B' },
        { name: '61-90 days', value: 0, color: '#EF4444' },
        { name: '90+ days', value: 0, color: '#7C2D12' }
      ]);
    }
  };

  const handleInvoiceGenerated = (invoice: any) => {
    setRefreshTrigger(prev => prev + 1);
    // Show success message
    alert('Invoice generated successfully!');
  };

  const getFilteredInvoices = () => {
    const currentDate = new Date();
    
    return invoices.filter(invoice => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'sent') return invoice.status === 'sent';
      if (selectedFilter === 'paid') return invoice.status === 'paid';
      if (selectedFilter === 'overdue') {
        const dueDate = new Date(invoice.due_date);
        return invoice.status !== 'paid' && dueDate < currentDate;
      }
      return false;
    });
  };

  const markAsPaid = async (invoiceId: string) => {
    try {
      setLoading(true);
      const result = await invoiceAPI.markInvoiceAsPaid(invoiceId);
      if (result.success) {
        setRefreshTrigger(prev => prev + 1);
        alert('Invoice marked as paid successfully!');
      } else {
        alert('Failed to update invoice status: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('Failed to update invoice status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading payment data...</div>
        </div>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Outstanding</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">BD {(metrics.totalOutstanding / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-500">42 pending invoices</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Collected This Month</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">BD {(metrics.collectedThisMonth / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-gray-500">+15% from last month</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Overdue Payments</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">BD {(metrics.overduePayments / 1000).toFixed(0)}K</div>
            <div className="text-xs text-gray-500">7 overdue invoices</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="pb-2">
            <h3 className="text-sm font-medium text-gray-600">Collection Rate</h3>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{metrics.collectionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Above target</div>
          </div>
        </div>
      </div>
      
      {/* Payment Management Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 flex justify-between items-center">
            <span>Invoice & Payment Management</span>
            <div className="space-x-2">
              <button 
                onClick={() => setShowInvoiceModal(true)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Generate Invoice
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Send Reminders</button>
            </div>
          </h3>
        </div>
        <div>
          {/* Filter Controls */}
          <div className="flex space-x-2 mb-4">
            {['all', 'paid', 'sent', 'overdue'].map((filter) => {
              const getFilterCount = () => {
                if (filter === 'all') return invoices.length;
                if (filter === 'sent') return invoices.filter(inv => inv.status === 'sent').length;
                if (filter === 'overdue') {
                  const currentDate = new Date();
                  return invoices.filter(inv => {
                    const dueDate = new Date(inv.due_date);
                    return inv.status !== 'paid' && dueDate < currentDate;
                  }).length;
                }
                return invoices.filter(inv => inv.status === filter).length;
              };
              
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1 text-sm rounded capitalize ${
                    selectedFilter === filter 
                      ? 'bg-blue-600 text-white' 
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter === 'sent' ? 'pending' : filter} ({getFilterCount()})
                </button>
              );
            })}
          </div>
          
          {/* Payment Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Invoice</th>
                  <th className="text-left py-2">Client</th>
                  <th className="text-left py-2">Project</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Due Date</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredInvoices().map((invoice) => (
                  <tr key={`invoice-${invoice.id}`} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <div className="font-medium">{invoice.invoice_number}</div>
                      {invoice.milestone_name && (
                        <div className="text-xs text-gray-500">{invoice.milestone_name}</div>
                      )}
                    </td>
                    <td className="py-3">{invoice.customer?.full_name || 'N/A'}</td>
                    <td className="py-3">{invoice.property?.title || 'N/A'}</td>
                    <td className="py-3 font-semibold">BD {invoice.total_amount?.toLocaleString()}</td>
                    <td className="py-3">{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {invoice.status === 'sent' ? 'pending' : invoice.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-1">
                        <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">View</button>
                        {invoice.status !== 'paid' && (
                          <button 
                            onClick={() => markAsPaid(invoice.id)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50">Email</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {getFilteredInvoices().length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Invoice Generation Modal */}
      <InvoiceGenerationModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        onInvoiceGenerated={handleInvoiceGenerated}
      />
      
      {/* Payment Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Payment Timeline</h3>
          </div>
          <div>
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height={280}>
              {/* @ts-ignore */}
              <BarChart data={paymentHistory}>
                {/* @ts-ignore */}
                <CartesianGrid strokeDasharray="3 3" />
                {/* @ts-ignore */}
                <XAxis dataKey="month" />
                {/* @ts-ignore */}
                <YAxis />
                {/* @ts-ignore */}
                <Tooltip formatter={(value, name) => [`BD ${value}M`, name]} />
                {/* @ts-ignore */}
                <Legend />
                {/* @ts-ignore */}
                <Bar dataKey="collected" fill="#10B981" name="Collected" />
                {/* @ts-ignore */}
                <Bar dataKey="outstanding" fill="#EF4444" name="Outstanding" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Collection Analytics</h3>
          </div>
          <div>
            {/* @ts-ignore */}
            <ResponsiveContainer width="100%" height={280}>
              {/* @ts-ignore */}
              <PieChart>
                {/* @ts-ignore */}
                <Pie
                  data={agingData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {agingData.map((entry, index) => (
                    // @ts-ignore
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {/* @ts-ignore */}
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;