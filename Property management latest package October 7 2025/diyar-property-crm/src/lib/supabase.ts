import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jnilfkgeojjydbywktol.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuaWxma2dlb2pqeWRieXdrdG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMDExMzAsImV4cCI6MjA3NDc3NzEzMH0.HtX4Lns_5lT7YdAFL3fIcrZu2DC1E8cry_hO-Mc2_rI";

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (will be expanded as we build out the system)
export interface Island {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Project {
  id: string;
  island_id: string;
  name: string;
  project_type: string;
  status: string;
  created_at: string;
}

export interface Property {
  id: string;
  project_id: string;
  unit_number: string;
  property_type: string;
  size_sqm: number;
  price: number;
  status: string;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  cpr_number: string;
  email: string;
  phone: string;
  nationality: string;
  segment: string;
  created_at: string;
}

export interface Lead {
  id: string;
  customer_id: string;
  status: string;
  lead_source: string;
  interest_level: string;
  budget_range: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  customer_id: string;
  property_id: string;
  compatibility_score: number;
  recommendation_reason: string;
  created_at: string;
}