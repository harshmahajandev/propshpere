import React, { useState } from 'react';
import CustomerInvoices from '../components/finance/CustomerInvoices';
import { FileText, Home, CreditCard, MessageSquare, User } from 'lucide-react';

const CustomerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'snagging' | 'invoices' | 'documents' | 'communication'>('overview');
  
  // Mock customer ID - in real app, this would come from auth context
  const customerId = 'c9d8e00a-8c19-482e-8fb8-e3c3bef59a8e';

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Portal</h1>
        
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'snagging', label: 'Snagging', icon: FileText },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'documents', label: 'Documents', icon: CreditCard },
              { id: 'communication', label: 'Messages', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Customer Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Current Balance</h3>
                <p className="text-2xl font-bold text-blue-600">BHD 125,000</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Project Status</h3>
                <p className="text-2xl font-bold text-green-600">45% Complete</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500">Next Payment</h3>
                <p className="text-2xl font-bold text-orange-600">Dec 15, 2024</p>
              </div>
            </div>

            {/* Development Progress Tracking */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Development Progress</h2>
              <div className="text-gray-600 mb-4">
                Real-time construction updates for your Al Naseem villa
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Foundation complete, structure in progress</p>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="border rounded-lg p-4 hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">View Invoices</h3>
                      <p className="text-sm text-gray-600">Check payment status and download invoices</p>
                    </div>
                  </div>
                </button>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Payment History</h3>
                      <p className="text-sm text-gray-600">View all completed payments</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('communication')}
                  className="border rounded-lg p-4 hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">Contact Support</h3>
                      <p className="text-sm text-gray-600">Get help from your sales team</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">New invoice generated</p>
                    <p className="text-sm text-gray-600">Foundation milestone payment - BD 64,000</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-auto">Today</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Project update</p>
                    <p className="text-sm text-gray-600">Foundation work completed successfully</p>
                  </div>
                  <span className="text-xs text-gray-500 ml-auto">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'snagging' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Property Snagging</h2>
            <div className="text-gray-600 mb-4">
              Track the progress of your property handover process and view snagging issues.
            </div>
            <a 
              href="/customer-snagging" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Snagging Status
            </a>
          </div>
        )}

        {activeTab === 'invoices' && (
          <CustomerInvoices customerId={customerId} />
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Document Center</h2>
            <div className="text-gray-600 mb-4">
              Access contracts, receipts, progress reports, and communication history
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Purchase Agreement</h3>
                    <p className="text-sm text-gray-600">PDF • 2.4 MB</p>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Payment Receipts</h3>
                    <p className="text-sm text-gray-600">ZIP • 15.2 MB</p>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">Project Plans</h3>
                    <p className="text-sm text-gray-600">PDF • 8.7 MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Communication Center</h2>
            <div className="text-gray-600 mb-4">
              Direct messaging with your dedicated sales team
            </div>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Sarah Johnson - Sales Manager</h3>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Your dedicated sales representative for Villa V-AN-032</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Send Message
                </button>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Recent Messages</h3>
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-700">Foundation work has been completed. Next milestone payment is now due.</p>
                    <span className="text-xs text-gray-500">Today, 2:30 PM</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-700">Thank you for the update! I'll process the payment by tomorrow.</p>
                    <span className="text-xs text-gray-500">Today, 3:15 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPortal;