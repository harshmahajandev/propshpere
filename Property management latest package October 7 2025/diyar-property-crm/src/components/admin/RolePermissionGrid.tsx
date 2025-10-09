import React, { useState, useEffect } from 'react';
import { rolePermissionAPI } from '../../lib/adminAPI';
import { LoadingSpinner } from '../index';

interface RolePermissionGridProps {
  onPermissionUpdate: (roleId: string, permissions: string[]) => void;
}

const RolePermissionGrid: React.FC<RolePermissionGridProps> = ({ onPermissionUpdate }) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ role_name: '', role_description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        rolePermissionAPI.getUserRoles(),
        rolePermissionAPI.getPermissions()
      ]);
      
      setRoles(rolesData || []);
      setPermissions(permissionsData || []);
      
      // Load role permissions for each role
      const rolePermsMap: Record<string, string[]> = {};
      for (const role of rolesData || []) {
        const rolePerms = await rolePermissionAPI.getRolePermissions(role.id);
        rolePermsMap[role.id] = rolePerms.map(rp => rp.permission_id);
      }
      setRolePermissions(rolePermsMap);
    } catch (error) {
      console.error('Error loading role permission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = async (roleId: string, permissionId: string) => {
    try {
      setSaving(true);
      const currentPermissions = rolePermissions[roleId] || [];
      const newPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter(p => p !== permissionId)
        : [...currentPermissions, permissionId];
      
      await rolePermissionAPI.updateRolePermissions(roleId, newPermissions);
      
      setRolePermissions(prev => ({
        ...prev,
        [roleId]: newPermissions
      }));
      
      onPermissionUpdate(roleId, newPermissions);
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!newRoleData.role_name.trim()) {
        alert('Role name is required');
        return;
      }
      
      const newRole = await rolePermissionAPI.createUserRole({
        ...newRoleData,
        is_active: true
      });
      
      setRoles(prev => [...prev, newRole]);
      setRolePermissions(prev => ({ ...prev, [newRole.id]: [] }));
      setNewRoleData({ role_name: '', role_description: '' });
      setShowNewRoleForm(false);
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Error creating role. Please try again.');
    }
  };

  const groupPermissionsByModule = () => {
    const grouped: Record<string, any[]> = {};
    permissions.forEach(permission => {
      if (!grouped[permission.module_name]) {
        grouped[permission.module_name] = [];
      }
      grouped[permission.module_name].push(permission);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const groupedPermissions = groupPermissionsByModule();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Role-Based Permission Management</h3>
          <p className="text-sm text-gray-600">Configure module access and permissions for each role</p>
        </div>
        <button
          onClick={() => setShowNewRoleForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Role</span>
        </button>
      </div>

      {/* New Role Form Modal */}
      {showNewRoleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Create New Role</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={newRoleData.role_name}
                  onChange={(e) => setNewRoleData(prev => ({ ...prev, role_name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Description
                </label>
                <textarea
                  value={newRoleData.role_description}
                  onChange={(e) => setNewRoleData(prev => ({ ...prev, role_description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Enter role description"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewRoleForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Grid */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module / Permission
                </th>
                {roles.map(role => (
                  <th key={role.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{role.role_name}</span>
                      <span className="text-xs text-gray-400 normal-case">{role.role_description}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(groupedPermissions).map(([moduleName, modulePermissions]) => (
                <React.Fragment key={moduleName}>
                  {/* Module Header */}
                  <tr className="bg-gray-25">
                    <td colSpan={roles.length + 1} className="px-6 py-3">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        {moduleName} Module
                      </h4>
                    </td>
                  </tr>
                  
                  {/* Module Permissions */}
                  {modulePermissions.map(permission => (
                    <tr key={permission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {permission.permission_name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {permission.permission_description}
                          </span>
                          <span className="text-xs text-blue-600 font-mono">
                            {permission.action_type}
                          </span>
                        </div>
                      </td>
                      {roles.map(role => (
                        <td key={`${role.id}-${permission.id}`} className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handlePermissionToggle(role.id, permission.id)}
                            disabled={saving}
                            className={`w-6 h-6 rounded border-2 transition-colors ${
                              rolePermissions[role.id]?.includes(permission.id)
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            } disabled:opacity-50`}
                          >
                            {rolePermissions[role.id]?.includes(permission.id) && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded border"></div>
            <span>Permission Granted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
            <span>Permission Denied</span>
          </div>
          <div className="text-gray-600">
            <span className="font-mono bg-blue-100 px-1 rounded">CREATE</span> = Create new records
          </div>
          <div className="text-gray-600">
            <span className="font-mono bg-blue-100 px-1 rounded">READ</span> = View existing records
          </div>
          <div className="text-gray-600">
            <span className="font-mono bg-blue-100 px-1 rounded">UPDATE</span> = Edit existing records
          </div>
          <div className="text-gray-600">
            <span className="font-mono bg-blue-100 px-1 rounded">DELETE</span> = Delete records
          </div>
          <div className="text-gray-600">
            <span className="font-mono bg-blue-100 px-1 rounded">EXECUTE</span> = Perform actions
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionGrid;