// API functions for interacting with Supabase backend
import { supabase } from './supabase';

// Islands API
export const islandsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('islands')
      .select('*')
      .order('display_name');
    
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('islands')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Projects API
export const projectsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('display_name');
    
    if (error) throw error;
    return data;
  },

  async getByIsland(islandId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('island_id', islandId)
      .order('display_name');
    
    if (error) throw error;
    return data;
  }
};

// Properties API
export const propertiesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('title');
    
    if (error) throw error;
    return data;
  },

  async getByProject(projectName: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('project', projectName)
      .order('title');
    
    if (error) throw error;
    return data;
  },

  async updateStatus(propertyId: string, status: string) {
    const { data, error } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', propertyId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Customers API
export const customersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    
    if (error) throw error;
    return data;
  },

  async create(customer: any) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(customer)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async update(customerId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', customerId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Leads API
export const leadsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(lead: any) {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(leadId: string, status: string) {
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Recommendations API
export const recommendationsAPI = {
  async getForCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('property_recommendations')
      .select('*')
      .eq('customer_id', customerId)
      .order('compatibility_score', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async generateRecommendations(customerId: string) {
    // This will call our recommendation-engine edge function
    const { data, error } = await supabase.functions.invoke('recommendation-engine', {
      body: { customer_id: customerId }
    });

    if (error) throw error;
    return data;
  }
};

// Financial Transactions API
export const financialAPI = {
  async getTransactions() {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getCustomerTransactions(customerId: string) {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('customer_id', customerId)
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};