import React, { useState, useEffect } from 'react';
import { rolePermissionAPI, auditAPI } from '../../lib/adminAPI';
import { useCustomers } from '../../hooks/useData';
import { LoadingSpinner } from '../index';

interface UserManagementProps {
  onUserUpdate: (user: any) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserUpdate }) => {
  const { customers, loading: customersLoading } = useCustomers();
  const [roles, setRoles] = useState<any[]>([]);
  const [userRoleAssignments, setUserRoleAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRoleAssignment, setShowRoleAssignment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [newUserData, setNewUserData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, assignmentsData] = await Promise.all([
        rolePermissionAPI.getUserRoles(),
        rolePermissionAPI.getUserRoleAssignments()
      ]);
      
      setRoles(rolesData || []);
      setUserRoleAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error loading user management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (userId: string) => {
    const assignment = userRoleAssignments.find(ua => ua.user_id === userId && ua.is_active);
    if (assignment) {
      const role = roles.find(r => r.id === assignment.role_id);
      return role?.role_name || 'No Role';
    }
    return 'No Role';
  };

  const handleRoleAssignment = async (userId: string, roleId: string) => {
    try {
      // Deactivate existing role assignments
      const existingAssignments = userRoleAssignments.filter(ua => ua.user_id === userId && ua.is_active);
      for (const assignment of existingAssignments) {
        await rolePermissionAPI.updateUserRoleAssignment(assignment.id, { is_active: false });
      }

      // Create new role assignment
      if (roleId) {
        await rolePermissionAPI.assignUserRole(userId, roleId);
      }

      // Log the action
      await auditAPI.logAction('ASSIGN_ROLE', 'USER', userId, null, { role_id: roleId });

      // Refresh data
      await loadData();
      
      const user = customers.find(c => c.id === userId);
      const role = roles.find(r => r.id === roleId);
      alert(`Role ${role?.role_name || 'removed'} assigned to ${user?.full_name || 'user'} successfully!`);
      
      setShowRoleAssignment(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role. Please try again.');
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUserData.full_name.trim() || !newUserData.email.trim()) {
        alert('Full name and email are required');
        return;
      }

      // In a real implementation, this would create a new user
      console.log('Creating user:', newUserData);
      await auditAPI.logAction('CREATE_USER', 'USER', null, null, newUserData);
      
      alert('User creation functionality would be implemented here');
      setNewUserData({
        full_name: '',
        email: '',
        phone: '',
        role: '',
        department: '',
        is_active: true
      });
      setShowUserForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handleUserStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      // In a real implementation, this would update user status
      console.log(`Toggle user ${userId} status to ${newStatus}`);
      await auditAPI.logAction('UPDATE_USER_STATUS', 'USER', userId, { is_active: currentStatus }, { is_active: newStatus });
      
      alert(`User status would be updated to ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const filteredUsers = customers.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const userRole = getUserRole(user.id);
    const matchesRole = !filterRole || userRole === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (roleName: string) => {
    const colors = {
      'Super Admin': 'bg-red-100 text-red-800',
      'Admin': 'bg-purple-100 text-purple-800',
      'Manager': 'bg-blue-100 text-blue-800',
      'Sales Agent': 'bg-green-100 text-green-800',
      'Finance Officer': 'bg-yellow-100 text-yellow-800',
      'Customer Service': 'bg-gray-100 text-gray-800',
      'No Role': 'bg-red-50 text-red-600'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-800';
  };

  if (loading || customersLoading) {
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
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-600">Manage system users and their role assignments</p>
        </div>
        <button
          onClick={() => setShowUserForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Search by name or email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.role_name}>{role.role_name}</option>
              ))}
              <option value="No Role">No Role</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('');
              }}
              className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">Total Users</h3>
          <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
          <p className="text-sm text-blue-600">System users</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900">Active Users</h3>
          <p className="text-2xl font-bold text-green-600">{customers.filter(u => u.is_active !== false).length}</p>
          <p className="text-sm text-green-600">Currently active</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900">Admin Users</h3>
          <p className="text-2xl font-bold text-purple-600">
            {customers.filter(u => ['Super Admin', 'Admin'].includes(getUserRole(u.id))).length}
          </p>
          <p className="text-sm text-purple-600">Administrative access</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900">Unassigned</h3>
          <p className="text-2xl font-bold text-orange-600">
            {customers.filter(u => getUserRole(u.id) === 'No Role').length}
          </p>
          <p className="text-sm text-orange-600">No role assigned</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const userRole = getUserRole(user.id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name || 'Unnamed User'}</div>
                          <div className="text-sm text-gray-500">{user.nationality || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                      <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userRole)}`}>
                        {userRole}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleAssignment(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                        >
                          Assign Role
                        </button>
                        <button
                          onClick={() => handleUserStatusToggle(user.id, user.is_active !== false)}
                          className={`px-2 py-1 rounded ${
                            user.is_active !== false 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0A17.5 17.5 0 0021 15" />
            </svg>
            <p className="mt-2 text-sm">No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Add New User</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  value={newUserData.department}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter department"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Role
                </label>
                <select
                  value={newUserData.role}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">No role assigned</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.role_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUserForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleAssignment && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Assign Role to {selectedUser.full_name}</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Role:
                </label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(getUserRole(selectedUser.id))}`}>
                  {getUserRole(selectedUser.id)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Role:
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => handleRoleAssignment(selectedUser.id, '')}
                    className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-red-600">Remove Role</span>
                  </button>
                  {roles.map(role => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleAssignment(selectedUser.id, role.id)}
                      className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{role.role_name}</span>
                        <span className="text-sm text-gray-500">{role.role_description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRoleAssignment(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;