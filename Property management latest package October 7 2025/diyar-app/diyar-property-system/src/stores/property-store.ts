import { create } from 'zustand'
import { supabase, type Property } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface PropertyState {
  properties: Property[]
  currentProperty: Property | null
  loading: boolean
  error: string | null
  filters: {
    search: string
    project: string
    type: string
    status: string
    priceRange: [number, number]
    location: string
  }
  
  // Actions
  fetchProperties: () => Promise<void>
  fetchProperty: (id: string) => Promise<void>
  createProperty: (property: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateProperty: (id: string, updates: Partial<Property>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  setFilters: (filters: Partial<PropertyState['filters']>) => void
  clearFilters: () => void
  clearError: () => void
}

const defaultFilters = {
  search: '',
  project: '',
  type: '',
  status: '',
  priceRange: [0, 1000000] as [number, number],
  location: '',
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  currentProperty: null,
  loading: false,
  error: null,
  filters: defaultFilters,

  fetchProperties: async () => {
    set({ loading: true, error: null })
    
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
      
      const { filters } = get()
      
      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,project.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
      }
      
      if (filters.project) {
        query = query.eq('project', filters.project)
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      
      // Price range filter
      if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000000) {
        query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1])
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      set({ properties: data || [], loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to fetch properties')
    }
  },

  fetchProperty: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      
      if (error) throw error
      
      set({ currentProperty: data, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to fetch property')
    }
  },

  createProperty: async (property) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        properties: [data, ...state.properties],
        loading: false
      }))
      
      toast.success('Property created successfully')
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to create property')
      throw error
    }
  },

  updateProperty: async (id: string, updates) => {
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      set((state) => ({
        properties: state.properties.map(p => p.id === id ? data : p),
        currentProperty: state.currentProperty?.id === id ? data : state.currentProperty,
        loading: false
      }))
      
      toast.success('Property updated successfully')
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to update property')
      throw error
    }
  },

  deleteProperty: async (id: string) => {
    set({ loading: true, error: null })
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set((state) => ({
        properties: state.properties.filter(p => p.id !== id),
        currentProperty: state.currentProperty?.id === id ? null : state.currentProperty,
        loading: false
      }))
      
      toast.success('Property deleted successfully')
    } catch (error: any) {
      set({ error: error.message, loading: false })
      toast.error(error.message || 'Failed to delete property')
      throw error
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }))
  },

  clearFilters: () => {
    set({ filters: defaultFilters })
  },

  clearError: () => set({ error: null }),
}))