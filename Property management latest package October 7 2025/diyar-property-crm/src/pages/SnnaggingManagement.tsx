import React, { useState, useEffect } from 'react';
import { FileText, Camera, User, Calendar, CheckCircle, AlertTriangle, Clock, Plus, Upload } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jnilfkgeojjydbywktol.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SnnaggingManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'issues' | 'contractors'>('overview');
  const [projects, setProjects] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewIssueForm, setShowNewIssueForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'electrical',
    priority: 'medium',
    location: ''
  });

  const [newProject, setNewProject] = useState({
    propertyId: '',
    customerId: '',
    salesRepId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load snagging projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('snagging_projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!projectsError) {
        setProjects(projectsData || []);
      }

      // Load snagging issues
      const { data: issuesData, error: issuesError } = await supabase
        .from('snagging_issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!issuesError) {
        setIssues(issuesData || []);
      }

      // Load contractors
      const { data: contractorsData, error: contractorsError } = await supabase
        .from('contractors')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });
      
      if (!contractorsError) {
        setContractors(contractorsData || []);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!selectedProject || !newIssue.title || !newIssue.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('snagging-management', {
        body: {
          action: 'create-issue',
          projectId: selectedProject,
          title: newIssue.title,
          description: newIssue.description,
          category: newIssue.category,
          priority: newIssue.priority,
          location: newIssue.location
        }
      });

      if (error) {
        throw error;
      }

      if (data?.data) {
        setIssues(prev => [data.data, ...prev]);
        setNewIssue({ title: '', description: '', category: 'electrical', priority: 'medium', location: '' });
        setShowNewIssueForm(false);
        alert('Issue created successfully!');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to create issue. Please try again.');
    }
  };

  const handleAssignContractor = async (issueId: string, contractorId: string) => {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Default 7 days from now

      const { data, error } = await supabase.functions.invoke('snagging-management', {
        body: {
          action: 'assign-contractor',
          issueId,
          contractorId,
          dueDate: dueDate.toISOString().split('T')[0]
        }
      });

      if (error) {
        throw error;
      }

      if (data?.data) {
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? data.data : issue
        ));
        alert('Contractor assigned successfully!');
      }
    } catch (error) {
      console.error('Error assigning contractor:', error);
      alert('Failed to assign contractor. Please try again.');
    }
  };

  const handleUpdateStatus = async (issueId: string, status: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('snagging-management', {
        body: {
          action: 'update-status',
          issueId,
          status
        }
      });

      if (error) {
        throw error;
      }

      if (data?.data) {
        setIssues(prev => prev.map(issue => 
          issue.id === issueId ? data.data : issue
        ));
        alert('Status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      identified: { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle },
      assigned: { color: 'bg-blue-100 text-blue-800', icon: User },
      'in_progress': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      verified: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      closed: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.identified;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority as keyof typeof colors]}`}>
        {priority}
      </span>
    );
  };

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => ['identified', 'assigned', 'in_progress'].includes(p.status)).length,
    totalIssues: issues.length,
    openIssues: issues.filter(i => !['resolved', 'verified', 'closed'].includes(i.status)).length,
    resolvedIssues: issues.filter(i => ['resolved', 'verified', 'closed'].includes(i.status)).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Loading snagging data...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Snagging Management</h1>
            <p className="text-gray-600">Manage property snagging processes and contractor assignments</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
            <div className="text-sm text-gray-600">Total Projects</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.activeProjects}</div>
            <div className="text-sm text-gray-600">Active Projects</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-600">{stats.totalIssues}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">{stats.openIssues}</div>
            <div className="text-sm text-gray-600">Open Issues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</div>
            <div className="text-sm text-gray-600">Resolved Issues</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'projects', label: 'Projects', icon: FileText },
              { id: 'issues', label: 'Issues', icon: AlertTriangle },
              { id: 'contractors', label: 'Contractors', icon: User }
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Project {project.id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-600">Started: {new Date(project.created_at).toLocaleDateString()}</div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Issues */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Issues</h3>
                <div className="space-y-3">
                  {issues.slice(0, 5).map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{issue.issue_title}</div>
                        <div className="text-sm text-gray-600">{issue.category}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(issue.priority)}
                        {getStatusBadge(issue.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Snagging Projects</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {project.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.property_id?.slice(0, 8) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.customer_id?.slice(0, 8) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.resolved_issues} / {project.total_issues}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedProject(project.id);
                            setShowNewIssueForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Add Issue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Snagging Issues</h3>
                <button
                  onClick={() => setShowNewIssueForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Issue</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contractor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{issue.issue_title}</div>
                          <div className="text-sm text-gray-500">{issue.location_description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(issue.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(issue.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.contractor_id ? (
                          contractors.find(c => c.id === issue.contractor_id)?.company_name || 'Unknown'
                        ) : (
                          'Not assigned'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : 'Not set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!issue.contractor_id && (
                            <select
                              onChange={(e) => handleAssignContractor(issue.id, e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded"
                              defaultValue=""
                            >
                              <option value="" disabled>Assign Contractor</option>
                              {contractors.map(contractor => (
                                <option key={contractor.id} value={contractor.id}>
                                  {contractor.company_name}
                                </option>
                              ))}
                            </select>
                          )}
                          <select
                            onChange={(e) => handleUpdateStatus(issue.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded"
                            defaultValue={issue.status}
                          >
                            <option value="identified">Identified</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="verified">Verified</option>
                            <option value="closed">Closed</option>
                          </select>
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setShowPhotoUpload(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contractors' && (
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Contractors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {contractors.map((contractor) => (
                <div key={contractor.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{contractor.company_name}</h4>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-sm text-gray-600">{contractor.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><span className="font-medium">Contact:</span> {contractor.contact_person}</div>
                    <div><span className="font-medium">Phone:</span> {contractor.phone}</div>
                    <div><span className="font-medium">Email:</span> {contractor.email}</div>
                    <div>
                      <span className="font-medium">Specialties:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {contractor.specialties?.map((specialty: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {specialty}
                          </span>
                        )) || []}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Issue Modal */}
        {showNewIssueForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Issue</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          Project {project.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={newIssue.title}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter issue title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newIssue.description}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe the issue in detail"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newIssue.category}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="electrical">Electrical</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="finishing">Finishing</option>
                        <option value="structural">Structural</option>
                        <option value="painting">Painting</option>
                        <option value="fixtures">Fixtures</option>
                        <option value="flooring">Flooring</option>
                        <option value="doors_windows">Doors & Windows</option>
                        <option value="hvac">HVAC</option>
                        <option value="landscaping">Landscaping</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={newIssue.priority}
                        onChange={(e) => setNewIssue(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={newIssue.location}
                      onChange={(e) => setNewIssue(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Specify location within property"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleCreateIssue}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Create Issue
                  </button>
                  <button
                    onClick={() => {
                      setShowNewIssueForm(false);
                      setSelectedProject('');
                      setNewIssue({ title: '', description: '', category: 'electrical', priority: 'medium', location: '' });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SnnaggingManagement;