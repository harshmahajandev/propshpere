import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jnilfkgeojjydbywktol.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI"

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  role: 'admin' | 'sales_manager' | 'sales_rep' | 'customer'
  avatar_url?: string
  company?: string
  nationality?: string
  customer_preferences?: any
  customer_requirements?: string
  risk_level?: 'low' | 'medium' | 'high'
  credit_score?: number
  payment_history?: any
  conversion_date?: string
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  title: string
  project: string
  type: 'villa' | 'apartment' | 'commercial_plot' | 'office' | 'retail' | 'warehouse'
  status: 'available' | 'reserved' | 'sold' | 'maintenance'
  price: number
  currency: string
  size?: number
  bedrooms?: number
  bathrooms?: number
  location: string
  description?: string
  images?: string[]
  floor_plans?: string[]
  amenities?: string[]
  features?: string[]
  latitude?: number
  longitude?: number
  developer_id?: string
  sales_rep_id?: string
  total_units: number
  available_units: number
  created_at: string
  updated_at: string
}

export interface PropertyUnit {
  id: string
  property_id: string
  unit_number: string
  floor_number?: number
  unit_type?: string
  size?: number
  bedrooms?: number
  bathrooms?: number
  price?: number
  status: 'available' | 'reserved' | 'sold'
  floor_plan_url?: string
  view_type?: string
  premium_features?: string[]
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  property_id: string
  unit_id?: string
  customer_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_nationality?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired'
  reservation_date: string
  viewing_date?: string
  preferred_contact_time?: string
  budget_min?: number
  budget_max?: number
  financing_needed: boolean
  special_requirements?: string
  notes?: string
  deposit_amount?: number
  deposit_status: 'pending' | 'paid' | 'refunded'
  sales_rep_id?: string
  created_at: string
  updated_at: string
  expires_at?: string
}

export interface Lead {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  preferred_language: string
  buyer_type?: 'hni' | 'investor' | 'retail' | 'commercial'
  budget_min?: number
  budget_max?: number
  currency: string
  property_interests?: string[]
  timeline?: 'immediate' | '1-3_months' | '3-6_months' | '6-12_months' | 'flexible'
  status: 'new' | 'contacted' | 'qualified' | 'viewing' | 'negotiating' | 'converted' | 'lost'
  score: number
  source?: string
  assigned_to?: string
  notes?: string[]
  activities?: any
  ai_insights?: any
  created_at: string
  updated_at: string
}

// New Enhanced Database Types
export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  property_id?: string
  reservation_id?: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  payment_date?: string
  payment_method?: string
  items: any[]
  notes?: string
  discount_amount: number
  tax_amount: number
  total_amount: number
  pdf_url?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface FinancialRecord {
  id: string
  type: 'revenue' | 'expense' | 'payment' | 'refund' | 'commission' | 'fee'
  category: string
  amount: number
  currency: string
  transaction_date: string
  property_id?: string
  customer_id?: string
  reservation_id?: string
  invoice_id?: string
  description: string
  payment_method?: string
  reference_number?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CustomerCommunication {
  id: string
  customer_id: string
  communication_type: 'phone' | 'email' | 'sms' | 'in_person' | 'video_call' | 'whatsapp'
  direction: 'inbound' | 'outbound'
  subject?: string
  content: string
  staff_id?: string
  scheduled_date?: string
  completed_date?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_response'
  follow_up_required: boolean
  follow_up_date?: string
  attachments: any[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface UnitAvailability {
  id: string
  unit_id: string
  date: string
  status: 'available' | 'booked' | 'maintenance' | 'out_of_service' | 'reserved'
  notes?: string
  maintenance_type?: string
  updated_by?: string
  created_at: string
  updated_at: string
}

export interface CustomerTicket {
  id: string
  ticket_number: string
  customer_id: string
  property_id?: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
  category: string
  assigned_to?: string
  resolution?: string
  created_by?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface Payment {
  id: string
  invoice_id: string
  customer_id: string
  amount: number
  currency: string
  payment_method: string
  payment_reference?: string
  payment_date: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_fee: number
  notes?: string
  processed_by?: string
  created_at: string
  updated_at: string
}

export interface ReportTemplate {
  id: string
  name: string
  type: 'financial' | 'occupancy' | 'customer' | 'property' | 'custom'
  description?: string
  template_config: any
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface GeneratedReport {
  id: string
  template_id?: string
  report_name: string
  report_type: string
  parameters: any
  file_url?: string
  file_size?: number
  generated_by?: string
  generated_at: string
  expires_at?: string
}

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value: any
  setting_type: 'global' | 'user' | 'property' | 'financial'
  description?: string
  is_editable: boolean
  updated_by?: string
  created_at: string
  updated_at: string
}

// Financial Analytics Types
export interface FinancialSummary {
  total_revenue: number
  total_expenses: number
  net_profit: number
  outstanding_invoices: number
  paid_invoices: number
  overdue_invoices: number
  period: string
}

export interface OccupancyStats {
  total_units: number
  occupied_units: number
  available_units: number
  maintenance_units: number
  occupancy_rate: number
  period: string
}

export interface CustomerStats {
  total_customers: number
  new_customers: number
  active_customers: number
  lead_conversion_rate: number
  average_customer_value: number
  period: string
}

export interface Campaign {
  id: string
  campaign_name: string
  property_ids: string[]
  lead_criteria: any
  message_template: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  sent_count: number
  response_count: number
  created_by: string
  scheduled_at?: string
  created_at: string
  updated_at: string
}