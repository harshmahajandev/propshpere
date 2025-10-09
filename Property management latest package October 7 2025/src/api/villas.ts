import { supabase } from '../lib/supabase'

export interface Villa {
  id: string
  project_id?: string
  unit_number: string
  status: 'available' | 'reserved' | 'sold' | 'under_construction'
  size_sqft?: number
  price: number
  floor_plan_url?: string
  position_x?: number
  position_y?: number
  project?: string
  title?: string
  bedrooms?: number
  bathrooms?: number
  description?: string
  created_at: string
  updated_at?: string
}

export interface QuickRegistrationData {
  villa_id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  interest_level: 'low' | 'medium' | 'high'
  budget_range: string
  preferred_contact_method: 'phone' | 'email' | 'whatsapp'
  preferred_contact_time: string
  notes?: string
}

export const villaApi = {
  // Get all villas for a specific project
  getVillasByProject: async (projectId: string): Promise<Villa[]> => {
    try {
      const { data, error } = await supabase
        .from('villas')
        .select('*')
        .eq('project_id', projectId)
        .order('unit_number')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching villas by project:', error)
      throw error
    }
  },

  // Get all villas with optional filters
  getAllVillas: async (filters?: {
    status?: string
    project?: string
    min_price?: number
    max_price?: number
    min_size?: number
    max_size?: number
  }): Promise<Villa[]> => {
    try {
      let query = supabase
        .from('villas')
        .select('*')
        .order('unit_number')
      
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.project) {
        query = query.eq('project', filters.project)
      }
      if (filters?.min_price) {
        query = query.gte('price', filters.min_price)
      }
      if (filters?.max_price) {
        query = query.lte('price', filters.max_price)
      }
      if (filters?.min_size) {
        query = query.gte('size_sqft', filters.min_size)
      }
      if (filters?.max_size) {
        query = query.lte('size_sqft', filters.max_size)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching villas:', error)
      throw error
    }
  },

  // Get a single villa by ID
  getVillaById: async (villaId: string): Promise<Villa | null> => {
    try {
      const { data, error } = await supabase
        .from('villas')
        .select('*')
        .eq('id', villaId)
        .maybeSingle()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching villa by ID:', error)
      throw error
    }
  },

  // Update villa status
  updateVillaStatus: async (villaId: string, status: Villa['status']): Promise<Villa> => {
    try {
      const { data, error } = await supabase
        .from('villas')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', villaId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating villa status:', error)
      throw error
    }
  },

  // Quick registration for a villa - creates a lead in the CRM
  quickRegisterLeadFromVilla: async (registrationData: QuickRegistrationData): Promise<{ lead_id: string; villa: Villa }> => {
    try {
      // First get the villa details
      const villa = await villaApi.getVillaById(registrationData.villa_id)
      if (!villa) {
        throw new Error('Villa not found')
      }

      // Create a lead directly in Supabase
      const leadData = {
        first_name: registrationData.customer_name.split(' ')[0] || registrationData.customer_name,
        last_name: registrationData.customer_name.split(' ').slice(1).join(' ') || '',
        email: registrationData.customer_email,
        phone: registrationData.customer_phone,
        preferred_language: 'en',
        buyer_type: 'retail',
        budget_min: parseInt(registrationData.budget_range.split('-')[0]) || villa.price * 0.8,
        budget_max: parseInt(registrationData.budget_range.split('-')[1]) || villa.price * 1.2,
        currency: 'BHD',
        property_interests: [villa.unit_number, villa.project || ''],
        timeline: 'immediate',
        status: 'new' as const,
        score: registrationData.interest_level === 'high' ? 90 : registrationData.interest_level === 'medium' ? 70 : 50,
        source: 'property_map',
        notes: [
          `Quick registration from Property Map for Villa ${villa.unit_number}`,
          `Interest level: ${registrationData.interest_level}`,
          `Budget range: ${registrationData.budget_range}`,
          `Preferred contact: ${registrationData.preferred_contact_method} at ${registrationData.preferred_contact_time}`,
          registrationData.notes ? `Additional notes: ${registrationData.notes}` : ''
        ].filter(Boolean)
      }

      // Create the lead directly in Supabase
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single()
      
      if (leadError) {
        throw new Error(`Failed to create lead: ${leadError.message}`)
      }

      // Update villa status to reserved temporarily (can be changed by sales team)
      if (villa.status === 'available' && registrationData.interest_level === 'high') {
        await villaApi.updateVillaStatus(villa.id, 'reserved')
      }

      return {
        lead_id: lead.id,
        villa: await villaApi.getVillaById(villa.id) || villa
      }
    } catch (error) {
      console.error('Error creating quick registration:', error)
      throw error
    }
  },

  // Get villa statistics
  getVillaStats: async (): Promise<{
    total: number
    available: number
    reserved: number
    sold: number
    under_construction: number
  }> => {
    try {
      const { data, error } = await supabase
        .from('villas')
        .select('status')
      
      if (error) throw error
      
      const stats = {
        total: data?.length || 0,
        available: 0,
        reserved: 0,
        sold: 0,
        under_construction: 0
      }
      
      data?.forEach(villa => {
        if (villa.status in stats) {
          stats[villa.status as keyof typeof stats]++
        }
      })
      
      return stats
    } catch (error) {
      console.error('Error fetching villa stats:', error)
      throw error
    }
  },

  // Search villas by unit number or project
  searchVillas: async (searchTerm: string): Promise<Villa[]> => {
    try {
      const { data, error } = await supabase
        .from('villas')
        .select('*')
        .or(`unit_number.ilike.%${searchTerm}%,project.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
        .order('unit_number')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching villas:', error)
      throw error
    }
  }
}
