export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  roles: UserRole[];
  permissions: Permission[];
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystemRole: boolean;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  resource: Resource;
  action: Action;
  createdAt: Date;
}

export enum Resource {
  // Core Resources
  DASHBOARD = 'dashboard',
  PROPERTIES = 'properties',
  CUSTOMERS = 'customers',
  INVOICES = 'invoices',
  MAINTENANCE = 'maintenance',
  
  // Advanced Resources
  LEADS = 'leads',
  CRM_PIPELINE = 'crm_pipeline',
  PROJECTS = 'projects',
  ANALYTICS = 'analytics',
  
  // System Resources
  USERS = 'users',
  ROLES = 'roles',
  ORGANIZATIONS = 'organizations',
  SETTINGS = 'settings',
  REPORTS = 'reports'
}

export enum Action {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  MANAGE = 'manage', // Full CRUD + special actions
  ASSIGN = 'assign',
  APPROVE = 'approve',
  EXPORT = 'export',
  IMPORT = 'import'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  roleIds: string[];
  isActive: boolean;
}

export interface UpdateUserRequest {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserFilter {
  search?: string;
  roleId?: string;
  status?: UserStatus;
  isActive?: boolean;
  organizationId?: string;
}
