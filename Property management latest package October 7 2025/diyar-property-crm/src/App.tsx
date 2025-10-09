import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import SalesCrm from './pages/SalesCrm';
import FinanceDashboard from './pages/FinanceDashboard';
import CustomerPortal from './pages/CustomerPortal';
import PropertyMap from './pages/PropertyMap';
import SnnaggingManagement from './pages/SnnaggingManagement';
import CustomerSnagging from './pages/CustomerSnagging';
import EnhancedPropertyMap from './pages/EnhancedPropertyMap';
import './App.css';

// Navigation Component
const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: '🏢' },
    { path: '/sales', label: 'Sales CRM', icon: '📊' },
    { path: '/map', label: 'Property Map', icon: '🗺️' },
    { path: '/snagging', label: 'Snagging', icon: '🔧' },
    { path: '/finance', label: 'Finance', icon: '💰' },
    { path: '/portal', label: 'Customer Portal', icon: '👤' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">Diyar.bh</div>
            <div className="ml-2 text-sm text-gray-500">Property Management & CRM</div>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Welcome/Landing Component
const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-4xl px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">Diyar.bh</span>
        </h1>
        <h2 className="text-2xl text-gray-700 mb-8">
          Property Management & CRM System
        </h2>
        <p className="text-lg text-gray-600 mb-12 leading-relaxed">
          Comprehensive enterprise platform for Bahrain's largest real estate developer. 
          Manage properties across 7 islands, streamline sales processes, and deliver 
          exceptional customer experiences.
        </p>
        
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <Link to="/admin" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group-hover:bg-blue-50">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Admin Dashboard</h3>
              <p className="text-sm text-gray-600 mt-2">Property portfolio management and system overview</p>
            </div>
          </Link>
          
          <Link to="/sales" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group-hover:bg-blue-50">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Sales CRM</h3>
              <p className="text-sm text-gray-600 mt-2">Lead management with AI-powered recommendations</p>
            </div>
          </Link>
          
          <Link to="/map" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group-hover:bg-blue-50">
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Property Map</h3>
              <p className="text-sm text-gray-600 mt-2">Interactive map with quick reservation system</p>
            </div>
          </Link>
          
          <Link to="/snagging" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group-hover:bg-blue-50">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Snagging Management</h3>
              <p className="text-sm text-gray-600 mt-2">Property handover and issue tracking system</p>
            </div>
          </Link>
          
          <Link to="/finance" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group-hover:bg-blue-50">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Finance Dashboard</h3>
              <p className="text-sm text-gray-600 mt-2">Revenue tracking and payment analytics</p>
            </div>
          </Link>
          
          <Link to="/portal" className="group">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group-hover:bg-blue-50">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Customer Portal</h3>
              <p className="text-sm text-gray-600 mt-2">Development tracking and payment management</p>
            </div>
          </Link>
        </div>
        
        {/* Company Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">About Diyar Al Muharraq</h3>
          <p className="text-gray-600 leading-relaxed">
            Bahrain's largest real estate development company with 12 square kilometers 
            across 7 man-made islands. We specialize in premium villa developments that 
            fuse heritage with modern sustainability across Al Naseem, Al Bareh, 
            Deerat Al Oyoun, Al Noor & Al Sherooq, and Jeewan projects.
          </p>
        </div>
      </div>
    </div>
  );
};

// Layout Component with Navigation
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>{children}</main>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Welcome page without navigation */}
        <Route path="/" element={<Welcome />} />
        
        {/* Main application routes with navigation */}
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/sales" element={<Layout><SalesCrm /></Layout>} />
        <Route path="/map" element={<Layout><EnhancedPropertyMap /></Layout>} />
        <Route path="/snagging" element={<Layout><SnnaggingManagement /></Layout>} />
        <Route path="/finance" element={<Layout><FinanceDashboard /></Layout>} />
        <Route path="/portal" element={<Layout><CustomerPortal /></Layout>} />
        
        {/* Additional routes for specific features */}
        <Route path="/customer-snagging" element={<Layout><CustomerSnagging /></Layout>} />
        <Route path="/property-map-legacy" element={<Layout><PropertyMap /></Layout>} />
        
        {/* Catch-all redirect to welcome */}
        <Route path="*" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;