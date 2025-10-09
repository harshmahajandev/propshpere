import React, { useState, useEffect } from 'react';
import { StatCard, LoadingSpinner, PropertyCard } from '../components';
import { useIslands, useProjects, useProperties, useCustomers, useFinancialData } from '../hooks/useData';
import { formatCurrency } from '../lib/utils';
import MasterDataForms from '../components/admin/MasterDataForms';
import RolePermissionGrid from '../components/admin/RolePermissionGrid';
import WorkflowConfiguration from '../components/admin/WorkflowConfiguration';
import UserManagement from '../components/admin/UserManagement';
import { masterDataAPI, rolePermissionAPI, workflowAPI, auditAPI } from '../lib/adminAPI';

const AdminDashboard: React.FC = () => {
  const { islands, loading: islandsLoading } = useIslands();
  const { projects, loading: projectsLoading } = useProjects();
  const { properties, loading: propertiesLoading } = useProperties();
  const { customers, loading: customersLoading } = useCustomers();
  const { transactions, loading: financialLoading } = useFinancialData();
  
  const [selectedView, setSelectedView] = useState<'overview' | 'islands' | 'properties' | 'master-data' | 'permissions' | 'workflows' | 'users' | 'audit'>('overview');
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [selectedMasterDataForm, setSelectedMasterDataForm] = useState<string>('property-registration');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [userRoleAssignments, setUserRoleAssignments] = useState<any[]>([]);
  const [showUserManagement, setShowUserManagement] = useState(false);

  // Calculate dashboard metrics
  const totalProperties = properties.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalCustomers = customers.length;
  const monthlyRevenue = transactions
    .filter(t => (t.type === 'Payment' || t.type === 'Invoice') && new Date(t.transaction_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const availableProperties = properties.filter(p => p.status === 'Available').length;
  const soldProperties = properties.filter(p => p.status === 'Sold').length;
  const reservedProperties = properties.filter(p => p.status === 'Reserved').length;

  // Load audit logs on component mount
  useEffect(() => {
    if (selectedView === 'audit') {
      loadAuditLogs();
    }
  }, [selectedView]);

  const loadAuditLogs = async () => {
    try {
      const logs = await auditAPI.getAuditLogs(50);
      setAuditLogs(logs || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  if (islandsLoading || projectsLoading || propertiesLoading || customersLoading || financialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-2 flex-wrap">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedView === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('master-data')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedView === 'master-data'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Master Data
            </button>
            <button
              onClick={() => setSelectedView('permissions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedView === 'permissions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Roles & Permissions
            </button>
            <button
              onClick={() => setSelectedView('workflows')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedView === 'workflows'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Workflows
            </button>
            <button
              onClick={() => setSelectedView('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedView === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setSelectedView('islands')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedView === 'islands'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Islands
            </button>
            <button
              onClick={() => setSelectedView('properties')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedView === 'properties'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Properties
            </button>
            <button
              onClick={() => setSelectedView('audit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedView === 'audit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Audit Logs
            </button>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Properties"
            value={totalProperties}
            color="blue"
            change={{ value: "+12%", type: "increase" }}
          />
          <StatCard
            title="Active Projects"
            value={activeProjects}
            color="green"
            change={{ value: "+2", type: "increase" }}
          />
          <StatCard
            title="Total Customers"
            value={totalCustomers}
            color="purple"
            change={{ value: "+8%", type: "increase" }}
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(monthlyRevenue)}
            color="yellow"
            change={{ value: "+15%", type: "increase" }}
          />
        </div>

        {/* Property Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Available Units"
            value={availableProperties}
            color="green"
            change={{ value: `${((availableProperties / totalProperties) * 100).toFixed(1)}%`, type: "neutral" }}
          />
          <StatCard
            title="Sold Units"
            value={soldProperties}
            color="blue"
            change={{ value: `${((soldProperties / totalProperties) * 100).toFixed(1)}%`, type: "neutral" }}
          />
          <StatCard
            title="Reserved Units"
            value={reservedProperties}
            color="orange"
            change={{ value: `${((reservedProperties / totalProperties) * 100).toFixed(1)}%`, type: "neutral" }}
          />
        </div>

        {selectedView === 'overview' && (
          <>
            {/* Islands Overview */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Islands Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {islands.map((island) => {
                  const islandProjects = projects.filter(p => p.island_id === island.id);
                  const islandProperties = properties.filter(p => 
                    islandProjects.some(proj => p.project === proj.display_name)
                  );
                  
                  return (
                    <div key={island.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900">{island.display_name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{island.description}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Projects:</span>
                          <span className="font-medium">{islandProjects.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Properties:</span>
                          <span className="font-medium">{islandProperties.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-medium capitalize ${
                            island.status === 'active' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {island.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Financial Activity</h2>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.transaction_date).toLocaleDateString()} • {transaction.payment_method}
                      </p>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'Payment' || transaction.type === 'Invoice' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'Payment' || transaction.type === 'Invoice' ? '+' : '-'}
                      {formatCurrency(parseFloat(transaction.amount))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedView === 'master-data' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Master Data Management</h2>
              <div className="flex space-x-2">
                <select
                  value={selectedMasterDataForm}
                  onChange={(e) => setSelectedMasterDataForm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="property-registration">Property Registration</option>
                  <option value="property-value">Property Value Master</option>
                  <option value="cost-sheet">Cost Sheet Management</option>
                  <option value="payment-milestone">Payment Milestones</option>
                  <option value="customer-type">Customer Types</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedMasterDataForm === 'property-registration' && 'Property Registration Form'}
                {selectedMasterDataForm === 'property-value' && 'Property Value Master Form'}
                {selectedMasterDataForm === 'cost-sheet' && 'Cost Sheet Management Form'}
                {selectedMasterDataForm === 'payment-milestone' && 'Payment Milestones Configuration'}
                {selectedMasterDataForm === 'customer-type' && 'Customer Type Masters'}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedMasterDataForm === 'property-registration' && 'Register new properties with site maps and documentation'}
                {selectedMasterDataForm === 'property-value' && 'Configure pricing models and market factors for properties'}
                {selectedMasterDataForm === 'cost-sheet' && 'Manage cost items and categories for property development'}
                {selectedMasterDataForm === 'payment-milestone' && 'Set up payment schedules and milestone configurations'}
                {selectedMasterDataForm === 'customer-type' && 'Define customer categories and eligibility criteria'}
              </p>
            </div>
            
            <MasterDataForms 
              activeForm={selectedMasterDataForm}
              onFormSubmit={(data) => {
                console.log('Form submitted:', data);
                alert('Master data saved successfully!');
              }}
            />
          </div>
        )}

        {selectedView === 'permissions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <RolePermissionGrid 
              onPermissionUpdate={(roleId, permissions) => {
                console.log('Permissions updated for role:', roleId, permissions);
              }}
            />
          </div>
        )}

        {selectedView === 'workflows' && (
          <div className="bg-white rounded-lg shadow p-6">
            <WorkflowConfiguration 
              onWorkflowUpdate={(workflow) => {
                console.log('Workflow updated:', workflow);
              }}
            />
          </div>
        )}

        {selectedView === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <UserManagement 
              onUserUpdate={(user) => {
                console.log('User updated:', user);
              }}
            />
          </div>
        )}

        {selectedView === 'audit' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
                <p className="text-sm text-gray-600">Track all administrative actions and system changes</p>
              </div>
              <button
                onClick={loadAuditLogs}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh Logs</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{log.action}</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {log.entity_type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            User ID: {log.user_id} • {new Date(log.created_at).toLocaleString()}
                          </p>
                          {log.entity_id && (
                            <p className="text-xs text-gray-500 mt-1">Entity ID: {log.entity_id}</p>
                          )}
                        </div>
                      </div>
                      {(log.old_values || log.new_values) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            {log.old_values && (
                              <div>
                                <span className="font-medium text-gray-700">Old Values:</span>
                                <pre className="mt-1 bg-red-50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.new_values && (
                              <div>
                                <span className="font-medium text-gray-700">New Values:</span>
                                <pre className="mt-1 bg-green-50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm">No audit logs found</p>
                  <p className="text-xs text-gray-400">Administrative actions will be logged here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedView === 'islands' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Islands Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Islands List */}
              <div className="lg:col-span-1">
                <h3 className="font-medium text-gray-900 mb-3">Select Island</h3>
                <div className="space-y-2">
                  {islands.map((island) => (
                    <button
                      key={island.id}
                      onClick={() => setSelectedIsland(island.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedIsland === island.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{island.display_name}</div>
                      <div className="text-sm text-gray-600">{island.status}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Island Details */}
              <div className="lg:col-span-2">
                {selectedIsland ? (
                  <div>
                    {(() => {
                      const island = islands.find(i => i.id === selectedIsland);
                      if (!island) return null;
                      
                      const islandProjects = projects.filter(p => p.island_id === island.id);
                      const islandProperties = properties.filter(p => 
                        islandProjects.some(proj => p.project === proj.display_name)
                      );
                      
                      return (
                        <div>
                          <h3 className="font-semibold text-lg mb-4">{island.display_name}</h3>
                          <p className="text-gray-600 mb-6">{island.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">{islandProjects.length}</div>
                              <div className="text-sm text-gray-600">Projects</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{islandProperties.length}</div>
                              <div className="text-sm text-gray-600">Properties</div>
                            </div>
                          </div>
                          
                          <h4 className="font-medium mb-3">Projects on {island.display_name}</h4>
                          <div className="space-y-3">
                            {islandProjects.map((project) => (
                              <div key={project.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium">{project.display_name}</h5>
                                    <p className="text-sm text-gray-600">{project.description}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                                    project.status === 'construction' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {project.status}
                                  </span>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                  {project.total_units} units • {project.completion_percentage}% complete
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()
                  }
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    Select an island to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'properties' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Property Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.slice(0, 12).map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={{
                    id: property.id,
                    unit_number: property.title.split(' ').pop() || '',
                    property_type: property.type,
                    size_sqm: parseFloat(property.size) || 0,
                    price: parseFloat(property.price),
                    status: property.status,
                    bedrooms: property.bedrooms || 0,
                    bathrooms: property.bathrooms || 0,
                    project_name: property.project
                  }}
                  onClick={(prop) => console.log('Property clicked:', prop)}
                />
              ))}
            </div>
            
            {properties.length > 12 && (
              <div className="mt-6 text-center">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  View All Properties ({properties.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;