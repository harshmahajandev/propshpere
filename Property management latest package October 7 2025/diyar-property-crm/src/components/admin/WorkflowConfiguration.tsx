import React, { useState, useEffect } from 'react';
import { workflowAPI, rolePermissionAPI } from '../../lib/adminAPI';
import { LoadingSpinner } from '../index';

interface WorkflowConfigurationProps {
  onWorkflowUpdate: (workflow: any) => void;
}

const WorkflowConfiguration: React.FC<WorkflowConfigurationProps> = ({ onWorkflowUpdate }) => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewWorkflowForm, setShowNewWorkflowForm] = useState(false);
  const [showStepForm, setShowStepForm] = useState(false);
  const [newWorkflowData, setNewWorkflowData] = useState({
    workflow_name: '',
    workflow_description: '',
    workflow_type: 'APPROVAL',
    trigger_conditions: {}
  });
  const [newStepData, setNewStepData] = useState({
    step_name: '',
    step_order: 1,
    step_type: 'APPROVAL',
    required_role_id: '',
    conditions: {},
    actions: {},
    parallel_execution: false,
    timeout_hours: 24
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workflowsData, rolesData] = await Promise.all([
        workflowAPI.getWorkflows(),
        rolePermissionAPI.getUserRoles()
      ]);
      
      setWorkflows(workflowsData || []);
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkflowSteps = async (workflowId: string) => {
    try {
      const steps = await workflowAPI.getWorkflowSteps(workflowId);
      setWorkflowSteps(steps || []);
    } catch (error) {
      console.error('Error loading workflow steps:', error);
    }
  };

  const handleWorkflowSelect = (workflow: any) => {
    setSelectedWorkflow(workflow);
    loadWorkflowSteps(workflow.id);
  };

  const handleCreateWorkflow = async () => {
    try {
      if (!newWorkflowData.workflow_name.trim()) {
        alert('Workflow name is required');
        return;
      }
      
      const newWorkflow = await workflowAPI.createWorkflow({
        ...newWorkflowData,
        is_active: true,
        is_template: false
      });
      
      setWorkflows(prev => [...prev, newWorkflow]);
      setNewWorkflowData({
        workflow_name: '',
        workflow_description: '',
        workflow_type: 'APPROVAL',
        trigger_conditions: {}
      });
      setShowNewWorkflowForm(false);
      onWorkflowUpdate(newWorkflow);
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Error creating workflow. Please try again.');
    }
  };

  const handleCreateStep = async () => {
    try {
      if (!selectedWorkflow || !newStepData.step_name.trim()) {
        alert('Step name is required');
        return;
      }
      
      const newStep = await workflowAPI.createWorkflowStep({
        ...newStepData,
        workflow_id: selectedWorkflow.id,
        is_active: true
      });
      
      setWorkflowSteps(prev => [...prev, newStep].sort((a, b) => a.step_order - b.step_order));
      setNewStepData({
        step_name: '',
        step_order: workflowSteps.length + 1,
        step_type: 'APPROVAL',
        required_role_id: '',
        conditions: {},
        actions: {},
        parallel_execution: false,
        timeout_hours: 24
      });
      setShowStepForm(false);
    } catch (error) {
      console.error('Error creating workflow step:', error);
      alert('Error creating workflow step. Please try again.');
    }
  };

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'APPROVAL': return 'bg-blue-100 text-blue-800';
      case 'CONDITION': return 'bg-yellow-100 text-yellow-800';
      case 'ACTION': return 'bg-green-100 text-green-800';
      case 'NOTIFICATION': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkflowTypeColor = (type: string) => {
    switch (type) {
      case 'APPROVAL': return 'bg-blue-100 text-blue-800';
      case 'NOTIFICATION': return 'bg-purple-100 text-purple-800';
      case 'PROCESS': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Workflow Configuration</h3>
          <p className="text-sm text-gray-600">Create and manage approval workflows and business processes</p>
        </div>
        <button
          onClick={() => setShowNewWorkflowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Create New Workflow</span>
        </button>
      </div>

      {/* New Workflow Form Modal */}
      {showNewWorkflowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Create New Workflow</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    value={newWorkflowData.workflow_name}
                    onChange={(e) => setNewWorkflowData(prev => ({ ...prev, workflow_name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter workflow name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Type *
                  </label>
                  <select
                    value={newWorkflowData.workflow_type}
                    onChange={(e) => setNewWorkflowData(prev => ({ ...prev, workflow_type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="APPROVAL">Approval</option>
                    <option value="NOTIFICATION">Notification</option>
                    <option value="PROCESS">Process</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workflow Description
                </label>
                <textarea
                  value={newWorkflowData.workflow_description}
                  onChange={(e) => setNewWorkflowData(prev => ({ ...prev, workflow_description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Enter workflow description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Conditions (JSON)
                </label>
                <textarea
                  value={JSON.stringify(newWorkflowData.trigger_conditions, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setNewWorkflowData(prev => ({ ...prev, trigger_conditions: parsed }));
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={3}
                  placeholder='{"amount_threshold": 10000, "entity_type": "payment"}'
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewWorkflowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Step Form Modal */}
      {showStepForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">Add Workflow Step</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Name *
                  </label>
                  <input
                    type="text"
                    value={newStepData.step_name}
                    onChange={(e) => setNewStepData(prev => ({ ...prev, step_name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter step name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Order *
                  </label>
                  <input
                    type="number"
                    value={newStepData.step_order}
                    onChange={(e) => setNewStepData(prev => ({ ...prev, step_order: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step Type *
                  </label>
                  <select
                    value={newStepData.step_type}
                    onChange={(e) => setNewStepData(prev => ({ ...prev, step_type: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="APPROVAL">Approval</option>
                    <option value="CONDITION">Condition</option>
                    <option value="ACTION">Action</option>
                    <option value="NOTIFICATION">Notification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Role
                  </label>
                  <select
                    value={newStepData.required_role_id}
                    onChange={(e) => setNewStepData(prev => ({ ...prev, required_role_id: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select role (optional)</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.role_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout (Hours)
                  </label>
                  <input
                    type="number"
                    value={newStepData.timeout_hours}
                    onChange={(e) => setNewStepData(prev => ({ ...prev, timeout_hours: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newStepData.parallel_execution}
                      onChange={(e) => setNewStepData(prev => ({ ...prev, parallel_execution: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Parallel Execution</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Conditions (JSON)
                </label>
                <textarea
                  value={JSON.stringify(newStepData.conditions, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setNewStepData(prev => ({ ...prev, conditions: parsed }));
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={3}
                  placeholder='{"min_amount": 5000}'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Actions (JSON)
                </label>
                <textarea
                  value={JSON.stringify(newStepData.actions, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setNewStepData(prev => ({ ...prev, actions: parsed }));
                    } catch (err) {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm"
                  rows={3}
                  placeholder='{"send_email": true, "update_status": "approved"}'
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStepForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Step
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Workflows</h4>
            <div className="space-y-2">
              {workflows.map(workflow => (
                <button
                  key={workflow.id}
                  onClick={() => handleWorkflowSelect(workflow)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedWorkflow?.id === workflow.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{workflow.workflow_name}</h5>
                      <p className="text-xs text-gray-600 mt-1">{workflow.workflow_description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkflowTypeColor(workflow.workflow_type)}`}>
                      {workflow.workflow_type}
                    </span>
                  </div>
                </button>
              ))}
              {workflows.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No workflows found</p>
              )}
            </div>
          </div>
        </div>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900">{selectedWorkflow.workflow_name}</h4>
                  <p className="text-sm text-gray-600">{selectedWorkflow.workflow_description}</p>
                </div>
                <button
                  onClick={() => setShowStepForm(true)}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Step</span>
                </button>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">Workflow Steps</h5>
                {workflowSteps.length > 0 ? (
                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => {
                      const assignedRole = roles.find(role => role.id === step.required_role_id);
                      return (
                        <div key={step.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                {step.step_order}
                              </div>
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900">{step.step_name}</h6>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepTypeColor(step.step_type)}`}>
                                    {step.step_type}
                                  </span>
                                  {assignedRole && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                      {assignedRole.role_name}
                                    </span>
                                  )}
                                  {step.parallel_execution && (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                      Parallel
                                    </span>
                                  )}
                                  {step.timeout_hours && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                      {step.timeout_hours}h timeout
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Step Details */}
                          {(Object.keys(step.conditions || {}).length > 0 || Object.keys(step.actions || {}).length > 0) && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {Object.keys(step.conditions || {}).length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700">Conditions:</span>
                                    <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                      {JSON.stringify(step.conditions, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {Object.keys(step.actions || {}).length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700">Actions:</span>
                                    <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                                      {JSON.stringify(step.actions, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-sm">No workflow steps defined</p>
                    <p className="text-xs text-gray-400">Add steps to define the approval process</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <p className="mt-2 text-sm">Select a workflow to view and edit steps</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowConfiguration;