import { supabase } from './supabase';

// Villa Units API
export const villaUnitsAPI = {
  async getAllVillas() {
    const { data, error } = await supabase
      .from('villas')
      .select('*')
      .order('unit_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getVillaById(id: string) {
    const { data, error } = await supabase
      .from('villas')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getVillaByUnitNumber(unitNumber: string) {
    const { data, error } = await supabase
      .from('villas')
      .select('*')
      .eq('unit_number', unitNumber)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateVillaStatus(villaId: string, status: string, userId?: string) {
    // Update villa status
    const { data: villa, error: villaError } = await supabase
      .from('villas')
      .update({ 
        status, 
        updated_at: new Date().toISOString(),
        ...(status === 'reserved' && { reserved_date: new Date().toISOString() }),
        ...(status === 'sold' && { sold_date: new Date().toISOString() })
      })
      .eq('id', villaId)
      .select()
      .maybeSingle();
    
    if (villaError) throw villaError;

    // Log status update
    if (userId) {
      await this.logStatusUpdate(villaId, villa.status, status, userId);
    }

    return villa;
  },

  async logStatusUpdate(villaId: string, previousStatus: string, newStatus: string, userId: string, reason?: string) {
    const { data, error } = await supabase
      .from('villa_status_updates')
      .insert([{
        villa_unit_id: villaId,
        previous_status: previousStatus,
        new_status: newStatus,
        updated_by: userId,
        reason
      }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getVillasByStatus(status: string) {
    const { data, error } = await supabase
      .from('villas')
      .select('*')
      .eq('status', status)
      .order('unit_number', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async searchVillas(filters: any) {
    let query = supabase.from('villas').select('*');

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.property_type && filters.property_type.length > 0) {
      query = query.in('property_type', filters.property_type);
    }

    if (filters.min_price) {
      query = query.gte('current_price', filters.min_price);
    }

    if (filters.max_price) {
      query = query.lte('current_price', filters.max_price);
    }

    if (filters.min_bedrooms) {
      query = query.gte('bedrooms', filters.min_bedrooms);
    }

    if (filters.max_bedrooms) {
      query = query.lte('bedrooms', filters.max_bedrooms);
    }

    if (filters.min_area) {
      query = query.gte('built_up_area', filters.min_area);
    }

    if (filters.max_area) {
      query = query.lte('built_up_area', filters.max_area);
    }

    if (filters.unit_number) {
      query = query.ilike('unit_number', `%${filters.unit_number}%`);
    }

    const { data, error } = await query.order('unit_number', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};

// Quick Registration API
export const quickRegistrationAPI = {
  async createQuickRegistration(registrationData: any) {
    const { data, error } = await supabase
      .from('map_quick_registrations')
      .insert([registrationData])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getAllRegistrations() {
    const { data, error } = await supabase
      .from('map_quick_registrations')
      .select(`
        *,
        villa_unit:villas(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getRegistrationsByStatus(status: string) {
    const { data, error } = await supabase
      .from('map_quick_registrations')
      .select(`
        *,
        villa_unit:villas(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateRegistrationStatus(registrationId: string, status: string) {
    const { data, error } = await supabase
      .from('map_quick_registrations')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', registrationId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async convertRegistrationToLead(registrationId: string, leadData: any) {
    // Create lead in leads table
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .maybeSingle();
    
    if (leadError) throw leadError;

    // Update registration with lead_id
    const { data: registration, error: regError } = await supabase
      .from('map_quick_registrations')
      .update({ 
        lead_id: lead.id,
        status: 'converted',
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .select()
      .maybeSingle();
    
    if (regError) throw regError;

    return { lead, registration };
  }
};

// Villa Interactions API
export const villaInteractionsAPI = {
  async logInteraction(villaId: string, userId: string, interactionType: string, details?: any) {
    const { data, error } = await supabase
      .from('villa_interactions')
      .insert([{
        villa_unit_id: villaId,
        user_id: userId,
        interaction_type: interactionType,
        interaction_details: details || {},
        session_id: sessionStorage.getItem('session_id') || 'unknown'
      }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getVillaInteractions(villaId: string) {
    const { data, error } = await supabase
      .from('villa_interactions')
      .select('*')
      .eq('villa_unit_id', villaId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getUserInteractions(userId: string) {
    const { data, error } = await supabase
      .from('villa_interactions')
      .select(`
        *,
        villa_unit:villas(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getPopularVillas(limit: number = 10) {
    const { data, error } = await supabase
      .from('villa_interactions')
      .select(`
        villa_unit_id,
        villa_unit:villas(*),
        count(*)
      `)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

// Map Layout API
export const mapLayoutAPI = {
  async getActiveLayout() {
    const { data, error } = await supabase
      .from('map_layouts')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getAllLayouts() {
    const { data, error } = await supabase
      .from('map_layouts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateLayout(layoutId: string, updates: any) {
    const { data, error } = await supabase
      .from('map_layouts')
      .update(updates)
      .eq('id', layoutId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Analytics API
export const mapAnalyticsAPI = {
  async getVillaPerformanceStats(villaId: string) {
    const [interactions, registrations] = await Promise.all([
      supabase.from('villa_interactions').select('*').eq('villa_unit_id', villaId),
      supabase.from('map_quick_registrations').select('*').eq('villa_unit_id', villaId)
    ]);

    const views = interactions.data?.filter(i => i.interaction_type === 'view').length || 0;
    const selections = interactions.data?.filter(i => i.interaction_type === 'select').length || 0;
    const registrationsCount = registrations.data?.length || 0;
    const conversions = registrations.data?.filter(r => r.status === 'converted').length || 0;

    return {
      views,
      selections,
      registrations: registrationsCount,
      conversions,
      conversion_rate: registrationsCount > 0 ? (conversions / registrationsCount * 100).toFixed(2) : '0',
      view_to_registration_rate: views > 0 ? (registrationsCount / views * 100).toFixed(2) : '0'
    };
  },

  async getOverallMapStats() {
    const { count: totalVillas } = await supabase.from('villas').select('*', { count: 'exact', head: true });
    const { count: availableVillas } = await supabase.from('villas').select('*', { count: 'exact', head: true }).eq('status', 'available');
    const { count: soldVillas } = await supabase.from('villas').select('*', { count: 'exact', head: true }).eq('status', 'sold');
    const { count: reservedVillas } = await supabase.from('villas').select('*', { count: 'exact', head: true }).eq('status', 'reserved');
    const { count: totalRegistrations } = await supabase.from('map_quick_registrations').select('*', { count: 'exact', head: true });
    const { count: convertedRegistrations } = await supabase.from('map_quick_registrations').select('*', { count: 'exact', head: true }).eq('status', 'converted');

    return {
      total_villas: totalVillas || 0,
      available_villas: availableVillas || 0,
      sold_villas: soldVillas || 0,
      reserved_villas: reservedVillas || 0,
      total_registrations: totalRegistrations || 0,
      converted_registrations: convertedRegistrations || 0
    };
  }
};