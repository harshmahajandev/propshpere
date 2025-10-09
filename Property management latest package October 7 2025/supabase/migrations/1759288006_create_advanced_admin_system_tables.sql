-- Migration: create_advanced_admin_system_tables
-- Created at: 1759288006

-- Create User Roles and Permissions System
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  role_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  permission_name VARCHAR(100) NOT NULL UNIQUE,
  permission_description TEXT,
  module_name VARCHAR(50) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- CREATE, READ, UPDATE, DELETE, EXECUTE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create User Role Assignments
CREATE TABLE user_role_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create Master Data Tables
CREATE TABLE property_value_masters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_type VARCHAR(100) NOT NULL,
  size_category VARCHAR(50),
  base_price_per_sqm DECIMAL(15,2) NOT NULL,
  market_factor DECIMAL(5,4) DEFAULT 1.0000,
  island_id UUID,
  project_id UUID,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cost_sheet_masters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cost_category VARCHAR(100) NOT NULL,
  cost_item VARCHAR(200) NOT NULL,
  unit_cost DECIMAL(15,2) NOT NULL,
  cost_type VARCHAR(50) NOT NULL, -- FIXED, VARIABLE, PERCENTAGE
  applicable_property_types TEXT[], -- Array of property types
  is_mandatory BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payment_milestone_masters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  milestone_name VARCHAR(200) NOT NULL,
  milestone_order INTEGER NOT NULL,
  payment_percentage DECIMAL(5,2) NOT NULL,
  days_from_booking INTEGER DEFAULT 0,
  milestone_description TEXT,
  is_default BOOLEAN DEFAULT false,
  property_types TEXT[],
  project_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customer_type_masters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_type VARCHAR(100) NOT NULL UNIQUE,
  customer_description TEXT,
  eligibility_criteria JSONB,
  default_benefits JSONB,
  priority_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Workflow Management System
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_name VARCHAR(200) NOT NULL,
  workflow_description TEXT,
  workflow_type VARCHAR(100) NOT NULL, -- APPROVAL, NOTIFICATION, PROCESS
  trigger_conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL,
  step_name VARCHAR(200) NOT NULL,
  step_order INTEGER NOT NULL,
  step_type VARCHAR(50) NOT NULL, -- APPROVAL, CONDITION, ACTION, NOTIFICATION
  required_role_id UUID,
  conditions JSONB,
  actions JSONB,
  parallel_execution BOOLEAN DEFAULT false,
  timeout_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE workflow_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL,
  instance_name VARCHAR(200),
  entity_type VARCHAR(100) NOT NULL, -- CUSTOMER, PROPERTY, PAYMENT, etc.
  entity_id UUID NOT NULL,
  current_step_id UUID,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED
  initiated_by UUID,
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

CREATE TABLE workflow_step_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_instance_id UUID NOT NULL,
  workflow_step_id UUID NOT NULL,
  step_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, APPROVED, REJECTED, SKIPPED
  assigned_to UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  decision JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Property Registration Master
CREATE TABLE property_registration_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_title VARCHAR(200) NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  island_id UUID,
  project_id UUID,
  plot_number VARCHAR(50),
  built_up_area DECIMAL(10,2),
  land_area DECIMAL(10,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,
  amenities TEXT[],
  site_map_url TEXT,
  floor_plan_url TEXT,
  legal_documents JSONB,
  registration_status VARCHAR(50) DEFAULT 'DRAFT',
  submitted_by UUID,
  approved_by UUID,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Audit Log
CREATE TABLE admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO user_roles (role_name, role_description) VALUES
('Super Admin', 'Full system access with all permissions'),
('Admin', 'Administrative access to most modules'),
('Manager', 'Managerial access with approval permissions'),
('Sales Agent', 'Sales team access for CRM and customer management'),
('Finance Officer', 'Financial operations and reporting access'),
('Customer Service', 'Customer support and basic data access');

-- Insert default permissions
INSERT INTO permissions (permission_name, permission_description, module_name, action_type) VALUES
-- Dashboard permissions
('dashboard_view', 'View dashboard overview', 'Dashboard', 'READ'),
('analytics_view', 'View analytics and reports', 'Dashboard', 'READ'),

-- Admin permissions
('admin_master_data_create', 'Create master data entries', 'Admin', 'CREATE'),
('admin_master_data_edit', 'Edit master data entries', 'Admin', 'UPDATE'),
('admin_master_data_delete', 'Delete master data entries', 'Admin', 'DELETE'),
('admin_user_management', 'Manage system users', 'Admin', 'EXECUTE'),
('admin_role_management', 'Manage user roles and permissions', 'Admin', 'EXECUTE'),
('admin_workflow_management', 'Configure workflows', 'Admin', 'EXECUTE'),

-- Sales CRM permissions
('sales_leads_view', 'View sales leads', 'Sales', 'READ'),
('sales_leads_create', 'Create new leads', 'Sales', 'CREATE'),
('sales_leads_edit', 'Edit existing leads', 'Sales', 'UPDATE'),
('sales_customers_view', 'View customer profiles', 'Sales', 'READ'),
('sales_customers_edit', 'Edit customer information', 'Sales', 'UPDATE'),
('sales_recommendations_view', 'View AI recommendations', 'Sales', 'READ'),

-- Finance permissions
('finance_invoices_view', 'View invoices', 'Finance', 'READ'),
('finance_invoices_create', 'Create invoices', 'Finance', 'CREATE'),
('finance_payments_view', 'View payments', 'Finance', 'READ'),
('finance_payments_process', 'Process payments', 'Finance', 'EXECUTE'),
('finance_reports_view', 'View financial reports', 'Finance', 'READ'),

-- Property permissions
('property_view', 'View property information', 'Property', 'READ'),
('property_create', 'Create new properties', 'Property', 'CREATE'),
('property_edit', 'Edit property information', 'Property', 'UPDATE'),
('property_map_view', 'View property map', 'Property', 'READ'),

-- Customer Portal permissions
('portal_view', 'Access customer portal', 'Portal', 'READ'),
('portal_documents_view', 'View customer documents', 'Portal', 'READ');

-- Insert default customer types
INSERT INTO customer_type_masters (customer_type, customer_description, priority_level) VALUES
('VIP', 'High-value customers with premium service', 1),
('Corporate', 'Corporate and business customers', 2),
('Retail', 'Individual retail customers', 3),
('Investor', 'Property investment customers', 2),
('First Time Buyer', 'First-time property buyers', 3);

-- Insert default workflow templates
INSERT INTO workflows (workflow_name, workflow_description, workflow_type, is_template) VALUES
('Property Registration Approval', 'Approval workflow for new property registrations', 'APPROVAL', true),
('Customer Onboarding', 'Customer verification and onboarding process', 'PROCESS', true),
('Payment Approval', 'High-value payment approval workflow', 'APPROVAL', true),
('Document Verification', 'Document verification and approval process', 'APPROVAL', true);

-- Create indexes for performance
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_user_role_assignments_user_id ON user_role_assignments(user_id);
CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_step_instances_workflow_instance ON workflow_step_instances(workflow_instance_id);
CREATE INDEX idx_admin_audit_logs_user_id ON admin_audit_logs(user_id);
CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);;