import React, { useState } from 'react';
import RevenueAnalytics from '../components/finance/RevenueAnalytics';
import PaymentManagement from '../components/finance/PaymentManagement';
import FinancialForecasting from '../components/finance/FinancialForecasting';

type TabType = 'overview' | 'revenue' | 'payments' | 'forecasting';

const FinanceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'revenue' as TabType, label: 'Revenue Analytics' },
    { id: 'payments' as TabType, label: 'Payment Management' },
    { id: 'forecasting' as TabType, label: 'Financial Forecasting' }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Executive Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue (YTD)</h3>
          <p className="text-2xl font-bold text-green-600">BD 85.2M</p>
          <div className="text-xs text-green-600 mt-1">+18.5% vs last year</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">Outstanding Receivables</h3>
          <p className="text-2xl font-bold text-orange-600">BD 2.4M</p>
          <div className="text-xs text-orange-600 mt-1">42 pending invoices</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">Collections This Month</h3>
          <p className="text-2xl font-bold text-blue-600">BD 8.7M</p>
          <div className="text-xs text-blue-600 mt-1">94.2% collection rate</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-sm font-medium text-gray-500">Cash Flow Status</h3>
          <p className="text-2xl font-bold text-purple-600">BD 24.8M</p>
          <div className="text-xs text-purple-600 mt-1">Positive inflow</div>
        </div>
      </div>

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Development */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue by Development</h2>
          <div className="space-y-3">
            {[
              { name: 'Al Naseem Villas', revenue: 'BD 28.4M', percentage: 33.4 },
              { name: 'Al Bareh Residences', revenue: 'BD 22.1M', percentage: 25.9 },
              { name: 'Deerat Al Oyoun', revenue: 'BD 18.7M', percentage: 21.9 },
              { name: 'Diyar Al Muharraq', revenue: 'BD 16.0M', percentage: 18.8 }
            ].map((dev, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{dev.name}</div>
                  <div className="text-sm text-gray-500">{dev.percentage}% of total</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{dev.revenue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Financial Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { activity: 'Payment received from Ahmed Al-Khalifa', amount: 'BD 125,000', type: 'income' },
              { activity: 'Invoice generated for Sarah Johnson', amount: 'BD 85,000', type: 'invoice' },
              { activity: 'Marketing expenses - Q3 campaign', amount: 'BD 45,000', type: 'expense' },
              { activity: 'Construction payment - Al Naseem', amount: 'BD 680,000', type: 'expense' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium text-sm">{item.activity}</div>
                  <div className="text-xs text-gray-500 capitalize">{item.type}</div>
                </div>
                <div className={`font-semibold ${
                  item.type === 'income' ? 'text-green-600' : 
                  item.type === 'expense' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {item.type === 'expense' ? '-' : '+'}{item.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Key Financial Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">22.4%</div>
            <div className="text-sm text-gray-500">Profit Margin</div>
            <div className="text-xs text-green-600">Above industry average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">18.7%</div>
            <div className="text-sm text-gray-500">Return on Investment</div>
            <div className="text-xs text-green-600">Strong performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">BD 45.2M</div>
            <div className="text-sm text-gray-500">Sales Pipeline Value</div>
            <div className="text-xs text-blue-600">Next 6 months</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'revenue':
        return <RevenueAnalytics />;
      case 'payments':
        return <PaymentManagement />;
      case 'forecasting':
        return <FinancialForecasting />;
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
          <p className="text-gray-600">Comprehensive financial management and analytics for Diyar Properties</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-screen">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;