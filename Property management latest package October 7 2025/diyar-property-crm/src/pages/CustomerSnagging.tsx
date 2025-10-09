import React, { useState, useEffect } from 'react';
import { FileText, Camera, CheckCircle, Clock, AlertTriangle, Calendar, User, MessageSquare } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import DigitalSignature from '../components/DigitalSignature';

const supabaseUrl = "https://jnilfkgeojjydbywktol.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CustomerSnagging: React.FC = () => {
  const [snaggingProjects, setSnaggingProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [photos, setPhotos] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'timeline' | 'signature'>('overview');
  const [showSignature, setShowSignature] = useState(false);
  const [signatureComplete, setSignatureComplete] = useState(false);

  // Mock customer ID - in real app, this would come from auth context
  const customerId = 'c9d8e00a-8c19-482e-8fb8-e3c3bef59a8e';

  useEffect(() => {
    loadSnaggingData();
  }, []);

  const loadSnaggingData = async () => {
    try {
      setLoading(true);
      
      // Load customer's snagging projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('snagging_projects')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (!projectsError && projectsData) {
        setSnaggingProjects(projectsData);
        
        // Load the most recent project by default
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0]);
          await loadProjectIssues(projectsData[0].id);
        }
      }

    } catch (error) {
      console.error('Error loading snagging data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectIssues = async (projectId: string) => {
    try {
      // Load issues for the selected project
      const { data: issuesData, error: issuesError } = await supabase
        .from('snagging_issues')
        .select('*')
        .eq('snagging_project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (!issuesError && issuesData) {
        setIssues(issuesData);
        
        // Load photos for each issue
        const photoPromises = issuesData.map(async (issue) => {
          const { data: photoData, error: photoError } = await supabase
            .from('snagging_photos')
            .select('*')
            .eq('snagging_issue_id', issue.id)
            .order('created_at', { ascending: false });
          
          return { issueId: issue.id, photos: photoData || [] };
        });

        const photoResults = await Promise.all(photoPromises);
        const photoMap: { [key: string]: any[] } = {};
        
        photoResults.forEach(result => {
          photoMap[result.issueId] = result.photos;
        });
        
        setPhotos(photoMap);
      }
    } catch (error) {
      console.error('Error loading project issues:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      identified: { icon: AlertTriangle, color: 'text-gray-500' },
      assigned: { icon: User, color: 'text-blue-500' },
      'in_progress': { icon: Clock, color: 'text-yellow-500' },
      resolved: { icon: CheckCircle, color: 'text-green-500' },
      verified: { icon: CheckCircle, color: 'text-green-600' },
      closed: { icon: CheckCircle, color: 'text-green-700' }
    };
    
    const iconData = icons[status as keyof typeof icons] || icons.identified;
    const Icon = iconData.icon;
    
    return <Icon className={`w-5 h-5 ${iconData.color}`} />;
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      identified: 'Identified',
      assigned: 'Assigned to Contractor',
      'in_progress': 'Work in Progress',
      resolved: 'Resolved',
      verified: 'Verified',
      closed: 'Completed'
    };
    
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getProgressPercentage = () => {
    if (issues.length === 0) return 0;
    const resolvedCount = issues.filter(issue => 
      ['resolved', 'verified', 'closed'].includes(issue.status)
    ).length;
    return Math.round((resolvedCount / issues.length) * 100);
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      electrical: '⚡',
      plumbing: '🚿',
      finishing: '🎨',
      structural: '🏗️',
      painting: '🖌️',
      fixtures: '🔧',
      flooring: '🏠',
      doors_windows: '🚪',
      hvac: '❄️',
      landscaping: '🌱',
      other: '📝'
    };
    
    return icons[category as keyof typeof icons] || '📝';
  };

  const handleSignatureSave = async (signatureDataUrl: string) => {
    if (!selectedProject) return;

    try {
      // Update the snagging project with customer signature
      const { error } = await supabase
        .from('snagging_issues')
        .update({
          customer_signature: signatureDataUrl,
          signed_at: new Date().toISOString()
        })
        .eq('property_id', selectedProject.property_id);

      if (error) {
        console.error('Error saving signature:', error);
        throw error;
      }

      setSignatureComplete(true);
      setShowSignature(false);
    } catch (error) {
      console.error('Failed to save signature:', error);
      // You might want to show an error message to the user
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Loading your snagging information...</span>
      </div>
    );
  }

  if (snaggingProjects.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Property Snagging</h1>
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Snagging Projects</h3>
            <p className="text-gray-600">You don't have any active snagging projects at this time.</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = getProgressPercentage();
  const openIssues = issues.filter(issue => !['resolved', 'verified', 'closed'].includes(issue.status));
  const resolvedIssues = issues.filter(issue => ['resolved', 'verified', 'closed'].includes(issue.status));

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Snagging</h1>
            <p className="text-gray-600">Track the progress of your property handover process</p>
          </div>
          
          {/* Project Selector */}
          {snaggingProjects.length > 1 && (
            <div>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = snaggingProjects.find(p => p.id === e.target.value);
                  setSelectedProject(project);
                  if (project) {
                    loadProjectIssues(project.id);
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {snaggingProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    Project {project.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{issues.length}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{openIssues.length}</div>
            <div className="text-sm text-gray-600">Open Issues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{resolvedIssues.length}</div>
            <div className="text-sm text-gray-600">Resolved Issues</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{progressPercentage}%</div>
            <div className="text-sm text-gray-600">Completion</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-sm text-gray-600">{progressPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {progressPercentage === 100 ? (
              'Congratulations! All issues have been resolved.'
            ) : (
              `${openIssues.length} ${openIssues.length === 1 ? 'issue' : 'issues'} remaining`
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Issues Overview', icon: FileText },
              { id: 'progress', label: 'Progress Tracking', icon: CheckCircle },
              { id: 'timeline', label: 'Timeline', icon: Calendar },
              ...(progressPercentage === 100 ? [{ id: 'signature', label: 'Final Sign-off', icon: User }] : [])
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
            {issues.length === 0 ? (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfect Property!</h3>
                <p className="text-gray-600">No snagging issues were found in your property. You're ready for handover!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {issues.map((issue) => (
                  <div key={issue.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getCategoryIcon(issue.category)}</div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{issue.issue_title}</h4>
                          <p className="text-gray-600 mt-1">{issue.issue_description}</p>
                          {issue.location_description && (
                            <p className="text-sm text-gray-500 mt-1">Location: {issue.location_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(issue.status)}
                        <span className="text-sm font-medium text-gray-900">
                          {getStatusText(issue.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="capitalize">{issue.category}</span>
                        <span className="capitalize">{issue.priority} Priority</span>
                        {issue.due_date && (
                          <span>Due: {new Date(issue.due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                      {photos[issue.id] && photos[issue.id].length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Camera className="w-4 h-4" />
                          <span>{photos[issue.id].length} photo{photos[issue.id].length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Photo Gallery */}
                    {photos[issue.id] && photos[issue.id].length > 0 && (
                      <div className="mt-4">
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          {photos[issue.id].slice(0, 6).map((photo, index) => (
                            <div key={photo.id} className="relative aspect-square">
                              <img
                                src={photo.photo_url}
                                alt={photo.caption || 'Issue photo'}
                                className="w-full h-full object-cover rounded border"
                              />
                              <span className={`absolute top-1 right-1 px-1 py-0.5 text-xs rounded ${
                                photo.photo_type === 'before' ? 'bg-red-100 text-red-800' :
                                photo.photo_type === 'during' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {photo.photo_type}
                              </span>
                            </div>
                          ))}
                        </div>
                        {photos[issue.id].length > 6 && (
                          <p className="text-sm text-gray-500 mt-2">
                            +{photos[issue.id].length - 6} more photos
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Progress by Category */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress by Category</h3>
              <div className="space-y-4">
                {Object.entries(
                  issues.reduce((acc, issue) => {
                    if (!acc[issue.category]) {
                      acc[issue.category] = { total: 0, resolved: 0 };
                    }
                    acc[issue.category].total++;
                    if (['resolved', 'verified', 'closed'].includes(issue.status)) {
                      acc[issue.category].resolved++;
                    }
                    return acc;
                  }, {} as { [key: string]: { total: number; resolved: number } })
                ).map(([category, stats]: [string, { total: number; resolved: number }]) => {
                  const percentage = Math.round((stats.resolved / stats.total) * 100);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getCategoryIcon(category)}</span>
                        <span className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</span>
                        <span className="text-sm text-gray-600">({stats.resolved.toString()}/{stats.total.toString()})</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(
                  issues.reduce((acc, issue) => {
                    acc[issue.status] = (acc[issue.status] || 0) + 1;
                    return acc;
                  }, {} as { [key: string]: number })
                ).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getStatusIcon(status)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{count.toString()}</div>
                    <div className="text-sm text-gray-600 capitalize">{getStatusText(status)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Snagging Timeline</h3>
            <div className="space-y-6">
              {/* Project Creation */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Snagging Process Started</h4>
                  <p className="text-sm text-gray-600">Initial property inspection completed</p>
                  <p className="text-xs text-gray-500">
                    {selectedProject && new Date(selectedProject.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Issues Timeline */}
              {issues
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((issue, index) => (
                  <div key={issue.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        ['resolved', 'verified', 'closed'].includes(issue.status)
                          ? 'bg-green-100'
                          : 'bg-orange-100'
                      }`}>
                        {getStatusIcon(issue.status)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{issue.issue_title}</h4>
                      <p className="text-sm text-gray-600">{getStatusText(issue.status)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(issue.created_at).toLocaleDateString()}
                        {issue.resolved_date && (
                          <span> • Resolved: {new Date(issue.resolved_date).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              }

              {/* Project Completion */}
              {progressPercentage === 100 && (
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Ready for Handover</h4>
                    <p className="text-sm text-gray-600">All snagging issues have been resolved</p>
                    <p className="text-xs text-gray-500">Property is ready for final handover</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Digital Signature Tab */}
        {activeTab === 'signature' && progressPercentage === 100 && (
          <div className="space-y-6">
            {!signatureComplete ? (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready for Final Handover</h3>
                  <p className="text-gray-600 mb-4">
                    All snagging issues have been resolved. Please provide your digital signature to complete the handover process.
                  </p>
                </div>
                
                <DigitalSignature
                  onSignatureSave={handleSignatureSave}
                  customerName="Valued Customer"
                  title="Property Handover Confirmation"
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center">
                <div className="mb-6">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Handover Complete!</h3>
                  <p className="text-gray-600">
                    Thank you for your signature. The property handover process is now complete.
                    You should receive your final documentation shortly.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-medium">Digital signature captured successfully</span>
                  </div>
                  <p className="text-green-700 text-sm mt-2">
                    Signed on {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Support */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 mt-8">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
              <p className="text-sm text-gray-600">
                Contact your sales representative if you have any questions about the snagging process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSnagging;