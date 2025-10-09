import { supabase } from './supabase';

// Master Data API functions
export const masterDataAPI = {
  // Property Value Masters
  async getPropertyValueMasters() {
    const { data, error } = await supabase
      .from('property_value_masters')
      .select('*')
      .eq('is_active', true)
      .order('property_type', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createPropertyValueMaster(masterData: any) {
    const { data, error } = await supabase
      .from('property_value_masters')
      .insert([masterData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updatePropertyValueMaster(id: string, updates: any) {
    const { data, error } = await supabase
      .from('property_value_masters')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Cost Sheet Masters
  async getCostSheetMasters() {
    const { data, error } = await supabase
      .from('cost_sheet_masters')
      .select('*')
      .eq('is_active', true)
      .order('cost_category', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createCostSheetMaster(costData: any) {
    const { data, error } = await supabase
      .from('cost_sheet_masters')
      .insert([costData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Payment Milestone Masters
  async getPaymentMilestoneMasters() {
    const { data, error } = await supabase
      .from('payment_milestone_masters')
      .select('*')
      .eq('is_active', true)
      .order('milestone_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createPaymentMilestoneMaster(milestoneData: any) {
    const { data, error } = await supabase
      .from('payment_milestone_masters')
      .insert([milestoneData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Customer Type Masters
  async getCustomerTypeMasters() {
    const { data, error } = await supabase
      .from('customer_type_masters')
      .select('*')
      .eq('is_active', true)
      .order('priority_level', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createCustomerTypeMaster(customerTypeData: any) {
    const { data, error } = await supabase
      .from('customer_type_masters')
      .insert([customerTypeData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Property Registration
  async getPropertyRegistrations() {
    const { data, error } = await supabase
      .from('property_registration_forms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createPropertyRegistration(propertyData: any) {
    const { data, error } = await supabase
      .from('property_registration_forms')
      .insert([propertyData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updatePropertyRegistration(id: string, updates: any) {
    const { data, error } = await supabase
      .from('property_registration_forms')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// User Roles and Permissions API
export const rolePermissionAPI = {
  // Roles
  async getUserRoles() {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('is_active', true)
      .order('role_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createUserRole(roleData: any) {
    const { data, error } = await supabase
      .from('user_roles')
      .insert([roleData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateUserRole(id: string, updates: any) {
    const { data, error } = await supabase
      .from('user_roles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Permissions
  async getPermissions() {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Role Permissions
  async getRolePermissions(roleId: string) {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role_id', roleId);
    
    if (error) throw error;
    return data;
  },

  async updateRolePermissions(roleId: string, permissions: any[]) {
    // Delete existing permissions for the role
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    // Insert new permissions
    const rolePermissions = permissions.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId,
      granted: true
    }));

    const { data, error } = await supabase
      .from('role_permissions')
      .insert(rolePermissions)
      .select();
    
    if (error) throw error;
    return data;
  },

  // User Role Assignments
  async getUserRoleAssignments() {
    const { data, error } = await supabase
      .from('user_role_assignments')
      .select('*')
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async assignUserRole(userId: string, roleId: string) {
    const { data, error } = await supabase
      .from('user_role_assignments')
      .insert([{
        user_id: userId,
        role_id: roleId,
        is_active: true
      }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateUserRoleAssignment(assignmentId: string, updates: any) {
    const { data, error } = await supabase
      .from('user_role_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Workflow Management API
export const workflowAPI = {
  // Workflows
  async getWorkflows() {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('is_active', true)
      .order('workflow_name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createWorkflow(workflowData: any) {
    const { data, error } = await supabase
      .from('workflows')
      .insert([workflowData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateWorkflow(id: string, updates: any) {
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Workflow Steps
  async getWorkflowSteps(workflowId: string) {
    const { data, error } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .eq('is_active', true)
      .order('step_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createWorkflowStep(stepData: any) {
    const { data, error } = await supabase
      .from('workflow_steps')
      .insert([stepData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Workflow Instances
  async getWorkflowInstances() {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select('*')
      .order('initiated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createWorkflowInstance(instanceData: any) {
    const { data, error } = await supabase
      .from('workflow_instances')
      .insert([instanceData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateWorkflowInstance(id: string, updates: any) {
    const { data, error } = await supabase
      .from('workflow_instances')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Audit Logging
export const auditAPI = {
  async logAction(action: string, entityType: string, entityId?: string, oldValues?: any, newValues?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const { data, error } = await supabase
      .from('admin_audit_logs')
      .insert([{
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues
      }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getAuditLogs(limit: number = 100) {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};